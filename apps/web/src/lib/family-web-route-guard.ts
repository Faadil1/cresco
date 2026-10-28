// Pure route gate for the independently built Cresco Family site.
// This never affects the canonical Colosseum build.
export function familyWebRouteAllowed(pathname: string): boolean {
  const path = pathname.split("?")[0];
  return path === "/" ||
    path === "/worlds-fair/desk" ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/icon.svg" ||
    path.startsWith("/_next/") ||
    path.startsWith("/_vinext/");
}
