import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/public-url";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const code = request.nextUrl.searchParams.get("code");
  const redirectTo = getPublicUrl("/", request.headers, request.nextUrl.origin);

  const supabase = await createClient();
  const result = tokenHash && type
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Missing confirmation token") };

  if (!result.error) return NextResponse.redirect(redirectTo);

  redirectTo.pathname = "/login";
  redirectTo.searchParams.set("error", "confirmation");
  return NextResponse.redirect(redirectTo);
}
