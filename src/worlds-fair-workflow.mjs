const copy = (value) =>
  value == null ? value : JSON.parse(JSON.stringify(value));

export class WorldFairWorkflowError extends Error {
  constructor(code, message, httpStatus = 400, details = null) {
    super(message);
    this.name = 'WorldFairWorkflowError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

function requireRole(actor, allowed) {
  const role = actor?.role ?? null;
  if (!role) {
    throw new WorldFairWorkflowError(
      'WORLD_FAIR_ROLE_REQUIRED',
      'A World Fair operator or principal role is required.',
      401
    );
  }
  if (!allowed.includes(role)) {
    throw new WorldFairWorkflowError(
      'WORLD_FAIR_ROLE_FORBIDDEN',
      `Role ${role} cannot perform this action.`,
      403
    );
  }
  return role;
}

function requireIntent(record) {
  if (!record) {
    throw new WorldFairWorkflowError(
      'WORLD_FAIR_INTENT_NOT_FOUND',
      'The requested World Fair intent does not exist.',
      404
    );
  }
  return record;
}

function statusAllowed(record, allowed) {
  if (!allowed.includes(record.status)) {
    throw new WorldFairWorkflowError(
      'WORLD_FAIR_INTENT_STATE_CONFLICT',
      `Intent ${record.id} is ${record.status}; expected ${allowed.join(' or ')}.`,
      409,
      { intent: record }
    );
  }
}

function errorSummary(error) {
  return {
    name: String(error?.name ?? 'Error').slice(0, 120),
    code:
      error?.code === undefined || error?.code === null
        ? null
        : String(error.code).slice(0, 160),
    message: String(error?.message ?? error ?? 'UNKNOWN_ERROR').slice(0, 800)
  };
}

function event(record, type, actor, at, detail = null) {
  return {
    ...record,
    updatedAt: at,
    history: [
      ...(record.history ?? []),
      {
        at,
        type,
        actor: actor?.role ?? 'system',
        ...(detail == null ? {} : { detail: copy(detail) })
      }
    ]
  };
}

export function createMemoryWorldFairWorkflowStore(seed = []) {
  const records = new Map(
    seed.map((item) => [item.id, copy(item)])
  );

  return {
    async create(record) {
      if (!record?.id) {
        throw new WorldFairWorkflowError(
          'WORLD_FAIR_INTENT_ID_REQUIRED',
          'Intent id is required.',
          400
        );
      }
      if (records.has(record.id)) {
        throw new WorldFairWorkflowError(
          'WORLD_FAIR_INTENT_ALREADY_EXISTS',
          'Intent already exists.',
          409
        );
      }
      const stored = { ...copy(record), revision: 1 };
      records.set(stored.id, stored);
      return copy(stored);
    },

    async get(id) {
      return copy(records.get(id) ?? null);
    },

    async list() {
      return [...records.values()]
        .sort((a, b) =>
          String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''))
        )
        .map(copy);
    },

    async update(id, next, expectedRevision) {
      const current = records.get(id);
      if (!current) {
        throw new WorldFairWorkflowError(
          'WORLD_FAIR_INTENT_NOT_FOUND',
          'Intent does not exist.',
          404
        );
      }
      if (Number(current.revision) !== Number(expectedRevision)) {
        throw new WorldFairWorkflowError(
          'WORLD_FAIR_WORKFLOW_CONFLICT',
          'Intent changed while the operation was in progress.',
          409,
          { current: copy(current) }
        );
      }
      const stored = {
        ...copy(next),
        id,
        revision: Number(current.revision) + 1
      };
      records.set(id, stored);
      return copy(stored);
    }
  };
}

