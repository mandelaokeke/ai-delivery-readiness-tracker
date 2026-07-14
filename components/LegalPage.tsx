import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="legal-page">
      <article>
        <Link className="auth-brand legal-brand" href="/"><span className="brand-mark"><Sparkles size={18} /></span> MANDAI</Link>
        <span className="eyebrow">Last updated 14 July 2026</span>
        <h1>{title}</h1>
        <div className="legal-copy">{children}</div>
        <Link className="back-link" href="/login"><ArrowLeft size={15} /> Back to sign in</Link>
      </article>
    </main>
  );
}
