import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  demoOrganisation,
  demoWorkstreams,
  type OrganisationContext,
  type Workstream,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  let organisation: OrganisationContext = demoOrganisation;
  let workstreams: Workstream[] = demoWorkstreams;
  let userName = "Mandela Okeke";
  let userEmail: string | undefined;

  if (configured) {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    if (!claimsData?.claims) redirect("/login");

    const userId = String(claimsData.claims.sub);
    userEmail = typeof claimsData.claims.email === "string" ? claimsData.claims.email : undefined;

    const [{ data: profile }, { data: memberships }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
      supabase
        .from("organisation_members")
        .select("role, organisations(id, name)")
        .eq("user_id", userId)
        .limit(1),
    ]);

    if (profile?.full_name) userName = profile.full_name;
    const membership = memberships?.[0];
    const memberOrganisation = Array.isArray(membership?.organisations)
      ? membership.organisations[0]
      : membership?.organisations;

    if (memberOrganisation) {
      organisation = {
        id: memberOrganisation.id,
        name: memberOrganisation.name,
        role: String(membership?.role ?? "viewer").replaceAll("_", " "),
      };
      const { data } = await supabase
        .from("workstreams")
        .select("id, organisation_id, name, owner_name, milestone, risks, status, severity, progress, due_date")
        .eq("organisation_id", organisation.id)
        .order("created_at", { ascending: false });
      workstreams = (data as Workstream[] | null) ?? [];
    }
  }

  return (
    <AppShell active="dashboard" organisation={organisation} userName={userName} userEmail={userEmail} configured={configured}>
      <DashboardView workstreams={workstreams} userName={userName} />
    </AppShell>
  );
}
