import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicUrl } from "@/lib/public-url";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const isAuthPage = request.nextUrl.pathname === "/login";
  const isProtected =
    request.nextUrl.pathname === "/" ||
    ["/workspace", "/reports", "/team", "/settings", "/help"].some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

  if (!isAuthenticated && isProtected) {
    const loginUrl = getPublicUrl("/login", request.headers, request.nextUrl.origin);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isAuthPage) {
    const dashboardUrl = getPublicUrl("/", request.headers, request.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
