import { ChartNoAxesCombined, FolderKanban, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AuthPanel } from "@/components/AuthPanel";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-brand"><span className="brand-mark"><Sparkles size={18} /></span> MANDAI</div>
        <div className="story-copy">
          <span className="eyebrow light">AI delivery readiness</span>
          <h2>Turn delivery uncertainty into confident decisions.</h2>
          <p>One secure workspace for workstream health, risks, ownership, and leadership-ready updates.</p>
          <div className="story-features">
            <div><span><ChartNoAxesCombined size={19} /></span><p><strong>Portfolio clarity</strong>See readiness and blockers at a glance.</p></div>
            <div><span><FolderKanban size={19} /></span><p><strong>Flexible workspaces</strong>Keep personal and team delivery work separated.</p></div>
            <div><span><Users size={19} /></span><p><strong>Role-based teamwork</strong>Give every user the right level of access.</p></div>
            <div><span><ShieldCheck size={19} /></span><p><strong>Secure by design</strong>Tenant-aware data policies protect every record.</p></div>
          </div>
        </div>
        <div className="story-proof">
          <div className="proof-avatars"><span>AL</span><span>JC</span><span>MP</span><span>+8</span></div>
          <p><strong>Built for delivery teams</strong><br />From pilot planning to launch confidence.</p>
        </div>
      </section>
      <section className="auth-form-side"><AuthPanel configured={configured} /></section>
    </main>
  );
}
