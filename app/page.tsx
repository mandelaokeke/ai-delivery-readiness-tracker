import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";
import { getAppContext } from "@/lib/app-context";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const c = await getAppContext();
  return (
    <AppShell active="dashboard" organisation={c.organisation} userName={c.userName} userEmail={c.userEmail} configured={c.configured} accountType={c.accountType} workstreamCount={c.workstreams.length}>
      <DashboardView workstreams={c.workstreams} userName={c.userName} />
    </AppShell>
  );
}