export function createWorldFairWorkflowService({
  provider,
  store,
  now = () => new Date().toISOString(),
  idFactory = () => crypto.randomUUID()
}) {
  if (!provider) throw new Error('WORLD_FAIR_PROVIDER_REQUIRED');
  if (!store) throw new Error('WORLD_FAIR_WORKFLOW_STORE_REQUIRED');

  const persist = async (current, next) =>
    store.update(current.id, next, current.revision);

  async function listIntents({ actor }) {
    requireRole(actor, ['operator', 'principal']);
    return store.list();
  }

  async function getIntent({ actor, id }) {
    requireRole(actor, ['operator', 'principal']);
    return requireIntent(await store.get(id));
  }

  async function submitIntent({ actor, inputAmountBaseUnits }) {
    requireRole(actor, ['operator']);

    const preview = await provider.previewTradeIntent({
      inputAmountBaseUnits
    });

    const createdAt = now();
    const id = `wf_${idFactory()}`;
    const status =
      preview.evaluation?.decision === 'ALLOW'
        ? 'READY_STANDING_EXECUTION'
        : preview.evaluation?.exceptionEligible === true
          ? 'PENDING_PRINCIPAL_DECISION'
          : 'REFUSED_HARD';

    const record = {
      id,
      type: 'WORLD_FAIR_TRADE_INTENT_V1',
      status,
      createdAt,
      updatedAt: createdAt,
      action: copy(preview.action),
      mandate: copy(preview.mandate),
      evaluation: copy(preview.evaluation),
      policyDiff: copy(preview.policyDiff),
      market: copy(preview.market),
      execution: null,
      exception: null,
      recovery: null,
      history: [
        {
          at: createdAt,
          type: 'INTENT_SUBMITTED',
          actor: 'operator',
          detail: {
            decision: preview.evaluation?.decision ?? 'UNKNOWN',
            exceptionEligible:
              preview.evaluation?.exceptionEligible === true
          }
        }
      ]
    };

    return store.create(record);
  }

  async function executeStanding({ actor, id }) {
    requireRole(actor, ['operator']);
    const current = requireIntent(await store.get(id));
    statusAllowed(current, ['READY_STANDING_EXECUTION']);

    // Persist intent reservation BEFORE any load-bearing Devnet write. This
    // optimistic-CAS transition makes competing requests fail closed.
    const reserved = await persist(current, event({
      ...current,
      status: 'EXECUTING_STANDING',
      recovery: {
        policy: 'RECONCILE_BEFORE_RETRY',
        automaticReplayAllowed: false
      }
    }, 'STANDING_EXECUTION_STARTED', actor, now()));

    try {
      const execution = await provider.executeStandingIntent({
        inputAmountBaseUnits: current.action.inputAmountBaseUnits,
        expectedNonce: current.mandate.nonce
      });
      let next = {
        ...reserved,
        status: 'EXECUTED',
        execution: copy(execution),
        recovery: null
      };
      next = event(next, 'STANDING_EXECUTED', actor, now(), {
        signature: execution.signature ?? null
      });
      return persist(reserved, next);
    } catch (error) {
      let next = {
        ...reserved,
        status: 'UNKNOWN',
        execution: {
          status: 'UNKNOWN',
          failure: errorSummary(error)
        },
        recovery: {
          policy: 'RECONCILE_BEFORE_RETRY',
          automaticReplayAllowed: false
        }
      };
      next = event(next, 'STANDING_EXECUTION_UNKNOWN', actor, now(), {
        failure: errorSummary(error)
      });
      const updated = await persist(reserved, next);
      throw new WorldFairWorkflowError(
        'WORLD_FAIR_EXECUTION_UNCONFIRMED',
        'Standing execution did not reach a safely proven outcome.',
        503,
        { intent: updated }
      );
    }
  }

  async function prepareException({ actor, id }) {
    requireRole(actor, ['principal']);
    const current = requireIntent(await store.get(id));
    statusAllowed(current, ['PENDING_PRINCIPAL_DECISION']);

    try {
      const prepared = await provider.prepareExceptionIntent({
        inputAmountBaseUnits: current.action.inputAmountBaseUnits,
        expectedNonce: current.mandate.nonce
      });
      let next = {
        ...current,
        status: 'PREPARED_FOR_ALLOW_ONCE',
        exception: {
          prepared: copy(prepared),
          grant: null
        }
      };
      next = event(next, 'EXCEPTION_PREPARED', actor, now(), {
        requestHash: prepared.requestHash,
        deadline: prepared.deadline
      });
      return persist(current, next);
    } catch (error) {
      const stale =
        String(error?.message ?? '').includes('StaleNonce') ||
        String(error?.code ?? '').includes('STALE');
      let next = {
        ...current,
        status: stale ? 'STALE' : 'UNKNOWN',
        recovery: {
          policy: stale
            ? 'CREATE_NEW_INTENT'
            : 'RECONCILE_BEFORE_RETRY',
          automaticReplayAllowed: false
        }
      };
      next = event(
        next,
        stale ? 'INTENT_STALE' : 'EXCEPTION_PREPARE_UNKNOWN',
        actor,
        now(),
        { failure: errorSummary(error) }
      );
      const updated = await persist(current, next);
      throw new WorldFairWorkflowError(
        stale ? 'WORLD_FAIR_INTENT_STALE' : 'WORLD_FAIR_PREPARE_UNCONFIRMED',
        stale
          ? 'The standing mandate changed; this intent is stale.'
          : 'Exception preparation did not reach a safely proven outcome.',
        stale ? 409 : 503,
        { intent: updated }
      );
    }
  }

  async function decideException({ actor, id, decision, note = '' }) {
    requireRole(actor, ['principal']);
    const current = requireIntent(await store.get(id));

    if (decision === 'REFUSE') {
      statusAllowed(current, [
        'PENDING_PRINCIPAL_DECISION',
        'PREPARED_FOR_ALLOW_ONCE'
      ]);
      let next = {
        ...current,
        status: 'REFUSED_BY_PRINCIPAL',
        principalDecision: {
          decision: 'REFUSE',
          note: String(note).slice(0, 280),
          decidedAt: now()
        }
      };
      next = event(next, 'PRINCIPAL_REFUSED', actor, now());
      return persist(current, next);
    }

    if (decision !== 'ALLOW_ONCE') {
      throw new WorldFairWorkflowError(
        'WORLD_FAIR_DECISION_UNSUPPORTED',
        'World Fair v1 supports only REFUSE or ALLOW_ONCE.',
        400
      );
    }

    statusAllowed(current, ['PREPARED_FOR_ALLOW_ONCE']);

    // An uncertain grant must not be sent twice. Reserve before issuance.
    const reserved = await persist(current, event({
      ...current,
      status: 'GRANTING_ALLOW_ONCE',
      recovery: {
        policy: 'RECONCILE_GRANT_BEFORE_RETRY',
        automaticReplayAllowed: false
      }
    }, 'ALLOW_ONCE_GRANT_STARTED', actor, now()));

    try {
      const grant = await provider.grantPreparedException({
        prepared: current.exception.prepared
      });
      let next = {
        ...reserved,
        status: 'ALLOW_ONCE_GRANTED',
        principalDecision: {
          decision: 'ALLOW_ONCE',
          note: String(note).slice(0, 280),
          decidedAt: now()
        },
        exception: {
          ...reserved.exception,
          grant: copy(grant)
        },
        recovery: null
      };
      next = event(next, 'ALLOW_ONCE_GRANTED', actor, now(), {
        allowance: grant.allowance,
        grantSignature: grant.grantSignature,
        requestHash: grant.requestHash
      });
      return persist(reserved, next);
    } catch (error) {
      let next = {
        ...reserved,
        status: 'UNKNOWN_GRANT',
        principalDecision: {
          decision: 'ALLOW_ONCE',
          note: String(note).slice(0, 280),
          decidedAt: now()
        },
        recovery: {
          policy: 'RECONCILE_GRANT_BEFORE_RETRY',
          automaticReplayAllowed: false
        }
      };
      next = event(next, 'ALLOW_ONCE_GRANT_UNKNOWN', actor, now(), {
        failure: errorSummary(error)
      });
      const updated = await persist(reserved, next);
      throw new WorldFairWorkflowError(
        'WORLD_FAIR_GRANT_UNCONFIRMED',
        'The one-use grant outcome is not safely confirmed.',
        503,
        { intent: updated }
      );
    }
  }

  async function executeException({ actor, id }) {
    requireRole(actor, ['operator']);
    const current = requireIntent(await store.get(id));
    statusAllowed(current, ['ALLOW_ONCE_GRANTED']);

    // Fail-closed reservation precedes the irrevocable exact-action attempt.
    const reserved = await persist(current, event({
      ...current,
      status: 'EXECUTING_EXCEPTION',
      recovery: {
        policy: 'RECONCILE_ALLOWANCE_BEFORE_RETRY',
        automaticReplayAllowed: false
      }
    }, 'EXCEPTION_EXECUTION_STARTED', actor, now()));

    try {
      const execution = await provider.executeGrantedException({
        grant: current.exception.grant
      });
      let next = {
        ...reserved,
        status: 'EXECUTED',
        execution: copy(execution),
        recovery: null
      };
      next = event(next, 'EXCEPTION_EXECUTED', actor, now(), {
        signature: execution.signature ?? null,
        allowanceConsumed: execution.allowanceConsumed === true
      });
      return persist(reserved, next);
    } catch (error) {
      let next = {
        ...reserved,
        status: 'UNKNOWN_EXECUTION',
        execution: {
          status: 'UNKNOWN',
          failure: errorSummary(error)
        },
        recovery: {
          policy: 'RECONCILE_ALLOWANCE_BEFORE_RETRY',
          automaticReplayAllowed: false
        }
      };
      next = event(next, 'EXCEPTION_EXECUTION_UNKNOWN', actor, now(), {
        failure: errorSummary(error)
      });
      const updated = await persist(reserved, next);
      throw new WorldFairWorkflowError(
        'WORLD_FAIR_EXCEPTION_EXECUTION_UNCONFIRMED',
        'Exceptional execution did not reach a safely proven outcome.',
        503,
        { intent: updated }
      );
    }
  }

  async function reconcile({ actor, id }) {
    requireRole(actor, ['operator', 'principal']);
    const current = requireIntent(await store.get(id));
    statusAllowed(current, [
      'UNKNOWN_GRANT',
      'UNKNOWN_EXECUTION',
      'GRANTING_ALLOW_ONCE',
      'EXECUTING_EXCEPTION'
    ]);

    const prepared = current.exception?.prepared ?? null;
    const grant = current.exception?.grant ?? null;

    if (!prepared && !grant) {
      throw new WorldFairWorkflowError(
        'WORLD_FAIR_RECONCILIATION_UNAVAILABLE',
        'This unknown intent has no exact exception material to reconcile safely.',
        409,
        { intent: current }
      );
    }

    const inspection = await provider.inspectPreparedException({
      prepared: prepared ?? grant.prepared
    });

    let status = current.status;
    let recovery = {
      policy: 'MANUAL_REVIEW_REQUIRED',
      automaticReplayAllowed: false
    };

    // A consumed allowance is only evidence for THIS intent when both
    // on-chain bindings match the prepared exception exactly. Missing proof
    // is treated as a mismatch; never promote it to recovered execution.
    const exactAllowance = inspection.allowanceFound === true &&
      inspection.requestHashMatches === true &&
      inspection.nonceMatches === true;
    if (inspection.allowanceFound && !exactAllowance) {
      status = current.status === 'EXECUTING_EXCEPTION' ||
        current.status === 'UNKNOWN_EXECUTION'
        ? 'UNKNOWN_EXECUTION' : 'UNKNOWN_GRANT';
      recovery = {
        policy: 'MANUAL_REVIEW_REQUIRED',
        automaticReplayAllowed: false,
        reason: 'ALLOWANCE_BINDING_UNVERIFIED'
      };
    } else if (exactAllowance && inspection.used) {
      status = 'EXECUTED_RECOVERED';
      recovery = {
        policy: 'NO_RETRY',
        automaticReplayAllowed: false,
        proof: 'ALLOWANCE_CONSUMED'
      };
    } else if (inspection.stale) {
      status = 'STALE';
      recovery = {
        policy: 'CREATE_NEW_INTENT',
        automaticReplayAllowed: false
      };
    } else if (
      exactAllowance &&
      !inspection.used &&
      inspection.deadlineStillValid
    ) {
      if (current.status === 'EXECUTING_EXCEPTION') {
        // An in-flight write can still commit after an early read sees
        // an unused allowance; do not reopen execution on that evidence.
        status = 'UNKNOWN_EXECUTION';
        recovery = {
          policy: 'MANUAL_REVIEW_REQUIRED',
          automaticReplayAllowed: false
        };
      } else {
        status = 'ALLOW_ONCE_GRANTED';
        recovery = {
          policy: 'EXACT_RETRY_AVAILABLE_AFTER_HUMAN_REVIEW',
          automaticReplayAllowed: false
        };
      }
    } else if (
      exactAllowance &&
      !inspection.deadlineStillValid
    ) {
      status = 'EXPIRED';
      recovery = {
        policy: 'CREATE_NEW_INTENT',
        automaticReplayAllowed: false
      };
    }

    if (current.status === 'GRANTING_ALLOW_ONCE' && !inspection.allowanceFound) {
      status = 'UNKNOWN_GRANT';
      recovery = {
        policy: 'MANUAL_REVIEW_REQUIRED',
        automaticReplayAllowed: false
      };
    }
    if (current.status === 'EXECUTING_EXCEPTION' && !inspection.allowanceFound) {
      status = 'UNKNOWN_EXECUTION';
      recovery = {
        policy: 'MANUAL_REVIEW_REQUIRED',
        automaticReplayAllowed: false
      };
    }

    let next = {
      ...current,
      status,
      recovery,
      reconciliation: {
        observedAt: now(),
        ...copy(inspection)
      }
    };
    next = event(next, 'INTENT_RECONCILED', actor, now(), inspection);
    return persist(current, next);
  }

  return {
    listIntents,
    getIntent,
    submitIntent,
    executeStanding,
    prepareException,
    decideException,
    executeException,
    reconcile
  };
}
