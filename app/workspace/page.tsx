import { AppShell } from "@/components/AppShell";
import { WorkspaceManager } from "@/components/WorkspaceManager";
import { getAppContext } from "@/lib/app-context";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const c = await getAppContext();
  return (
    <AppShell active="workstreams" organisation={c.organisation} userName={c.userName} userEmail={c.userEmail} configured={c.configured} accountType={c.accountType} workstreamCount={c.workstreams.length}>
      <WorkspaceManager initialWorkstreams={c.workstreams} organisation={c.organisation} userId={c.userId} configured={c.configured} />
    </AppShell>
  );
}
