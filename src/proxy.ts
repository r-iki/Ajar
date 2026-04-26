import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const protectedPrefixes = ["/dashboard", "/my-courses", "/learn", "/certificates", "/studio", "/admin"];

function hasSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("better-auth.session"));
}

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const locale = routing.locales.includes(segments[0] as (typeof routing.locales)[number])
    ? segments[0]
    : routing.defaultLocale;
  const pathnameWithoutLocale = `/${segments.slice(1).join("/")}`;

  const needsAuth = protectedPrefixes.some(
    (prefix) => pathnameWithoutLocale === prefix || pathnameWithoutLocale.startsWith(`${prefix}/`),
  );

  if (needsAuth && !hasSessionCookie(request)) {
    const signInUrl = new URL(`/${locale}/sign-in`, request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: ["/", "/(id|en)/:path*", "/((?!api|_next|.*\\..*).*)"],
};
