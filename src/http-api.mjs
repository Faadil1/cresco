import mayaFixture from '../fixtures/frontend-maya-contract.json' with { type: 'json' };
import mayaV2Fixture from '../fixtures/frontend-maya-v0.2-contract.json' with { type: 'json' };

import {
  FRONTEND_CONTRACT_VERSION,
  evaluateProposalForFrontend,
  mandateReviewForFrontend,
  transitionMandateForFrontend,
  executionEligibilityForFrontend
} from './frontend-api.mjs';

import {
  PYTH_PRO_EQUITY_FEEDS,
  fetchPythProSnapshot
} from './pyth-adapter.mjs';

import {
  commitMandateTransitionForFrontend
} from './authority-runtime.mjs';

import {
  V2_CONTRACT_VERSION,
  buildBoundaryRequest,
  evaluateBoundedAction
} from './bounded-autonomy.mjs';

import {
  fetchPreStocksCatalog,
  preStocksIntegrationSummary
} from './prestocks-adapter.mjs';

import {
  fetchTesseraCatalog,
  tesseraIntegrationSummary
} from './tessera-adapter.mjs';

import {
  configuredDevnetExecutionProviderFromEnv
} from './devnet-execution-provider.mjs';

import {
  configuredWorldFairOrcaProviderFromEnv
} from './worlds-fair-orca-provider.mjs';

import {
  createWorldFairWorkflowService,
  WorldFairWorkflowError
} from './worlds-fair-workflow.mjs';

const JSON_HEADERS = Object.freeze({
  'content-type': 'application/json; charset=utf-8'
});

export const CANONICAL_DEVNET_PROGRAM_ID =
  'ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk';

export const CANONICAL_DEVNET_EXPLORER =
  `https://explorer.solana.com/address/${CANONICAL_DEVNET_PROGRAM_ID}?cluster=devnet`;

export const CANONICAL_DEVNET_PROOF_RUN =
  'https://github.com/Faadil1/cresco/actions/runs/35959137364';

export const CANONICAL_PYTH_PROOF_RUN =
  'https://github.com/Faadil1/cresco/actions/runs/36034651466';

async function defaultMarketEvidenceProvider({ asset, now }) {
  const feed = PYTH_PRO_EQUITY_FEEDS[asset];

  if (!feed) {
    return {
      source: 'PYTH_PRO',
      symbol: asset ?? null,
      status: 'UNAVAILABLE',
      reasonCode: 'PYTH_FEED_NOT_CONFIGURED',
      receivedAt: now
    };
  }

  return fetchPythProSnapshot({
    apiKey: process.env.PYTH_PRO_API_KEY,
    feed,
    receivedAt: now
  });
}

async function defaultEligibilityProvider() {
  return { status: 'UNKNOWN' };
}

function liveDemoAsset() {
  const requested = process.env.CRESCO_DEMO_LIVE_EQUITY || 'AAPL';
  return PYTH_PRO_EQUITY_FEEDS[requested] ? requested : 'AAPL';
}

function buildMayaLiveScenario(asset) {
  return {
    beneficiary: { ...mayaFixture.beneficiary },
    charter: {
      expiresAt: null,
      assetUniverse: [asset],
      maxProposalNotional: 50,
      maxBoundedNotional: 25
    },
    mandate: {
      stage: mayaFixture.mandate.stage,
      version: mayaFixture.mandate.version,
      nonce: mayaFixture.mandate.nonce
    },
    proposal: {
      ...mayaFixture.proposal,
      id: `maya-${asset.toLowerCase()}-live-001`,
      asset,
      rationale: 'I want to study a company I can explain before any authority changes.',
      counterargument: 'A compelling company story can still be a poor investment at the wrong price.',
      invalidation: 'I would reconsider if the original business thesis materially changes.'
    }
  };
}

