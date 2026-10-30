import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { familyWebRouteAllowed } from "./lib/family-web-route-guard";

export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY !== "1") {
    return NextResponse.next();
  }
  // Do not expose World's Fair Capital screens or internal routes on the
  // Family-only Cloudflare Worker, even when directly visited/bookmarked.
  const pathname = request.nextUrl.pathname;
  if (!familyWebRouteAllowed(pathname)) {
    return new NextResponse("This deployment is Family-only.", {
      status: 404,
      headers: { "cache-control": "no-store" },
    });
  }
  return NextResponse.next();
}

export const config = {
  // Ensure /_next/image cannot bypass the Family-only route gate.
  matcher: ["/((?!_next/static).*)"],
};
