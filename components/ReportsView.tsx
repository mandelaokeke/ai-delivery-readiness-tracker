"use client";

import { Download, FileText, TrendingUp } from "lucide-react";
import type { Workstream } from "@/lib/types";

export function ReportsView({ workstreams }: { workstreams: Workstream[] }) {
  const blocked = workstreams.filter((item) => item.status === "Red").length;
  const atRisk = workstreams.filter((item) => item.status === "Yellow").length;
  const average = workstreams.length ? Math.round(workstreams.reduce((sum, item) => sum + item.progress, 0) / workstreams.length) : 0;
  function exportCsv() {
    const rows = [["Workstream", "Owner", "Status", "Progress", "Due date", "Risk"], ...workstreams.map((item) => [item.name, item.owner_name, item.status, `${item.progress}%`, item.due_date ?? "", item.risks])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "mandai-delivery-report.csv"; anchor.click(); URL.revokeObjectURL(url);
  }
  return <><section className="page-heading"><div><span className="eyebrow">Portfolio intelligence</span><h1>Reports</h1><p>Leadership-ready delivery health and risk summaries.</p></div><button className="primary-action" type="button" onClick={exportCsv}><Download size={17} /> Export CSV</button></section><section className="report-grid"><article><span><TrendingUp size={19} /> Average progress</span><strong>{average}%</strong><p>Across {workstreams.length} active workstreams.</p></article><article><span>At risk</span><strong>{atRisk}</strong><p>Workstreams requiring mitigation.</p></article><article><span>Blocked</span><strong>{blocked}</strong><p>Workstreams needing leadership action.</p></article></section><section className="detail-panel"><div className="section-title-row"><div><h2>Delivery report</h2><p>Current portfolio snapshot.</p></div><FileText size={20} /></div><div className="report-list">{workstreams.map((item) => <article key={item.id}><div><strong>{item.name}</strong><span>{item.owner_name} · {item.milestone}</span></div><b className={`status-chip ${item.status.toLowerCase()}`}>{item.status}</b><span>{item.progress}%</span></article>)}</div></section></>;
}
