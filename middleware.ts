import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
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
