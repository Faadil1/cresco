import test from "node:test";
import assert from "node:assert/strict";

import { FamilyState } from "../src/cloudflare-family-state.mjs";
import { handleFamilyApi } from "../src/cloudflare-family-api.mjs";

function demoEnv() {
  const memory = new Map();
  const state = new FamilyState({
    storage: {
      get: async (key) => memory.get(key),
      put: async (key, value) => memory.set(key, structuredClone(value)),
      delete: async (key) => memory.delete(key),
    },
  });
  return {
    FAMILY_STATE: {
      idFromName: (name) => name,
      get: () => ({
        fetch: (url, init = {}) => state.fetch(new Request(url, init)),
      }),
    },
  };
}

function api(path, { token, body, method = "POST" } = {}) {
  return new Request(`https://keys.example${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test("logging out revokes the exact presented guardian demo token and prevents further privileged access", async () => {
  const env = demoEnv();
  const login = await handleFamilyApi(api("/api/v0.2/auth/demo-session", {
    body: { role: "guardian", displayName: "Demo parent" },
  }), env);
  assert.equal(login.status, 200);
  const { token } = await login.json();
  assert.equal(typeof token, "string");

  const before = await handleFamilyApi(api("/api/v0.2/family/state", {
    token, method: "GET",
  }), env);
  assert.equal(before.status, 200);

  const logout = await handleFamilyApi(api("/api/v0.2/auth/logout", { token }), env);
  assert.equal(logout.status, 200);
  assert.deepEqual(await logout.json(), { revoked: true });

  const after = await handleFamilyApi(api("/api/v0.2/family/state", {
    token, method: "GET",
  }), env);
  assert.equal(after.status, 401);
  assert.equal((await after.json()).error, "FAMILY_SESSION_REQUIRED");

  const afterWrite = await handleFamilyApi(api("/api/v0.2/funding/deposits", {
    token, body: { amount: 10 },
  }), env);
  assert.equal(afterWrite.status, 401);

  const again = await handleFamilyApi(api("/api/v0.2/auth/logout", { token }), env);
  assert.equal(again.status, 401);
});

test("logout ignores body-supplied target tokens and revokes only its own bearer", async () => {
  const env = demoEnv();
  const firstResponse = await handleFamilyApi(api("/api/v0.2/auth/demo-session", {
    body: { role: "guardian", displayName: "Parent 1" },
  }), env);
  const first = await firstResponse.json();

  const secondResponse = await handleFamilyApi(api("/api/v0.2/auth/demo-session", {
    body: { role: "guardian", displayName: "Parent 2" },
  }), env);
  const second = await secondResponse.json();

  const noBearer = await handleFamilyApi(api("/api/v0.2/auth/logout", {
    body: { token: second.token },
  }), env);
  assert.equal(noBearer.status, 401);

  const withBody = await handleFamilyApi(api("/api/v0.2/auth/logout", {
    token: first.token, body: { token: second.token },
  }), env);
  assert.equal(withBody.status, 200);

  const revoked = await handleFamilyApi(api("/api/v0.2/family/state", {
    token: first.token, method: "GET",
  }), env);
  assert.equal(revoked.status, 401);

  const otherStillWorks = await handleFamilyApi(api("/api/v0.2/family/state", {
    token: second.token, method: "GET",
  }), env);
  assert.equal(otherStillWorks.status, 200);
});

test("both child and guardian demo tokens can be independently revoked", async () => {
  const env = demoEnv();
  for (const role of ["child", "guardian"]) {
    const loggedIn = await handleFamilyApi(api("/api/v0.2/auth/demo-session", {
      body: { role, displayName: "Demo" },
    }), env);
    const { token } = await loggedIn.json();
    assert.equal((await handleFamilyApi(api("/api/v0.2/auth/logout", { token }), env)).status, 200);
    assert.equal((await handleFamilyApi(api("/api/v0.2/family/state", {
      token, method: "GET",
    }), env)).status, 401);
  }
});
