import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { demoOrganisation, demoWorkstreams, type OrganisationContext, type Workstream } from "@/lib/types";

export type TeamMember = { user_id: string; role: string; joined_at: string; display_name: string };

export async function getAppContext() {
  const configured = isSupabaseConfigured();
  let organisation: OrganisationContext = demoOrganisation;
  let workstreams: Workstream[] = demoWorkstreams;
  let userName = "Mandela Okeke";
  let userEmail: string | undefined;
  let userId: string | undefined;
  let members: TeamMember[] = [{ user_id: "demo", role: "owner", joined_at: new Date().toISOString(), display_name: userName }];

  if (!configured) return { configured, organisation, workstreams, userName, userEmail, userId, members };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/login");
  userId = String(claimsData.claims.sub);
  userEmail = typeof claimsData.claims.email === "string" ? claimsData.claims.email : undefined;

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    supabase.from("organisation_members").select("role, organisations(id, name)").eq("user_id", userId).limit(1),
  ]);
  if (profile?.full_name) userName = profile.full_name;
  const membership = memberships?.[0];
  const memberOrganisation = Array.isArray(membership?.organisations) ? membership.organisations[0] : membership?.organisations;

  if (memberOrganisation) {
    organisation = { id: memberOrganisation.id, name: memberOrganisation.name, role: String(membership?.role ?? "viewer").replaceAll("_", " ") };
    const [{ data: workstreamData }, { data: memberData }] = await Promise.all([
      supabase.from("workstreams").select("id, organisation_id, name, owner_name, milestone, risks, status, severity, progress, due_date").eq("organisation_id", organisation.id).order("created_at", { ascending: false }),
      supabase.from("organisation_members").select("user_id, role, joined_at").eq("organisation_id", organisation.id).order("joined_at", { ascending: true }),
    ]);
    workstreams = (workstreamData as Workstream[] | null) ?? [];
    members = (memberData ?? []).map((member) => ({ ...member, display_name: member.user_id === userId ? userName : `Team member ${member.user_id.slice(0, 5)}` }));
  }

  return { configured, organisation, workstreams, userName, userEmail, userId, members };
}
