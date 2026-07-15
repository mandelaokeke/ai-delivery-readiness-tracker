import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/public-url";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = getPublicUrl(code ? "/update-password" : "/forgot-password", request.headers, request.nextUrl.origin);

  if (!code) {
    destination.searchParams.set("error", "invalid-link");
    return NextResponse.redirect(destination);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    destination.pathname = "/forgot-password";
    destination.searchParams.set("error", "expired-link");
  }

  return NextResponse.redirect(destination);
}
