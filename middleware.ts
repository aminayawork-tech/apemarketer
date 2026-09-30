import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/enter-password",
  "/api/verify-password",
  "/_next",
  "/favicon.ico",
  "/logo.png",
  "/icons",
  "/sw.js",
  "/manifest",
  "/.well-known",
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths through without password check
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!isPublic && process.env.SITE_PASSWORD) {
    const cookie = req.cookies.get("site-auth");
    if (!cookie || cookie.value !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/enter-password";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isProtected = createRouteMatcher(["/app(.*)"]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return clerkMiddleware(async (auth: any) => {
    if (isProtected(req)) await auth.protect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })(req, {} as any);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
