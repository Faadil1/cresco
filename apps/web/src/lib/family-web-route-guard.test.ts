import { describe, expect, it } from "vitest";
import { familyWebRouteAllowed } from "./family-web-route-guard";

describe("isolated Family website routing", () => {
  it("allows only Family landing, invited practice and required framework assets", () => {
    for (const path of ["/", "/family-practice", "/_next/static/chunk.js", "/_vinext/something", "/favicon.ico"]) {
      expect(familyWebRouteAllowed(path)).toBe(true);
    }
  });
  it("refuses Capital and Colosseum-specific pages even when linked directly", () => {
    for (const path of [
      "/worlds-fair", "/worlds-fair/desk", "/worlds-fair/technical", "/api", "/agent", "/start",
      "/how-it-works", "/family-admin", "/worlds-fair/desk/capital",
      "/worlds-fair/desk-old", "/worlds-fair/run", "/api/v0.4/worlds-fair/openapi",
    ]) {
      expect(familyWebRouteAllowed(path)).toBe(false);
    }
  });
});
