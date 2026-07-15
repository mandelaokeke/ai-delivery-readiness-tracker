import { Building2, Save, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getAppContext } from "@/lib/app-context";
import { updateWorkspaceSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const c = await getAppContext();
  const isIndividual = c.accountType === "individual";
  const WorkspaceIcon = isIndividual ? UserRound : Building2;
  return (
    <AppShell active="settings" organisation={c.organisation} userName={c.userName} userEmail={c.userEmail} configured={c.configured} accountType={c.accountType} workstreamCount={c.workstreams.length}>
      <section className="page-heading"><div><span className="eyebrow">Workspace preferences</span><h1>Settings</h1><p>Update your profile and workspace details.</p></div></section>
      <form className="settings-grid" action={updateWorkspaceSettings}>
        <section className="detail-panel"><div className="settings-section-title"><UserRound size={19} /><div><h2>Profile</h2><p>Your name across the workspace.</p></div></div><label className="settings-field"><span>Full name</span><input name="fullName" defaultValue={c.userName} required /></label><label className="settings-field"><span>Email address</span><input value={c.userEmail ?? "Preview account"} disabled readOnly /></label></section>
        <section className="detail-panel" id="workspace"><div className="settings-section-title"><WorkspaceIcon size={19} /><div><h2>{isIndividual ? "Personal workspace" : "Organisation"}</h2><p>{isIndividual ? "The workspace name shown in your account." : "Workspace name visible to members."}</p></div></div><input type="hidden" name="organisationId" value={c.organisation.id} /><label className="settings-field"><span>{isIndividual ? "Workspace name" : "Organisation name"}</span><input name="organisationName" defaultValue={c.organisation.name} required /></label><label className="settings-field"><span>Your role</span><input value={c.organisation.role} disabled readOnly /></label></section>
        <div className="settings-actions"><button className="primary-action" type="submit"><Save size={17} /> Save changes</button></div>
      </form>
    </AppShell>
  );
}
