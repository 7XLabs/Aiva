import { NextRequest, NextResponse } from "next/server";

// Optional access control: set DASHBOARD_TOKEN and the dashboard + data APIs
// require it. Visit /dashboard?token=YOURTOKEN once — a cookie keeps you in.
// Leave the env var unset for open local development.

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/api/dashboard",
  "/api/tasks",
  "/api/waitlist",
  "/api/appointments",
  "/api/orders",
  "/api/digest",
  "/api/calls",
  "/api/faq-suggestions",
  "/api/businesses",
];

export function middleware(req: NextRequest) {
  const token = process.env.DASHBOARD_TOKEN;
  if (!token) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Already authenticated?
  if (req.cookies.get("aiva_token")?.value === token) {
    return NextResponse.next();
  }

  // First visit with ?token= — set the cookie and continue.
  const supplied =
    req.nextUrl.searchParams.get("token") ??
    req.headers.get("x-aiva-token");
  if (supplied === token) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("token");
    const res = NextResponse.redirect(url);
    res.cookies.set("aiva_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return new NextResponse(
    "401 — this dashboard is protected. Append ?token=YOUR_TOKEN to the URL.",
    { status: 401 }
  );
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
