const CANONICAL_PROGRAM = "ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk";
const CANONICAL_PROOF_RUN = "36150024852";

const directionMeta = {
  garden: { number: "01", name: "Key Garden", lens: "Territory · tactile autonomy" },
  playground: { number: "02", name: "Market Playground", lens: "Discovery · playful markets" },
  family: { number: "03", name: "Family Room", lens: "Relationship · shared trust" },
  passport: { number: "04", name: "Financial Passport", lens: "Credential · legible authority" },
  atlas: { number: "05", name: "Market Atlas", lens: "Spatial · navigable markets" },
  instrument: { number: "06", name: "Family Capital Instrument", lens: "Editorial · premium agreement" }
};

function parityResultText() {
  const last = sandbox.lastDecision;
  if (!last) return { tone: "neutral", label: "Ready", body: "Run the same scenario in any direction." };

  if (last.decision === "ALLOW") {
    if (last.reason === "ALLOW_ONCE") {
      return {
        tone: "allow",
        label: "ALLOW · ONCE USED",
        body: `Exact ${money(last.amount)} action passed. Key v${last.standingVersionBefore} → v${last.standingVersionAfter}; boundary unchanged.`
      };
    }
    return {
      tone: "allow",
      label: "ALLOW · INSIDE",
      body: `${money(last.amount)} passed without guardian approval inside Key v${sandbox.mandate.version}.`
    };
  }

  if (last.decision === "REFUSE") {
    const messages = {
      ACTION_LIMIT_EXCEEDED: "Boundary reached. Ask for the exact $12 action or change the action.",
      ALLOWANCE_ACTION_MISMATCH: "Tamper proof: Sam approved $12, so the changed $11 action refuses.",
      ALLOWANCE_ALREADY_USED: "Replay proof: the one-time $12 permission was already consumed.",
      ALLOWANCE_STALE: "The permission belongs to an older Key state.",
      PERIOD_LIMIT_EXCEEDED: "The weekly boundary is exhausted.",
      MANDATE_NOT_ACTIVE: "This Key is not active."
    };
    return { tone: "refuse", label: "REFUSE", body: messages[last.reason] || "The action is outside the current Key." };
  }

  if (last.decision === "REQUESTED") {
    return { tone: "request", label: "BOUNDARY REQUEST", body: "Alex asked for one exact $12 AAPL action. Standing Key unchanged." };
  }
  if (last.decision === "GUARDIAN_ALLOW_ONCE") {
    return { tone: "request", label: "ONE-TIME READY", body: `$12 once is ready. Standing Key v${sandbox.mandate.version} is unchanged.` };
  }
  if (last.decision === "GUARDIAN_WIDEN") {
    return { tone: "allow", label: "NEW STANDING KEY", body: `Sam created Key v${sandbox.mandate.version}. Growth was explicit, not earned automatically.` };
  }
  if (last.decision === "GUARDIAN_DENY") {
    return { tone: "refuse", label: "NOT THIS TIME", body: `Key v${sandbox.mandate.version} remains unchanged.` };
  }
  if (last.decision === "PRACTICE_BUY") {
    return { tone: "practice", label: "PRACTICE", body: "Virtual money changed. Standing authority did not." };
  }
  return { tone: "neutral", label: "READY", body: "Run the parity scenario." };
}

function parityHistoryMarkup() {
  if (!sandbox.events.length) {
    return '<p class="parity-empty">Boundary history will appear here. In-bounds activity is intentionally not a surveillance feed.</p>';
  }
  return sandbox.events.slice(0, 6).map((event) => `
    <li>
      <span class="parity-event-dot"></span>
      <div>
        <strong>${event.label}</strong>
        <small>${new Date(event.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
      </div>
    </li>
  `).join("");
}

