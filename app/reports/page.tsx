import { AppShell } from "@/components/AppShell";
import { ReportsView } from "@/components/ReportsView";
import { getAppContext } from "@/lib/app-context";
export const dynamic = "force-dynamic";
export default async function ReportsPage() { const c = await getAppContext(); return <AppShell active="reports" organisation={c.organisation} userName={c.userName} userEmail={c.userEmail} configured={c.configured} accountType={c.accountType} workstreamCount={c.workstreams.length}><ReportsView workstreams={c.workstreams} /></AppShell>; }
