"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type Workstream = {
  id: number;
  name: string;
  owner: string;
  milestone: string;
  risks: string;
  status: "Green" | "Yellow" | "Red";
  severity: "Low" | "Medium" | "High";
};

const defaultWorkstreams: Workstream[] = [
  {
    id: 1,
    name: "Data Migration",
    owner: "Delivery Team",
    milestone: "Validation complete",
    risks: "Mapping issues may delay launch",
    status: "Yellow",
    severity: "Medium",
  },
  {
    id: 2,
    name: "Client Training",
    owner: "Customer Success",
    milestone: "Training deck ready",
    risks: "Low attendance from client team",
    status: "Green",
    severity: "Low",
  },
];

function severityClass(severity: Workstream["severity"]) {
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
}

export default function Dashboard() {
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [copilotPrompt, setCopilotPrompt] = useState("Generate summary");
  const [copilotResponse, setCopilotResponse] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("workstreams");

    if (saved) {
      setWorkstreams(JSON.parse(saved) as Workstream[]);
    } else {
      setWorkstreams(defaultWorkstreams);
      localStorage.setItem("workstreams", JSON.stringify(defaultWorkstreams));
    }
  }, []);

  function updateWorkstream(
    id: number,
    field: "status" | "risks" | "severity",
    value: string
  ) {
    const updated = workstreams.map((item) =>
      item.id === id ? ({ ...item, [field]: value } as Workstream) : item
    );

    setWorkstreams(updated);
    localStorage.setItem("workstreams", JSON.stringify(updated));
  }

  const total = workstreams.length;
  const red = workstreams.filter((w) => w.status === "Red").length;
  const yellow = workstreams.filter((w) => w.status === "Yellow").length;
  const readiness =
    total === 0 ? 0 : Math.round(((total - red - yellow * 0.5) / total) * 100);

  async function askCopilot() {
    const prompt = copilotPrompt.trim();

    if (!prompt) {
      setCopilotResponse("## MANDAI\n\nPlease ask a workstream-related question.");
      return;
    }

    setCopilotResponse("## MANDAI is thinking...\n\nReviewing current workstreams.");

    try {
      const res = await fetch("/api/mandai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: prompt,
          workstreams,
          readiness,
        }),
      });

      const data = await res.json();
      setCopilotResponse(data.answer);
    } catch {
      setCopilotResponse(
        "## MANDAI Error\n\nUnable to connect to MANDAI right now. Please check the API route and OpenAI key."
      );
    }
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>🚀 Launch Readiness Tracker</h1>
        <p>
          Executive delivery dashboard for tracking workstream health, risks,
          blockers, and client-ready launch updates.
        </p>

        <div className="nav-actions">
          <Link className="button" href="/workspace">
            Create / Update Workstreams
          </Link>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Readiness Score</div>
          <div className="kpi-value">{readiness}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${readiness}%` }} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Total Workstreams</div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-helper">Tracked across launch delivery</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Blocked / Red</div>
          <div className="kpi-value">{red}</div>
          <div className="kpi-helper">Needs immediate attention</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">At Risk / Yellow</div>
          <div className="kpi-value">{yellow}</div>
          <div className="kpi-helper">Monitor before launch</div>
        </div>
      </section>

      <div className="section-header">
        <div>
          <h2>Workstreams</h2>
          <div className="section-note">
            Status, risks, and severity across each delivery stream.
          </div>
        </div>
      </div>

      <section className="workstream-grid">
        {workstreams.map((ws) => (
          <div className={`card ${ws.status}`} key={ws.id}>
            <div className="card-top">
              <h3>{ws.name}</h3>
              <span className={`status-pill ${ws.status}`}>{ws.status}</span>
            </div>

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
                <span className={`severity ${severityClass(ws.severity)}`}>
                  {ws.severity}
                </span>
              </div>
            </div>

            <div className="inline-update-row">
              <div className="inline-field">
                <label>Status</label>
                <select
                  value={ws.status}
                  onChange={(e) => updateWorkstream(ws.id, "status", e.target.value)}
                >
                  <option>Green</option>
                  <option>Yellow</option>
                  <option>Red</option>
                </select>
              </div>

              <div className="inline-field risk-field">
                <label>Risk</label>
                <input
                  value={ws.risks}
                  onChange={(e) => updateWorkstream(ws.id, "risks", e.target.value)}
                />
              </div>

              <div className="inline-field">
                <label>Severity</label>
                <select
                  value={ws.severity}
                  onChange={(e) => updateWorkstream(ws.id, "severity", e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>📊 Weekly Summary</h2>
          <p>
            {red > 0
              ? `${red} workstream(s) are blocked and need immediate leadership attention.`
              : yellow > 0
              ? `${yellow} workstream(s) are at risk and should be monitored before launch.`
              : "All workstreams are currently on track for launch readiness."}
          </p>

          <div className="copilot-box">
            <h2>🤖 MANDAI</h2>
            <p className="section-note">
              Ask questions about blockers, risks, readiness, priorities, or
              client decisions.
            </p>
            <input
              value={copilotPrompt}
              onChange={(e) => setCopilotPrompt(e.target.value)}
              placeholder="Generate summary"
            />
            <button type="button" style={{ marginTop: "10px" }} onClick={askCopilot}>
              Ask MANDAI
            </button>
            {copilotResponse && (
              <div className="copilot-response markdown-response">
                <ReactMarkdown>{copilotResponse}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <h2>🧠 MANDAI Insights</h2>
          <div className="insight-list">
            <div className="insight-item">
              <strong>Focus:</strong> Prioritize red workstreams and
              high-severity blockers before pilot sign-off.
            </div>
            <div className="insight-item">
              <strong>Client-ready:</strong> Use the dashboard to prepare
              leadership updates and launch summaries.
            </div>
            <div className="insight-item">
              <strong>Workspace active:</strong> Create project cards from the
              workspace page and monitor them here.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}