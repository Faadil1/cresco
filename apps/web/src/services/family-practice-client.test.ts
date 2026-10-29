import { afterEach, describe, expect, it, vi } from "vitest";
import { configureCrescoBackend } from "./cresco-backend";
import {
  createPracticeSession, loadPracticeState, requestPracticeDiscussion,
  savePracticeCredits, decidePracticeDiscussion, rotatePracticeTeenCode
} from "./family-practice-client";

const ID = "00000000-0000-4000-8000-000000000001";
const CRED = { practiceId: ID, role: "teen" as const, token: "pr_" + "a".repeat(64) };

afterEach(() => {
  configureCrescoBackend(null);
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("standalone fictional-practice client", () => {
  it("requires Family build and refuses all historic Stocklana endpoints", async () => {
    configureCrescoBackend({ url: "https://keys-api-stocklana.faadil-casecraft.workers.dev" });
    await expect(loadPracticeState(CRED)).rejects.toMatchObject({ code: "FAMILY_ONLY_REQUIRED" });
    vi.stubEnv("NEXT_PUBLIC_CRESCO_FAMILY_ONLY", "1");
    await expect(loadPracticeState(CRED)).rejects.toMatchObject({ code: "HISTORIC_API_FORBIDDEN" });
    configureCrescoBackend({ url: "" });
    await expect(loadPracticeState(CRED)).rejects.toMatchObject({ code: "FAMILY_API_NOT_CONFIGURED" });
  });

  it("keeps Parent and Teen credentials only in request headers and uses practice-only paths", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRESCO_FAMILY_ONLY", "1");
    configureCrescoBackend({ url: "https://cresco-family-api.example.test" });
    const calls: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Response.json({ kind: "FICTIONAL_CREDITS_ONLY" });
    }));
    await createPracticeSession("private-invite-code");
    await loadPracticeState(CRED);
    await savePracticeCredits(CRED);
    await requestPracticeDiscussion(CRED);
    await decidePracticeDiscussion(
      { practiceId: ID, role: "parent", token: "pr_" + "b".repeat(64) },
      "00000000-0000-4000-8000-000000000002", "DECLINE", "NOT_RIGHT_NOW"
    );
    expect(calls).toHaveLength(5);
    expect(calls.every(c => c.url.startsWith("https://cresco-family-api.example.test/api/family-practice/v1/"))).toBe(true);
    expect(calls[0].init.headers).toMatchObject({ "x-cresco-family-practice-invite": "private-invite-code" });
    expect(calls[1].init.headers).toMatchObject({ authorization: "Bearer " + CRED.token });
    expect(calls[2].init.headers).toMatchObject({ authorization: "Bearer " + CRED.token });
    expect(calls[2].init.headers).toHaveProperty("x-practice-action-id");
    expect(calls[4].init.headers).toMatchObject({ authorization: "Bearer " + "pr_" + "b".repeat(64) });
    expect(calls.every(c => !c.url.includes("pr_") && !c.url.includes("invite"))).toBe(true);
    expect(calls.every(c => c.init.cache === "no-store")).toBe(true);
    expect(calls.every(c => c.init.credentials === "include")).toBe(true);
  });

  it("never treats failed or malformed practice response as a confirmed outcome", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRESCO_FAMILY_ONLY", "1");
    configureCrescoBackend({ url: "https://cresco-family-api.example.test" });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "ROLE_INVALID" }, { status: 403 })));
    await expect(loadPracticeState(CRED)).rejects.toMatchObject({ code: "ROLE_INVALID", status: 403 });
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unverified", { status: 200 })));
    await expect(loadPracticeState(CRED)).rejects.toMatchObject({ code: "PRACTICE_RESPONSE_INVALID" });
  });
  it("allows only a Parent role to request Teen-code replacement, without URL tokens", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRESCO_FAMILY_ONLY", "1");
    configureCrescoBackend({ url: "https://cresco-family-api.example.test" });
    await expect(rotatePracticeTeenCode(CRED)).rejects.toMatchObject({ code: "PARENT_ONLY", status: 403 });
    const calls: { url: string; init: RequestInit }[] = [];
    const fresh = "pr_" + "c".repeat(64);
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Response.json({ rotated: true, teenToken: fresh, notice: "Shown once" });
    }));
    const parent = { ...CRED, role: "parent" as const, token: "pr_" + "b".repeat(64) };
    const rotated = await rotatePracticeTeenCode(parent);
    expect(rotated.teenToken).toBe(fresh);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("/teen/rotate");
    expect(calls[0].url).not.toContain(parent.token);
    expect(calls[0].init.headers).toMatchObject({ authorization: "Bearer " + parent.token });
    expect(calls[0].init.cache).toBe("no-store");
  });

});
