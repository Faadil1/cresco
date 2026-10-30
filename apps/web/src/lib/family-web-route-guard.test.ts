import { describe, expect, it } from "vitest";
import { familyWebRouteAllowed } from "./family-web-route-guard";

describe("isolated Family website routing", () => {
  it("allows only public landing, one-click demo and framework assets", () => {
    for (const path of ["/", "/try", "/_next/static/chunk.js", "/_vinext/something", "/favicon.ico"]) {
      expect(familyWebRouteAllowed(path)).toBe(true);
    }
  });
  it("refuses Capital and Colosseum-specific pages even when linked directly", () => {
    for (const path of [
      "/worlds-fair", "/family-practice", "/worlds-fair/desk", "/worlds-fair/technical", "/api", "/agent", "/start",
      "/how-it-works", "/family-admin", "/worlds-fair/desk/capital",\n      "/_next/image", "/_next/image?url=%2Ficon.svg&w=256&q=75",
      "/worlds-fair/desk-old", "/worlds-fair/run", "/api/v0.4/worlds-fair/openapi",
    ]) {
      expect(familyWebRouteAllowed(path)).toBe(false);
    }
  });
});
