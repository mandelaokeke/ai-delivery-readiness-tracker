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
  const organisationName = value(formData, "organisationName");
  const email = value(formData, "email");
  const password = value(formData, "password");

  if (!fullName || !organisationName || !email || password.length < 8) {
    return {
      error:
        "Add your name, organisation, email, and a password with at least 8 characters.",
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
      },
    },
  });

  if (error) return { error: error.message };
  if (data.session) redirect("/");

  return {
    success: "Check your inbox to confirm your email and finish setup.",
  };
}