function publicProofEnvelope() {
  return {
    solana: {
      network: 'devnet',
      status: 'VERIFIED',
      programId: CANONICAL_DEVNET_PROGRAM_ID,
      explorerUrl: CANONICAL_DEVNET_EXPLORER,
      canonicalProofRun: CANONICAL_DEVNET_PROOF_RUN
    },
    pyth: {
      status: 'VERIFIED_LIVE_EQUITY',
      canonicalProofRun: CANONICAL_PYTH_PROOF_RUN,
      secretExposedToFrontend: false
    }
  };
}

function capabilitiesForServices(services = {}) {
  return {
    contractVersion: FRONTEND_CONTRACT_VERSION,
    mode: 'LOCAL_DEMO',
    marketEvidence: {
      status: services.marketEvidenceProvider
        ? 'PROVIDER_READY'
        : process.env.PYTH_PRO_API_KEY
          ? 'PYTH_CONFIGURED'
          : 'BLOCKED_API_KEY'
    },
    authorityCommit: {
      status: services.authorityTransitionProvider
        ? 'RUNTIME_READY'
        : 'RUNTIME_UNAVAILABLE'
    },
    executionEligibility: {
      status: services.eligibilityProvider
        ? 'PROVIDER_READY'
        : 'UNKNOWN_DEFAULT'
    },
    simulation: {
      status: 'AVAILABLE'
    },
    liveDemoProof: {
      status: services.marketEvidenceProvider
        ? 'PROVIDER_READY'
        : process.env.PYTH_PRO_API_KEY
          ? 'LIVE_EVIDENCE_READY'
          : 'BLOCKED_API_KEY',
      selectedEquity: liveDemoAsset(),
      route: '/api/v0.1/demo/live-proof',
      solanaProgramId: CANONICAL_DEVNET_PROGRAM_ID
    },
    v2: {
      contractVersion: V2_CONTRACT_VERSION,
      status: 'FROZEN_RUNTIME_PROVEN',
      demoRoute: '/api/v0.2/demo/maya',
      actionEvaluationRoute: '/api/v0.2/actions/evaluate',
      boundaryRequestRoute: '/api/v0.2/boundary-requests',
      executionRoute: '/api/v0.2/actions/execute',
      demoRuntimeRoute: '/api/v0.2/demo/runtime',
      executionStatus:
        services.executionProvider ||
        (process.env.DEVNET_KEYPAIR_JSON && process.env.PYTH_PRO_API_KEY)
          ? 'SERVER_HELD_DEVNET_DEMO_READY'
          : 'RUNTIME_SECRETS_REQUIRED',
      canonicalDevnetProofRun: CANONICAL_DEVNET_PROOF_RUN,
      onchainPythVerification: true,
      realMinorSecuritiesExecution: false
    }
  };
}

async function resolveBackendEvidence({ body, services }) {
  const now = body?.now ?? new Date().toISOString();
  const marketEvidenceProvider =
    services?.marketEvidenceProvider ?? defaultMarketEvidenceProvider;
  const eligibilityProvider =
    services?.eligibilityProvider ?? defaultEligibilityProvider;

  const market = await marketEvidenceProvider({
    asset: body?.proposal?.asset,
    proposal: body?.proposal,
    charter: body?.charter,
    mandate: body?.mandate,
    now
  });

  const eligibility = await eligibilityProvider({
    proposal: body?.proposal,
    charter: body?.charter,
    mandate: body?.mandate,
    now
  });

  return { now, market, eligibility };
}

