"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Workstream = {
  id: number;
  name: string;
  owner: string;
  milestone: string;
  risks: string;
  status: "Green" | "Yellow" | "Red";
  severity: "Low" | "Medium" | "High";
};

type WorkstreamForm = Omit<Workstream, "id">;

const emptyForm: WorkstreamForm = {
  name: "",
  owner: "",
  milestone: "",
  risks: "",
  status: "Green",
  severity: "Low",
};

export default function Workspace() {
  const [form, setForm] = useState<WorkstreamForm>(emptyForm);
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<WorkstreamForm>(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem("workstreams");
    if (saved) setWorkstreams(JSON.parse(saved) as Workstream[]);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEditChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function saveWorkstream(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newWorkstream: Workstream = {
      ...form,
      id: Date.now(),
    };

    const updated = [newWorkstream, ...workstreams];

    setWorkstreams(updated);
    localStorage.setItem("workstreams", JSON.stringify(updated));
    setForm(emptyForm);
  }

  function startEditing(workstream: Workstream) {
    setEditingId(workstream.id);
    setEditForm({
      name: workstream.name,
      owner: workstream.owner,
      milestone: workstream.milestone,
      risks: workstream.risks,
      status: workstream.status,
      severity: workstream.severity,
    });
  }

  function updateWorkstream(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const updated = workstreams.map((item: Workstream) =>
      item.id === editingId ? { ...item, ...editForm } : item
    );

    setWorkstreams(updated);
    localStorage.setItem("workstreams", JSON.stringify(updated));
    setEditingId(null);
    setEditForm(emptyForm);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  function deleteWorkstream(id: number) {
    const updated = workstreams.filter((item: Workstream) => item.id !== id);
    setWorkstreams(updated);
    localStorage.setItem("workstreams", JSON.stringify(updated));
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>🧩 Delivery Workspace</h1>
        <p>
          Create project workstream cards, define owners, log risks, assign
          severity, and send updates into the executive dashboard.
        </p>

        <div className="nav-actions">
          <Link className="button secondary" href="/">
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="panel">
        <h2>Create Workstream Card</h2>
        <p className="section-note">
          Add the delivery details below. Once saved, the card will appear on
          the main dashboard.
        </p>

        <form className="form-grid" onSubmit={saveWorkstream}>
          <div className="form-group">
            <label>Workstream Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Example: Data Migration"
              required
            />
          </div>

          <div className="form-group">
            <label>Owner</label>
            <input
              name="owner"
              value={form.owner}
              onChange={handleChange}
              placeholder="Example: Delivery Team"
              required
            />
          </div>

          <div className="form-group">
            <label>Milestone</label>
            <input
              name="milestone"
              value={form.milestone}
              onChange={handleChange}
              placeholder="Example: Pilot sign-off"
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option>Green</option>
              <option>Yellow</option>
              <option>Red</option>
            </select>
          </div>

          <div className="form-group">
            <label>Severity</label>
            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="form-group full">
            <label>Risk / Blocker</label>
            <textarea
              name="risks"
              value={form.risks}
              onChange={handleChange}
              placeholder="Describe the main risk or blocker"
              required
            />
          </div>

          <div className="full">
            <button type="submit">Save Workstream</button>
          </div>
        </form>
      </section>

      <div className="section-header">
        <div>
          <h2>Created Workstreams</h2>
          <div className="section-note">
            These are saved locally and displayed on the dashboard.
          </div>
        </div>
      </div>

      {workstreams.length === 0 ? (
        <div className="empty-state">
          No workstreams created yet. Add your first workstream above.
        </div>
      ) : (
        <section className="workstream-grid">
          {workstreams.map((ws) => (
            <div className={`card ${ws.status}`} key={ws.id}>
              <div className="card-top">
                <h3>{ws.name}</h3>
                <span className={`status-pill ${ws.status}`}>{ws.status}</span>
              </div>

              {editingId === ws.id ? (
                <form className="form-grid" onSubmit={updateWorkstream}>
                  <div className="form-group">
                    <label>Workstream Name</label>
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Owner</label>
                    <input
                      name="owner"
                      value={editForm.owner}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Milestone</label>
                    <input
                      name="milestone"
                      value={editForm.milestone}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                    >
                      <option>Green</option>
                      <option>Yellow</option>
                      <option>Red</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Severity</label>
                    <select
                      name="severity"
                      value={editForm.severity}
                      onChange={handleEditChange}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>

                  <div className="form-group full">
                    <label>Risk / Blocker</label>
                    <textarea
                      name="risks"
                      value={editForm.risks}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="full" style={{ display: "flex", gap: "10px" }}>
                    <button type="submit">Save Changes</button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      style={{ background: "#111827" }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="meta-grid">
                    <div className="meta-item">
                      <strong>Owner</strong>
                      {ws.owner}
                    </div>
                    <div className="meta-item">
                      <strong>Milestone</strong>
                      {ws.milestone}
                    </div>
                    <div className="meta-item">
                      <strong>Risk</strong>
                      {ws.risks}
                    </div>
                    <div className="meta-item">
                      <strong>Severity</strong>
                      {ws.severity}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                    <button onClick={() => startEditing(ws)}>Edit</button>
                    <button
                      style={{ background: "#dc2626" }}
                      onClick={() => deleteWorkstream(ws.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}