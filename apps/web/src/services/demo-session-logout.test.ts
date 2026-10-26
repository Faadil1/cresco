import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  configureCrescoBackend,
  revokeAndClearBackendDemoSessions,
} from "./cresco-backend";

describe("Family demo sign-out server revocation", () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    window.localStorage.clear();
    configureCrescoBackend({ url: "https://cresco.example", timeoutMs: 100 });
  });
  afterEach(() => {
    configureCrescoBackend(null);
    globalThis.fetch = originalFetch;
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("revokes BOTH demo role sessions before clearing local storage", async () => {
    window.localStorage.setItem("cresco-session-child-v1", "child-token");
    window.localStorage.setItem("cresco-session-guardian-v1", "guardian-token");
    window.localStorage.setItem("cresco-session-active-role-v1", "child");

    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => new Response(
      JSON.stringify({ revoked: true }), { status: 200 },
    ));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    expect(await revokeAndClearBackendDemoSessions()).toEqual({
      localCleared: true,
      remoteRevoked: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(([, init]) => init.headers.authorization).sort())
      .toEqual(["Bearer child-token", "Bearer guardian-token"]);
    expect(window.localStorage.getItem("cresco-session-child-v1")).toBeNull();
    expect(window.localStorage.getItem("cresco-session-guardian-v1")).toBeNull();
    expect(window.localStorage.getItem("cresco-session-active-role-v1")).toBeNull();
  });

  it("reports uncertain server revocation but always clears the device", async () => {
    window.localStorage.setItem("cresco-session-guardian-v1", "guardian-token");
    globalThis.fetch = vi.fn(async () => { throw new Error("offline"); }) as unknown as typeof fetch;

    expect(await revokeAndClearBackendDemoSessions()).toEqual({
      localCleared: true,
      remoteRevoked: false,
    });
    expect(window.localStorage.getItem("cresco-session-guardian-v1")).toBeNull();
  });

  it("does not misreport a rejected response as revoked", async () => {
    window.localStorage.setItem("cresco-session-child-v1", "child-token");
    globalThis.fetch = vi.fn(async () => new Response(
      JSON.stringify({ error: "FAMILY_SESSION_REQUIRED" }), { status: 401 },
    )) as unknown as typeof fetch;

    expect(await revokeAndClearBackendDemoSessions()).toEqual({
      localCleared: true,
      remoteRevoked: false,
    });
  });
});
