// Pure route gate for the independently built Cresco Family site.
// This never affects the canonical Colosseum build.
export function familyWebRouteAllowed(pathname: string): boolean {
  const path = pathname.split("?")[0];
  return path === "/" ||
    path === "/try" ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/icon.svg" ||
    // Static assets are allowed, but the dynamic image optimizer is not.
    path.startsWith("/_next/static/") ||
    path.startsWith("/_vinext/");
}
