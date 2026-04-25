import { createServerClient } from "@supabase/ssr/dist/module/createServerClient.js";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const LEGACY_DASHBOARD_PREFIX = "/dashboard";

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isProtectedPath(pathname: string) {
  return pathname === "/" || pathname.startsWith("/pelanggan");
}

function applyCookies(response: NextResponse, cookiesToSet: CookieToSet[]) {
  for (const cookie of cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
}

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookiesToSet: CookieToSet[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookiesToSet.push(...cookies);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthenticated = Boolean(user);

  if (pathname === LEGACY_DASHBOARD_PREFIX || pathname.startsWith(`${LEGACY_DASHBOARD_PREFIX}/`)) {
    const targetPath = pathname.replace(LEGACY_DASHBOARD_PREFIX, "") || "/";
    const redirectUrl = new URL(`${targetPath}${request.nextUrl.search}`, request.url);
    const response = NextResponse.redirect(redirectUrl);
    applyCookies(response, cookiesToSet);
    return response;
  }

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    applyCookies(response, cookiesToSet);
    return response;
  }

  if (isAuthPath(pathname) && isAuthenticated) {
    const response = NextResponse.redirect(new URL("/", request.url));
    applyCookies(response, cookiesToSet);
    return response;
  }

  const response = NextResponse.next();
  applyCookies(response, cookiesToSet);
  return response;
}

export const config = {
  matcher: [
    "/",
    "/pelanggan/:path*",
    "/login/:path*",
    "/register/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",
    "/dashboard/:path*",
  ],
};
