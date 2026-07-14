import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = request.nextUrl.clone();
  destination.pathname = code ? "/update-password" : "/forgot-password";
  destination.search = "";

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
