"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export async function updateWorkspaceSettings(formData: FormData) {
  const supabase = await createClient(); const { data } = await supabase.auth.getClaims(); if (!data?.claims) return;
  const userId = String(data.claims.sub); const fullName = String(formData.get("fullName") ?? "").trim(); const organisationId = String(formData.get("organisationId") ?? ""); const organisationName = String(formData.get("organisationName") ?? "").trim();
  if (fullName) await supabase.from("profiles").update({ full_name: fullName, updated_at: new Date().toISOString() }).eq("id", userId);
  if (organisationId && organisationName) await supabase.from("organisations").update({ name: organisationName, updated_at: new Date().toISOString() }).eq("id", organisationId);
  revalidatePath("/", "layout");
}
