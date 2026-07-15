"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { Workstream } from "@/lib/types";

export function DashboardView({
  workstreams,
  userName,
}: {
  workstreams: Workstream[];
  userName: string;
}) {
  const [question, setQuestion] = useState("What needs leadership attention this week?");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | Workstream["status"]>("All");

  const stats = useMemo(() => {
    const total = workstreams.length;
    const red = workstreams.filter((item) => item.status === "Red").length;
    const yellow = workstreams.filter((item) => item.status === "Yellow").length;
    const readiness = total
      ? Math.round(((total - red - yellow * 0.5) / total) * 100)
      : 0;
    return { total, red, yellow, readiness };
  }, [workstreams]);
  const visibleWorkstreams = useMemo(() => workstreams.filter((item) => {
    const matchesSearch = `${item.name} ${item.owner_name} ${item.milestone}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "All" || item.status === status);
  }), [workstreams, search, status]);

  async function askMandai() {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    try {
      const response = await fetch("/api/mandai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          workstreams,
          readiness: stats.readiness,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? data.answer ?? "MANDAI could not generate an answer.");
      setAnswer(data.answer ?? "MANDAI could not generate an answer.");
    } catch (error) {
      setAnswer(`## MANDAI is unavailable\n\n${error instanceof Error ? error.message : "Please try again in a moment."}`);
    } finally {
      setAsking(false);
    }
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">Tuesday, 14 July</span>
          <h1>Good afternoon, {userName.split(" ")[0]}</h1>
          <p>Here’s what needs attention across your delivery portfolio.</p>
        </div>
        <Link className="primary-action" href="/workspace">
          <Plus size={18} /> New workstream
        </Link>
      </section>

      <section className="metric-grid" aria-label="Delivery overview">
        <article className="metric-card featured">
          <div className="metric-top"><span>Overall readiness</span><TrendingUp size={18} /></div>
          <div className="metric-main"><strong>{stats.readiness}%</strong><span className="trend positive">+6% this week</span></div>
          <div className="readiness-track"><span style={{ width: `${stats.readiness}%` }} /></div>
          <p>Portfolio confidence is improving.</p>
        </article>
        <article className="metric-card">
          <div className="metric-top"><span>Active workstreams</span><CheckCircle2 size={19} /></div>
          <div className="metric-main"><strong>{stats.total}</strong><span>2 due this week</span></div>
          <p>Across your active workspace.</p>
        </article>
        <article className="metric-card warning">
          <div className="metric-top"><span>At risk</span><Clock3 size={19} /></div>
          <div className="metric-main"><strong>{stats.yellow}</strong><span>Needs monitoring</span></div>
          <p>Review mitigation before Friday.</p>
        </article>
        <article className="metric-card danger">
          <div className="metric-top"><span>Blocked</span><CircleAlert size={19} /></div>
          <div className="metric-main"><strong>{stats.red}</strong><span>Leadership action</span></div>
          <p>One decision is overdue.</p>
        </article>
      </section>

      <section className="dashboard-layout">
        <div className="dashboard-column">
          <div className="section-title-row">
            <div><h2>Workstream health</h2><p>Live delivery status across the portfolio.</p></div>
            <Link href="/workspace">View all <ArrowRight size={16} /></Link>
          </div>

          <div className="workstream-table-wrap">
            <div className="table-toolbar">
              <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workstreams" /></label>
              <select className="toolbar-select" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Filter by status"><option>All</option><option>Green</option><option>Yellow</option><option>Red</option></select>
            </div>
            <div className="workstream-table">
              <div className="table-row table-head">
                <span>Workstream</span><span>Owner</span><span>Health</span><span>Progress</span><span>Due</span><span />
              </div>
              {visibleWorkstreams.map((item) => (
                <div className="table-row" key={item.id}>
                  <span className="workstream-name"><i className={`status-dot ${item.status.toLowerCase()}`} /><span><strong>{item.name}</strong><small>{item.milestone}</small></span></span>
                  <span className="owner-cell"><i>{item.owner_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i>{item.owner_name}</span>
                  <span><b className={`status-chip ${item.status.toLowerCase()}`}>{item.status}</b></span>
                  <span className="progress-cell"><span><i style={{ width: `${item.progress}%` }} /></span>{item.progress}%</span>
                  <span className="due-cell"><CalendarDays size={15} />{item.due_date ? new Date(`${item.due_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</span>
                  <Link className="row-link" href="/workspace" aria-label={`Open ${item.name}`}><ArrowUpRight size={17} /></Link>
                </div>
              ))}
              {!visibleWorkstreams.length && <div className="table-empty">No workstreams match those filters.</div>}
            </div>
          </div>
        </div>

        <aside className="insights-column">
          <section className="mandai-card" id="mandai">
            <div className="mandai-head">
              <span className="ai-orb"><Sparkles size={17} /></span>
              <div><span>MANDAI</span><strong>Delivery intelligence</strong></div>
            </div>
            <h2>What needs your attention?</h2>
            <div className="priority-card">
              <span className="priority-icon"><CircleAlert size={17} /></span>
              <div><strong>Security review is blocking credentials</strong><p>Platform integrations · High severity</p></div>
            </div>
            <label className="ask-box">
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
              <button type="button" onClick={askMandai} disabled={asking}>{asking ? "Thinking..." : "Ask MANDAI"}<Sparkles size={15} /></button>
            </label>
            {answer && <div className="mandai-answer"><ReactMarkdown>{answer}</ReactMarkdown></div>}
          </section>

          <section className="activity-card">
            <div className="section-title-row compact"><div><h2>Recent activity</h2><p>Latest portfolio changes.</p></div></div>
            <div className="activity-list">
              <div><span className="activity-avatar blue">AL</span><p><strong>Amara</strong> updated Data migration to <b>At risk</b><small>24 minutes ago</small></p></div>
              <div><span className="activity-avatar purple">MP</span><p><strong>Mina</strong> added a high-severity blocker<small>1 hour ago</small></p></div>
              <div><span className="activity-avatar green">JC</span><p><strong>Jordan</strong> completed a milestone<small>Yesterday</small></p></div>
            </div>
          </section>
        </aside>
      </section>
    </>
  );
}