function parityTemplate(direction) {
  const meta = directionMeta[direction];
  return `
    <div class="parity-console parity-${direction}">
      <header class="parity-head">
        <div>
          <span class="parity-kicker">FUNCTIONAL PARITY · SAME CRESCO</span>
          <h2>${meta.name}</h2>
          <p>${meta.lens}. Same state machine, same evidence, same product truth as the other five directions.</p>
        </div>
        <span class="parity-route-number">${meta.number}</span>
      </header>

      <div class="parity-status-grid">
        <article><small>STANDING KEY</small><strong data-parity-version>Key v1</strong><span data-parity-limit>$10 / action</span></article>
        <article><small>THIS WEEK</small><strong data-parity-spent>$0 / $50</strong><span>Money lane · AAPL</span></article>
        <article><small>ONE-TIME</small><strong data-parity-allowance>None</strong><span>Exception ≠ precedent</span></article>
        <article><small>PRACTICE</small><strong data-parity-practice-cash>$1,000 virtual</strong><span>Never changes authority</span></article>
      </div>

      <div class="parity-workbench">
        <section class="parity-scenario">
          <div class="parity-section-title"><span>01</span><div><strong>Run the authority loop</strong><small>Same buttons in all six directions.</small></div></div>
          <div class="parity-actions">
            <button type="button" data-parity-action="inside">Inside · $5</button>
            <button type="button" data-parity-action="boundary">Boundary · $12</button>
            <button type="button" data-parity-action="ask">Ask · exact $12</button>
            <button type="button" data-parity-action="tamper">Tamper · $11</button>
            <button type="button" data-parity-action="exact">Exact · $12</button>
            <button type="button" data-parity-action="replay">Replay · $12</button>
          </div>
          <div class="parity-result neutral" data-parity-result aria-live="polite"></div>
        </section>

        <section class="parity-guardian">
          <div class="parity-section-title"><span>02</span><div><strong>Guardian at the boundary</strong><small>Not this time · Once · New standing room.</small></div></div>
          <div class="parity-request-card" data-parity-request><p>No boundary request yet. Run “Boundary · $12”, then “Ask · exact $12”.</p></div>
          <div class="parity-guardian-actions">
            <button type="button" data-parity-guardian-action="deny">Not this time</button>
            <button type="button" data-parity-guardian-action="allow-once">Allow once</button>
            <button type="button" data-parity-guardian-action="widen">Widen the Key</button>
          </div>
        </section>
      </div>

      <div class="parity-support-grid">
        <section class="parity-practice-card">
          <div class="parity-section-title"><span>03</span><div><strong>Learning + Practice</strong><small>Context without authority unlocks.</small></div></div>
          <p>Try a live-market concept with virtual money. The Key remains untouched.</p>
          <div class="parity-inline-actions">
            <button type="button" data-parity-action="practice">Practice $25 AAPL</button>
            <button type="button" data-parity-action="practice-reset">Reset Practice</button>
          </div>
          <div class="parity-representation-row"><span>Tessera · representation literacy</span><span>PreStocks · Learn/Practice only</span></div>
        </section>

        <section class="parity-proof-card">
          <div class="parity-section-title"><span>04</span><div><strong>Canonical proof</strong><small>Real Devnet evidence, separate from this sandbox.</small></div></div>
          <div class="parity-proof-sequence"><span>$12 approved</span><b>→</b><span>$11 REFUSE</span><b>→</b><span>$12 ALLOW</span><b>→</b><span>Replay REFUSE</span></div>
          <p><strong>Key v7 → v7.</strong> Exact-action proof run ${CANONICAL_PROOF_RUN}. Program <code>${CANONICAL_PROGRAM.slice(0, 8)}…</code>.</p>
          <span class="parity-proof-rule">The UI isn\'t the guard. The capital path is.</span>
        </section>

        <section class="parity-history-card">
          <div class="parity-section-title"><span>05</span><div><strong>My Key history</strong><small>Boundary moments, not surveillance.</small></div></div>
          <ol data-parity-history class="parity-history"></ol>
        </section>
      </div>

      <footer class="parity-footer">
        <div><strong>Evaluation mode</strong><span>Shared local sandbox state across all six directions. Live market reads; no canonical mutations.</span></div>
        <button type="button" data-parity-action="reset">Reset shared scenario</button>
      </footer>
    </div>
  `;
}

function mountParityBoards() {
  document.querySelectorAll("[data-capability-mount]").forEach((mount) => {
    mount.innerHTML = parityTemplate(mount.dataset.direction);
  });

  document.querySelectorAll("[data-parity-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.parityAction;
      if (action === "inside") tryMoneyMove(5);
      if (action === "boundary") tryMoneyMove(12);
      if (action === "ask") createBoundaryRequest(12, false);
      if (action === "tamper") tryMoneyMove(11);
      if (action === "exact" || action === "replay") tryMoneyMove(12);
      if (action === "practice") practiceBuy("Equity.US.AAPL/USD", 25);
      if (action === "practice-reset") resetPractice();
      if (action === "reset") resetSandbox();
    });
  });

  document.querySelectorAll("[data-parity-guardian-action]").forEach((button) => {
    button.addEventListener("click", () => guardianDecision(button.dataset.parityGuardianAction));
  });
}

window.renderParityBoards = function renderParityBoards() {
  const m = sandbox.mandate;
  const allowance = sandbox.allowanceOnce;
  const result = parityResultText();

  document.querySelectorAll("[data-capability-mount]").forEach((mount) => {
    mount.querySelectorAll("[data-parity-version]").forEach((el) => { el.textContent = `Key v${m.version}`; });
    mount.querySelectorAll("[data-parity-limit]").forEach((el) => { el.textContent = `${money(m.maxAction)} / action`; });
    mount.querySelectorAll("[data-parity-spent]").forEach((el) => { el.textContent = `${money(m.spent)} / ${money(m.weeklyLimit)}`; });
    mount.querySelectorAll("[data-parity-practice-cash]").forEach((el) => { el.textContent = `${money(sandbox.practice.cash)} virtual`; });
    mount.querySelectorAll("[data-parity-allowance]").forEach((el) => {
      el.textContent = allowance ? (allowance.used ? "Used" : `${money(allowance.amount)} ready`) : "None";
    });

    const resultBox = mount.querySelector("[data-parity-result]");
    if (resultBox) {
      resultBox.className = `parity-result ${result.tone}`;
      resultBox.innerHTML = `<strong>${result.label}</strong><span>${result.body}</span>`;
    }

    const requestBox = mount.querySelector("[data-parity-request]");
    if (requestBox) {
      const req = sandbox.pendingRequest;
      requestBox.innerHTML = req
        ? `<small>${req.id}</small><strong>AAPL BUY · ${money(req.amount)}</strong><span>Status · ${req.status.replaceAll("_", " ")}</span><p>Standing Key v${req.standingVersion ?? m.version}; exact request, not a permanent limit change.</p>`
        : "<p>No boundary request yet. Run “Boundary · $12”, then “Ask · exact $12”.</p>";
    }

    mount.querySelectorAll("[data-parity-guardian-action]").forEach((button) => {
      button.disabled = !sandbox.pendingRequest || sandbox.pendingRequest.status !== "PENDING";
    });

    const history = mount.querySelector("[data-parity-history]");
    if (history) history.innerHTML = parityHistoryMarkup();
  });
};

mountParityBoards();
window.renderParityBoards();
