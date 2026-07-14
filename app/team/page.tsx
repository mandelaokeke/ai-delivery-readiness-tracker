import { Mail, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getAppContext } from "@/lib/app-context";
export const dynamic = "force-dynamic";
export default async function TeamPage() {
  const c = await getAppContext();
  const subject = encodeURIComponent(`Join ${c.organisation.name} on MANDAI`);
  const body = encodeURIComponent(`Join our delivery workspace at ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-delivery-readiness-tracker-1.onrender.com"}/login`);
  return <AppShell active="team" organisation={c.organisation} userName={c.userName} userEmail={c.userEmail} configured={c.configured} workstreamCount={c.workstreams.length}><section className="page-heading"><div><span className="eyebrow">Organisation access</span><h1>Team</h1><p>See who can access this delivery workspace.</p></div><a className="primary-action" href={`mailto:?subject=${subject}&body=${body}`}><Mail size={17} /> Invite by email</a></section><section className="detail-panel"><div className="section-title-row"><div><h2>Members</h2><p>{c.members.length} people in {c.organisation.name}.</p></div><Users size={20} /></div><div className="member-list">{c.members.map((member) => <article key={member.user_id}><span className="avatar">{member.display_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><strong>{member.display_name}</strong><small>Joined {new Date(member.joined_at).toLocaleDateString()}</small></div><span className="role-chip"><ShieldCheck size={13} />{member.role.replaceAll("_", " ")}</span></article>)}</div></section></AppShell>;
}
