"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthState = {
  error?: string;
  success?: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signIn(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Connect Supabase to enable secure sign in." };
  }

  const email = value(formData, "email");
  const password = value(formData, "password");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/");
}

export async function signUp(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Connect Supabase to create organisations and users." };
  }

  const fullName = value(formData, "fullName");
  const accountType = value(formData, "accountType") === "individual" ? "individual" : "organisation";
  const submittedOrganisationName = value(formData, "organisationName");
  const organisationName =
    accountType === "individual"
      ? `${fullName || "My"}'s workspace`
      : submittedOrganisationName;
  const email = value(formData, "email");
  const password = value(formData, "password");

  if (!fullName || !organisationName || !email || password.length < 8) {
    return {
      error:
        accountType === "individual"
          ? "Add your name, email, and a password with at least 8 characters."
          : "Add your name, organisation, email, and a password with at least 8 characters.",
    };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
      data: {
        full_name: fullName,
        organisation_name: organisationName,
        account_type: accountType,
      },
    },
  });

  if (error) return { error: error.message };
  if (data.session) redirect("/");

  return {
    success: "Check your inbox to confirm your email and finish setup.",
  };
}

export async function requestPasswordReset(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Connect Supabase to reset passwords." };
  }

  const email = value(formData, "email");
  if (!email) return { error: "Enter the email address for your account." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset`,
  });

  if (error) return { error: error.message };
  return { success: "Check your inbox for a secure password reset link." };
}

export async function updatePassword(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Connect Supabase to update passwords." };
  }

  const password = value(formData, "password");
  if (password.length < 8) {
    return { error: "Use a password with at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/");
}
