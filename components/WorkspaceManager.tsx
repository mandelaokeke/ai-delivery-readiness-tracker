"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { OrganisationContext, Workstream } from "@/lib/types";

type WorkstreamForm = {
  name: string;
  owner_name: string;
  milestone: string;
  risks: string;
  status: Workstream["status"];
  severity: Workstream["severity"];
  progress: number;
  due_date: string;
};

const emptyForm: WorkstreamForm = {
  name: "",
  owner_name: "",
  milestone: "",
  risks: "",
  status: "Green",
  severity: "Low",
  progress: 0,
  due_date: "",
};

export function WorkspaceManager({
  initialWorkstreams,
  organisation,
  userId,
  configured,
}: {
  initialWorkstreams: Workstream[];
  organisation: OrganisationContext;
  userId?: string;
  configured: boolean;
}) {
  const [workstreams, setWorkstreams] = useState(initialWorkstreams);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Workstream["status"]>("All");
  const [severityFilter, setSeverityFilter] = useState<"All" | Workstream["severity"]>("All");
  const [progressFilter, setProgressFilter] = useState<"All" | "under-50" | "50-79" | "80-plus">("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!menuId) return;
    function closeMenu(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Element && !target.closest("[data-workstream-menu]")) setMenuId(null);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [menuId]);

  const filtered = workstreams.filter((item) => {
    const matchesQuery = `${item.name} ${item.owner_name} ${item.milestone}`.toLowerCase().includes(query.toLowerCase());
    const matchesProgress = progressFilter === "All"
      || (progressFilter === "under-50" && item.progress < 50)
      || (progressFilter === "50-79" && item.progress >= 50 && item.progress < 80)
      || (progressFilter === "80-plus" && item.progress >= 80);
    return matchesQuery
      && (statusFilter === "All" || item.status === statusFilter)
      && (severityFilter === "All" || item.severity === severityFilter)
      && matchesProgress;
  });

  const advancedFilterCount = Number(severityFilter !== "All") + Number(progressFilter !== "All");

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(item: Workstream) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      owner_name: item.owner_name,
      milestone: item.milestone,
      risks: item.risks,
      status: item.status,
      severity: item.severity,
      progress: item.progress,
      due_date: item.due_date ?? "",
    });
    setMessage("");
    setMenuId(null);
    setShowForm(true);
  }

  async function deleteWorkstream(item: Workstream) {
    setMenuId(null);
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    if (!configured) {
      setWorkstreams((items) => items.filter((candidate) => candidate.id !== item.id));
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("workstreams").delete().eq("id", item.id);
    if (error) { setMessage(error.message); return; }
    setWorkstreams((items) => items.filter((candidate) => candidate.id !== item.id));
  }

  async function saveWorkstream(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = {
      ...form,
      progress: Number(form.progress),
      due_date: form.due_date || null,
    };

    if (!configured || !userId) {
      if (editingId) {
        setWorkstreams((items) => items.map((item) => item.id === editingId ? { ...item, ...fields } : item));
        setShowForm(false);
        setEditingId(null);
        return;
      }
      setMessage("Connect Supabase to save workspace workstreams.");
      return;
    }

    const supabase = createClient();
    if (editingId) {
      const { data, error } = await supabase
        .from("workstreams")
        .update(fields)
        .eq("id", editingId)
        .select("id, organisation_id, name, owner_name, milestone, risks, status, severity, progress, due_date")
        .single();
      if (error) { setMessage(error.message); return; }
      setWorkstreams((items) => items.map((item) => item.id === editingId ? data as Workstream : item));
      setShowForm(false);
      setEditingId(null);
      setMessage("");
      return;
    }

    const payload = { ...fields, organisation_id: organisation.id, created_by: userId };
    const { data, error } = await supabase
      .from("workstreams")
      .insert(payload)
      .select("id, organisation_id, name, owner_name, milestone, risks, status, severity, progress, due_date")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setWorkstreams((items) => [data as Workstream, ...items]);
    setForm(emptyForm);
    setMessage("");
    setShowForm(false);
  }

  return (
    <>
      <section className="page-heading">
        <div><span className="eyebrow">Delivery portfolio</span><h1>Workstreams</h1><p>Create, assign, and monitor every stream of launch delivery.</p></div>
        <button className="primary-action" type="button" onClick={openCreateForm}><Plus size={18} /> New workstream</button>
      </section>

      <section className="workspace-summary">
        <div><span>All workstreams</span><strong>{workstreams.length}</strong></div>
        <div><span>On track</span><strong>{workstreams.filter((item) => item.status === "Green").length}</strong></div>
        <div><span>At risk</span><strong>{workstreams.filter((item) => item.status === "Yellow").length}</strong></div>
        <div><span>Blocked</span><strong>{workstreams.filter((item) => item.status === "Red").length}</strong></div>
      </section>

      <section className="workspace-panel">
        <div className="workspace-toolbar">
          <label className="search-box large"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by workstream, milestone, or owner" /></label>
          <label className="filter-control"><Filter size={16} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} aria-label="Workstream status"><option>All</option><option>Green</option><option>Yellow</option><option>Red</option></select></label>
          <button type="button" className={filtersOpen || advancedFilterCount ? "filter-active" : ""} aria-expanded={filtersOpen} onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal size={16} /> More filters{advancedFilterCount > 0 && <span className="filter-count">{advancedFilterCount}</span>}</button>
        </div>

        {filtersOpen && (
          <div className="advanced-filter-panel">
            <label><span>Risk severity</span><select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as typeof severityFilter)}><option>All</option><option>Low</option><option>Medium</option><option>High</option></select></label>
            <label><span>Progress</span><select value={progressFilter} onChange={(event) => setProgressFilter(event.target.value as typeof progressFilter)}><option value="All">Any progress</option><option value="under-50">Under 50%</option><option value="50-79">50–79%</option><option value="80-plus">80% or more</option></select></label>
            <button type="button" onClick={() => { setSeverityFilter("All"); setProgressFilter("All"); }}>Clear filters</button>
          </div>
        )}

        <div className="workspace-grid">
          {filtered.map((item) => (
            <article className="workstream-card" key={item.id}>
              <div className="workstream-card-head">
                <b className={`status-chip ${item.status.toLowerCase()}`}>{item.status}</b>
                <div className="card-menu-wrap" data-workstream-menu><button type="button" aria-label={`Options for ${item.name}`} aria-expanded={menuId === item.id} onClick={() => setMenuId((id) => id === item.id ? null : item.id)}><MoreHorizontal size={19} /></button>{menuId === item.id && <div className="card-menu"><button type="button" onClick={() => openEditForm(item)}>Edit workstream</button><button type="button" className="danger" onClick={() => deleteWorkstream(item)}>Delete workstream</button></div>}</div>
              </div>
              <h2>{item.name}</h2>
              <p>{item.milestone}</p>
              <div className="card-progress"><div><span>Progress</span><strong>{item.progress}%</strong></div><i><span style={{ width: `${item.progress}%` }} /></i></div>
              <div className={`risk-callout ${item.severity.toLowerCase()}`}><CircleAlert size={16} /><span><small>{item.severity} risk</small>{item.risks}</span></div>
              <div className="workstream-card-foot">
                <span className="owner-cell"><i>{item.owner_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i>{item.owner_name}</span>
                <span><CalendarDays size={15} />{item.due_date ? new Date(`${item.due_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No due date"}</span>
              </div>
            </article>
          ))}
          {!filtered.length && <div className="workspace-empty"><strong>No matching workstreams</strong><p>Adjust the search or filters and try again.</p></div>}
        </div>
      </section>

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowForm(false)}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="workstream-form-title">
            <div className="modal-head"><div><span className="eyebrow">{editingId ? "Update delivery stream" : "New delivery stream"}</span><h2 id="workstream-form-title">{editingId ? "Edit workstream" : "Create workstream"}</h2><p>{editingId ? "Update the owner, milestone, risk, progress, or due date." : "Add the essentials now. Your team can update progress as delivery moves."}</p></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X size={20} /></button></div>
            <form className="workstream-form" onSubmit={saveWorkstream}>
              <label><span>Workstream name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Data migration" required /></label>
              <label><span>Owner</span><input value={form.owner_name} onChange={(event) => setForm({ ...form, owner_name: event.target.value })} placeholder="Full name" required /></label>
              <label className="full"><span>Next milestone</span><input value={form.milestone} onChange={(event) => setForm({ ...form, milestone: event.target.value })} placeholder="What does success look like next?" required /></label>
              <label><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Workstream["status"] })}><option>Green</option><option>Yellow</option><option>Red</option></select></label>
              <label><span>Risk severity</span><select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as Workstream["severity"] })}><option>Low</option><option>Medium</option><option>High</option></select></label>
              <label><span>Progress</span><input type="number" min="0" max="100" value={form.progress} onChange={(event) => setForm({ ...form, progress: Number(event.target.value) })} /></label>
              <label><span>Due date</span><input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /></label>
              <label className="full"><span>Risk or blocker</span><textarea value={form.risks} onChange={(event) => setForm({ ...form, risks: event.target.value })} placeholder="Describe the key delivery risk" required /></label>
              {message && <p className="form-message error full">{message}</p>}
              <div className="modal-actions full"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-action">{editingId ? "Save changes" : "Create workstream"}</button></div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