export async function routeCrescoHttp({
  method,
  path,
  body = null,
  services = {}
}) {
  if (method === 'OPTIONS') {
    return {
      status: 204,
      headers: JSON_HEADERS,
      body: null
    };
  }

  if (method === 'GET' && path === '/health') {
    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        ok: true,
        service: 'cresco-backend',
        contractVersion: V2_CONTRACT_VERSION,
        legacyContractVersion: FRONTEND_CONTRACT_VERSION
      }
    };
  }

  if (method === 'GET' && path === '/api/v0.1/capabilities') {
    return {
      status: 200,
      headers: JSON_HEADERS,
      body: capabilitiesForServices(services)
    };
  }

  if (method === 'GET' && path === '/api/v0.1/demo/maya') {
    return {
      status: 200,
      headers: JSON_HEADERS,
      body: mayaFixture
    };
  }

  if (method === 'GET' && ['/api/v0.2/demo/maya', '/api/v0.2/draft/demo/maya'].includes(path)) {
    return {
      status: 200,
      headers: JSON_HEADERS,
      body: mayaV2Fixture
    };
  }

  if (method === 'GET' && path === '/api/v0.2/integrations/prestocks') {
    const provider =
      services?.preStocksCatalogProvider ?? (() => fetchPreStocksCatalog());
    const assets = await provider();

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        contractVersion: V2_CONTRACT_VERSION,
        type: 'PRESTOCKS_INTEGRATION_CATALOG',
        integration: preStocksIntegrationSummary(),
        assets
      }
    };
  }

  const preStocksAssetMatch =
    method === 'GET'
      ? path.match(/^\/api\/v0\.2\/integrations\/prestocks\/([A-Za-z0-9_-]+)$/)
      : null;

  if (preStocksAssetMatch) {
    const provider =
      services?.preStocksCatalogProvider ?? (() => fetchPreStocksCatalog());
    const assets = await provider();
    const symbol = preStocksAssetMatch[1].toUpperCase();
    const asset = assets.find(
      (item) => String(item?.symbol ?? '').toUpperCase() === symbol
    );

    if (!asset) {
      return {
        status: 404,
        headers: JSON_HEADERS,
        body: {
          contractVersion: V2_CONTRACT_VERSION,
          error: 'PRESTOCK_NOT_FOUND',
          symbol
        }
      };
    }

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        contractVersion: V2_CONTRACT_VERSION,
        type: 'PRESTOCKS_INTEGRATION_ASSET',
        integration: preStocksIntegrationSummary(),
        asset
      }
    };
  }

  if (method === 'GET' && path === '/api/v0.2/integrations/tessera') {
    const provider =
      services?.tesseraCatalogProvider ?? (() => fetchTesseraCatalog());
    const assets = await provider();

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        contractVersion: V2_CONTRACT_VERSION,
        type: 'TESSERA_INTEGRATION_CATALOG',
        integration: tesseraIntegrationSummary(),
        assets
      }
    };
  }

  const tesseraAssetMatch =
    method === 'GET'
      ? path.match(/^\/api\/v0\.2\/integrations\/tessera\/([A-Za-z0-9_-]+)$/)
      : null;

  if (tesseraAssetMatch) {
    const provider =
      services?.tesseraCatalogProvider ?? (() => fetchTesseraCatalog());
    const assets = await provider();
    const lookup = tesseraAssetMatch[1]
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const asset = assets.find((item) =>
      [item?.id, item?.code, item?.symbol, item?.underlyingCompany]
        .map((value) =>
          String(value ?? '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
        )
        .includes(lookup)
    );

    if (!asset) {
      return {
        status: 404,
        headers: JSON_HEADERS,
        body: {
          contractVersion: V2_CONTRACT_VERSION,
          error: 'TESSERA_ASSET_NOT_FOUND',
          query: tesseraAssetMatch[1]
        }
      };
    }

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        contractVersion: V2_CONTRACT_VERSION,
        type: 'TESSERA_INTEGRATION_ASSET',
        integration: tesseraIntegrationSummary(),
        asset
      }
    };
  }

  if (method === 'POST' && ['/api/v0.2/actions/evaluate', '/api/v0.2/draft/actions/evaluate'].includes(path)) {
    const now = body?.now ?? new Date().toISOString();
    const requiresMarketEvidence = body?.assetRule?.requiresMarketEvidence === true;
    let market = null;

    if (requiresMarketEvidence) {
      const marketEvidenceProvider =
        services?.marketEvidenceProvider ?? defaultMarketEvidenceProvider;
      market = await marketEvidenceProvider({
        asset: body?.action?.asset,
        action: body?.action,
        assetRule: body?.assetRule,
        mandate: body?.mandate,
        now
      });
    }

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        ...evaluateBoundedAction({
          mandate: body?.mandate,
          assetRule: body?.assetRule,
          action: body?.action,
          market,
          now
        }),
        type: 'V0_2_ACTION_EVALUATION',
        runtimeProofStatus: 'CANONICAL_DEVNET_RUNTIME_PROVEN'
      }
    };
  }


  // This is a real multi-role API candidate, not a simulated judge sequence.
  // Actor role must have been authenticated by the hosting adapter.
  const workflowRoot = '/api/v0.3/worlds-fair/workflow';
  if (path === workflowRoot || path.startsWith(workflowRoot + '/')) {
    const actor = services.worldFairActor;
    if (!actor || !['operator', 'principal'].includes(actor.role)) {
      return {
        status: 401,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_WORKFLOW',
          status: 'REFUSED',
          error: 'WORLD_FAIR_ROLE_REQUIRED'
        }
      };
    }

    const provider =
      services.worldFairExecutionProvider ??
      configuredWorldFairOrcaProviderFromEnv();
    const store = services.worldFairWorkflowStore;
    if (!provider || !store) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_WORKFLOW',
          status: 'BLOCKED',
          error: 'WORLD_FAIR_WORKFLOW_RUNTIME_UNAVAILABLE'
        }
      };
    }

    const workflow = createWorldFairWorkflowService({
      provider,
      store
    });
    const suffix = path.slice(workflowRoot.length);
    const listPath = suffix === '/intents';
    const match = suffix.match(
      /^\/intents\/(wf_[a-zA-Z0-9_-]+)(?:\/(execute-standing|prepare-exception|decision|execute-exception|reconcile))?$/
    );
    const input = body ?? {};
    const plainInput =
      input !== null && typeof input === 'object' && !Array.isArray(input);
    const keys = plainInput ? Object.keys(input) : [];

    try {
      let value = null;
      let httpStatus = 200;
      if (method === 'GET' && listPath) {
        value = { intents: await workflow.listIntents({ actor }) };
      } else if (method === 'POST' && listPath) {
        if (
          !plainInput ||
          keys.length !== 1 ||
          keys[0] !== 'inputAmountBaseUnits'
        ) {
          throw new WorldFairWorkflowError(
            'WORLD_FAIR_INTENT_INPUT_INVALID',
            'An exact inputAmountBaseUnits field is required.',
            400
          );
        }
        value = {
          intent: await workflow.submitIntent({
            actor,
            inputAmountBaseUnits: input.inputAmountBaseUnits
          })
        };
        httpStatus = 201;
      } else if (match && method === 'GET' && !match[2]) {
        value = {
          intent: await workflow.getIntent({
            actor,
            id: match[1]
          })
        };
      } else if (
        match &&
        method === 'POST' &&
        match[2] &&
        (match[2] === 'decision' ||
          (plainInput && keys.length === 0))
      ) {
        const id = match[1];
        const operation = match[2];
        if (operation === 'decision') {
          if (
            !plainInput ||
            keys.some((key) => !['decision', 'note'].includes(key)) ||
            !['REFUSE', 'ALLOW_ONCE'].includes(input.decision) ||
            (input.note !== undefined && typeof input.note !== 'string')
          ) {
            throw new WorldFairWorkflowError(
              'WORLD_FAIR_DECISION_INPUT_INVALID',
              'Only REFUSE or ALLOW_ONCE with an optional note is accepted.',
              400
            );
          }
          value = {
            intent: await workflow.decideException({
              actor,
              id,
              decision: input.decision,
              note: input.note ?? ''
            })
          };
        } else {
          const fn = {
            'execute-standing': 'executeStanding',
            'prepare-exception': 'prepareException',
            'execute-exception': 'executeException',
            reconcile: 'reconcile'
          }[operation];
          value = { intent: await workflow[fn]({ actor, id }) };
        }
      } else {
        throw new WorldFairWorkflowError(
          'WORLD_FAIR_WORKFLOW_ROUTE_NOT_FOUND',
          'This World Fair workflow operation is not supported.',
          404
        );
      }

      return {
        status: httpStatus,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_WORKFLOW',
          status: 'OK',
          ...value
        }
      };
    } catch (error) {
      const domainError = error instanceof WorldFairWorkflowError;
      return {
        status: domainError ? error.httpStatus : 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_WORKFLOW',
          status: domainError && error.httpStatus < 500 ? 'REFUSED' : 'UNKNOWN',
          error: domainError ? error.code : 'WORLD_FAIR_WORKFLOW_UNCONFIRMED',
          message: domainError ? error.message : 'The workflow outcome could not be proven safely.',
          ...(domainError && error.details?.intent
            ? { intent: error.details.intent }
            : {})
        }
      };
    }
  }

  if (method === 'GET' && path === '/api/v0.3/worlds-fair/runtime') {
    const worldFairProvider =
      services?.worldFairExecutionProvider ??
      configuredWorldFairOrcaProviderFromEnv();

    if (!worldFairProvider) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_RUNTIME_UNAVAILABLE',
          error: 'WORLD_FAIR_SERVER_RUNTIME_UNAVAILABLE',
          requiredServerSecrets: [
            'DEVNET_KEYPAIR_JSON',
            'PYTH_PRO_API_KEY',
            'SOLANA_DEVNET_RPC_URL'
          ],
          truthBoundary: {
            secretsRemainServerSide: true,
            mainnet: false
          }
        }
      };
    }

    try {
      return {
        status: 200,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_OPERATOR_LAB_RUNTIME',
          ...(await worldFairProvider.getPublicState())
        }
      };
    } catch (error) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_OPERATOR_LAB_RUNTIME',
          status: 'UNKNOWN',
          error: 'WORLD_FAIR_RUNTIME_STATE_UNAVAILABLE',
          message: error?.message ?? 'World’s Fair runtime unavailable'
        }
      };
    }
  }

  if (method === 'POST' && path === '/api/v0.3/worlds-fair/run') {
    const worldFairProvider =
      services?.worldFairExecutionProvider ??
      configuredWorldFairOrcaProviderFromEnv();

    if (!worldFairProvider) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_OPERATOR_LAB_RUN',
          status: 'UNKNOWN',
          error: 'WORLD_FAIR_SERVER_RUNTIME_UNAVAILABLE',
          receipt: null
        }
      };
    }

    const requestedScenario = body?.scenario ?? 'CANONICAL_LIVE';
    const unexpectedKeys =
      body && typeof body === 'object'
        ? Object.keys(body).filter((key) => key !== 'scenario')
        : [];

    if (
      requestedScenario !== 'CANONICAL_LIVE' ||
      unexpectedKeys.length > 0
    ) {
      return {
        status: 400,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_OPERATOR_LAB_RUN',
          status: 'REFUSED',
          error: 'WORLD_FAIR_SCOPE_FIXED',
          allowedScenario: 'CANONICAL_LIVE',
          arbitraryProgramIdAccepted: false,
          arbitraryPoolAccepted: false,
          arbitraryInstructionAccepted: false
        }
      };
    }

    try {
      const receipt = await worldFairProvider.runCanonicalSequence();
      return {
        status: 200,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_OPERATOR_LAB_RUN',
          status: receipt?.status === 'PASS' ? 'PASS' : 'UNKNOWN',
          receipt
        }
      };
    } catch (error) {
      const diagnostic =
        error?.worldFairDiagnostic ?? {
          phase: 'RUN_UNKNOWN',
          phaseKind: 'WRITE',
          failureClass: 'UNKNOWN_RUNTIME',
          reasonCode: 'WORLD_FAIR_RUNTIME_FAILURE',
          retryPolicy: 'REQUIRES_STATE_RECONCILIATION',
          message:
            'The live sequence stopped before CRESCO could prove a complete outcome.'
        };

      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: '0.3',
          type: 'WORLD_FAIR_OPERATOR_LAB_RUN',
          status: 'UNKNOWN',
          error: 'WORLD_FAIR_LIVE_RUN_UNCONFIRMED',
          diagnostic,
          message: diagnostic.message,
          partialReceipt: error?.worldFairPartialReceipt ?? null,
          receipt: null
        }
      };
    }
  }

  if (method === 'GET' && path === '/api/v0.2/demo/runtime') {
    const executionProvider =
      services?.executionProvider ??
      configuredDevnetExecutionProviderFromEnv();

    if (!executionProvider) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: V2_CONTRACT_VERSION,
          error: 'DEVNET_EXECUTION_RUNTIME_UNAVAILABLE',
          requiredServerSecrets: [
            'DEVNET_KEYPAIR_JSON',
            'PYTH_PRO_API_KEY'
          ],
          truthBoundary: {
            serverHeldDemoSigner: true,
            realMinorSecuritiesExecution: false
          }
        }
      };
    }

    try {
      return {
        status: 200,
        headers: JSON_HEADERS,
        body: {
          contractVersion: V2_CONTRACT_VERSION,
          type: 'V0_2_DEVNET_DEMO_RUNTIME',
          ...(await executionProvider.getState())
        }
      };
    } catch (error) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: V2_CONTRACT_VERSION,
          error: 'DEVNET_EXECUTION_RUNTIME_NOT_READY',
          message: error?.message ?? 'Runtime unavailable'
        }
      };
    }
  }

  if (method === 'POST' && path === '/api/v0.2/actions/execute') {
    const executionProvider =
      services?.executionProvider ??
      configuredDevnetExecutionProviderFromEnv();

    if (!executionProvider) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: V2_CONTRACT_VERSION,
          error: 'DEVNET_EXECUTION_RUNTIME_UNAVAILABLE',
          executionProof: null
        }
      };
    }

    try {
      const result = await executionProvider.execute({
        asset: body?.asset,
        type: body?.type,
        notional: body?.notional,
        expectedNonce: body?.expectedNonce,
        idempotencyKey: body?.idempotencyKey
      });

      return {
        status: 200,
        headers: JSON_HEADERS,
        body: {
          contractVersion: V2_CONTRACT_VERSION,
          type: 'V0_2_ACTION_EXECUTION',
          runtimeMode: 'SERVER_HELD_DEVNET_DEMO',
          idempotencyScope:
            executionProvider.idempotencyScope ?? 'UNSPECIFIED',
          ...result
        }
      };
    } catch (error) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: {
          contractVersion: V2_CONTRACT_VERSION,
          error: 'DEVNET_EXECUTION_RUNTIME_ERROR',
          message: error?.message ?? 'Runtime execution unavailable',
          executionProof: null
        }
      };
    }
  }

  if (method === 'POST' && ['/api/v0.2/boundary-requests', '/api/v0.2/draft/boundary-requests'].includes(path)) {
    return {
      status: 200,
      headers: JSON_HEADERS,
      body: buildBoundaryRequest({
        mandate: body?.mandate,
        assetRule: body?.assetRule,
        action: body?.action,
        reasoningCommitmentHash: body?.reasoningCommitmentHash,
        condition: body?.condition ?? null,
        now: body?.now ?? new Date().toISOString()
      })
    };
  }

  if (method === 'GET' && path === '/api/v0.1/demo/live-proof') {
    const asset = liveDemoAsset();
    const scenario = buildMayaLiveScenario(asset);
    const now = new Date().toISOString();
    const marketEvidenceProvider =
      services?.marketEvidenceProvider ?? defaultMarketEvidenceProvider;

    const market = await marketEvidenceProvider({
      asset,
      proposal: scenario.proposal,
      charter: scenario.charter,
      mandate: scenario.mandate,
      now
    });

    const evaluation = evaluateProposalForFrontend({
      charter: scenario.charter,
      mandate: scenario.mandate,
      proposal: scenario.proposal,
      market,
      eligibility: { status: 'UNKNOWN' },
      now
    });

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        contractVersion: FRONTEND_CONTRACT_VERSION,
        type: 'LIVE_DEMO_PROOF',
        mode: 'LIVE_BACKEND_EVIDENCE',
        beneficiary: scenario.beneficiary,
        scenario: {
          asset,
          proposal: scenario.proposal,
          mandate: scenario.mandate
        },
        evaluation,
        proofs: publicProofEnvelope(),
        truthBoundary: {
          marketEvidenceCreatesAuthority: false,
          executionEligibility: 'UNKNOWN',
          realSecuritiesExecution: false,
          liveEvidenceAsset: asset
        }
      }
    };
  }

  if (method === 'POST' && path === '/api/v0.1/proposals/evaluate') {
    const resolved = await resolveBackendEvidence({ body, services });

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: evaluateProposalForFrontend({
        charter: body?.charter,
        mandate: body?.mandate,
        proposal: body?.proposal,
        market: resolved.market,
        eligibility: resolved.eligibility,
        now: resolved.now
      })
    };
  }

  if (
    method === 'POST' &&
    path === '/api/v0.1/simulations/proposals/evaluate'
  ) {
    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        ...evaluateProposalForFrontend({
          charter: body?.charter,
          mandate: body?.mandate,
          proposal: body?.proposal,
          market: body?.market,
          eligibility: body?.eligibility ?? { status: 'UNKNOWN' },
          now: body?.now
        }),
        type: 'SIMULATION_PROPOSAL_EVALUATION',
        simulation: true
      }
    };
  }

  if (method === 'POST' && path === '/api/v0.1/mandates/review') {
    return {
      status: 200,
      headers: JSON_HEADERS,
      body: mandateReviewForFrontend(body ?? {})
    };
  }

  if (
    method === 'POST' &&
    path === '/api/v0.1/mandates/transition/preview'
  ) {
    return {
      status: 200,
      headers: JSON_HEADERS,
      body: {
        ...transitionMandateForFrontend(body ?? {}),
        type: 'MANDATE_TRANSITION_PREVIEW',
        preview: true,
        authorityCommitted: false
      }
    };
  }

  if (method === 'POST' && path === '/api/v0.1/mandates/transition') {
    const result = await commitMandateTransitionForFrontend({
      request: body ?? {},
      authorityTransitionProvider: services?.authorityTransitionProvider
    });

    const unavailable = [
      'AUTHORITY_RUNTIME_UNAVAILABLE',
      'AUTHORITY_RUNTIME_ERROR'
    ].includes(result.reasonCode);

    return {
      status: unavailable ? 503 : 200,
      headers: JSON_HEADERS,
      body: result
    };
  }

  if (method === 'POST' && path === '/api/v0.1/execution/evaluate') {
    const resolved = await resolveBackendEvidence({ body, services });

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: executionEligibilityForFrontend({
        charter: body?.charter,
        mandate: body?.mandate,
        proposal: body?.proposal,
        market: resolved.market,
        eligibility: resolved.eligibility,
        now: resolved.now
      })
    };
  }

  return {
    status: 404,
    headers: JSON_HEADERS,
    body: {
      error: 'NOT_FOUND',
      path
    }
  };
}
