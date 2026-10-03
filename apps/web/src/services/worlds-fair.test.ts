import { afterEach, describe, expect, it, vi } from "vitest";

import {
  configureCrescoBackend,
  runWorldFairCanonicalLiveSequence,
  WorldFairLiveRunError,
} from "./cresco-backend";

afterEach(() => {
  configureCrescoBackend(null);
  vi.unstubAllGlobals();
});

describe("World’s Fair live adapter diagnostics", () => {
  it("surfaces sanitized phase diagnostics and a partial receipt", async () => {
    configureCrescoBackend({
      url: "https://api.example.test",
      execution: "runtime",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            contractVersion: "0.3",
            type: "WORLD_FAIR_OPERATOR_LAB_RUN",
            status: "UNKNOWN",
            error: "WORLD_FAIR_LIVE_RUN_UNCONFIRMED",
            diagnostic: {
              phase: "STANDING_2_EXECUTE",
              phaseKind: "WRITE",
              failureClass: "UNKNOWN_CONFIRMATION",
              reasonCode: "SOLANA_CONFIRMATION_UNCERTAIN",
              retryPolicy: "REQUIRES_STATE_RECONCILIATION",
              message:
                "A submitted Solana transaction did not reach a confirmed state before CRESCO could prove its outcome.",
            },
            partialReceipt: {
              schemaVersion: 2,
              type: "CRESCO_WORLD_FAIR_OPERATOR_LAB_RECEIPT",
              status: "UNKNOWN",
              productState: "WORLD_FAIR_OPERATOR_LAB_PARTIAL",
              observedAt: "2026-10-03T00:00:00Z",
              network: "solana-devnet",
              programId: "program",
              programSha256: "sha",
              principal: "principal",
              delegate: "delegate",
              mandate: "mandate",
              startingNonce: 7,
              scenarios: {},
              progress: {
                currentPhase: "STANDING_2_EXECUTE",
                completedPhases: ["STANDING_1_EXECUTE"],
                confirmedEffects: [
                  {
                    label: "standingAutonomy.1",
                    signature: "sig-confirmed",
                  },
                ],
              },
            },
            receipt: null,
          }),
          {
            status: 503,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    let caught: unknown = null;
    try {
      await runWorldFairCanonicalLiveSequence();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(WorldFairLiveRunError);
    const failure = caught as WorldFairLiveRunError;
    expect(failure.code).toBe("WORLD_FAIR_LIVE_RUN_UNCONFIRMED");
    expect(failure.diagnostic.phase).toBe("STANDING_2_EXECUTE");
    expect(failure.diagnostic.reasonCode).toBe(
      "SOLANA_CONFIRMATION_UNCERTAIN",
    );
    expect(failure.partialReceipt?.progress?.confirmedEffects[0]?.signature).toBe(
      "sig-confirmed",
    );
  });

  it("treats browser timeout on a POST as state-reconciliation required", async () => {
    configureCrescoBackend({
      url: "https://api.example.test",
      execution: "runtime",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("timeout", "TimeoutError");
      }),
    );

    await expect(runWorldFairCanonicalLiveSequence()).rejects.toMatchObject({
      name: "WorldFairLiveRunError",
      code: "WORLD_FAIR_RUN_NETWORK_OR_TIMEOUT",
      diagnostic: {
        retryPolicy: "REQUIRES_STATE_RECONCILIATION",
        phase: "CLIENT_HTTP_POST",
      },
    });
  });
});
