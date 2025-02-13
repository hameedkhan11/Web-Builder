import { auth, clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ['/', '/site', '/api/uploadthing'];

export default clerkMiddleware(async (auth, req) => {
  // Get necessary request information
  // if(!publicRoutes.includes(req.nextUrl.pathname)) await auth.protect();
  const { nextUrl } = req;
  console.log("nextUrl", nextUrl);
  const searchParams = nextUrl.searchParams.toString();
  const hostname = req.headers.get("host");

  // Construct full path with search parameters
  const pathWithSearchParams = `${nextUrl.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // Handle subdomain routing
  const customSubDomain = hostname
    ?.split(process.env.NEXT_PUBLIC_DOMAIN!)
    .filter(Boolean)[0];

  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    );
  }

  // Authentication routes redirect
  if (nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/agency/sign-in", req.url));
  }

  // Home and site routes
  if (
    nextUrl.pathname === "/" ||
    (nextUrl.pathname === "/site" && nextUrl.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL("/site", req.url));
  }

  // Agency and subaccount routes
  if (
    nextUrl.pathname.startsWith("/agency") ||
    nextUrl.pathname.startsWith("/subaccount")
  ) {
    return NextResponse.rewrite(new URL(pathWithSearchParams, req.url));
  }
});

// Configure middleware matcher
export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};