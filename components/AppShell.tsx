"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import type { OrganisationContext } from "@/lib/types";

type Props = {
  active: "dashboard" | "workstreams" | "reports" | "team" | "settings" | "help";
  organisation: OrganisationContext;
  userName: string;
  userEmail?: string;
  configured: boolean;
  workstreamCount?: number;
  children: React.ReactNode;
};

const nav = [
  { id: "dashboard", label: "Overview", href: "/", icon: LayoutDashboard },
  { id: "workstreams", label: "Workstreams", href: "/workspace", icon: FolderKanban },
  { id: "reports", label: "Reports", href: "/reports", icon: BarChart3 },
  { id: "team", label: "Team", href: "/team", icon: Users },
] as const;

export function AppShell({
  active,
  organisation,
  userName,
  userEmail,
  configured,
  workstreamCount = 0,
  children,
}: Props) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Mandai home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>MANDAI</span>
        </Link>

        <Link className="org-switcher" href="/settings#organisation">
          <span className="org-icon"><Building2 size={17} /></span>
          <span className="org-copy">
            <small>Organisation</small>
            <strong>{organisation.name}</strong>
          </span>
          <ChevronDown size={16} />
        </Link>

        <nav className="primary-nav" aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          {nav.map(({ id, label, href, icon: Icon }) => (
            <Link
              key={id}
              href={href}
              className={`nav-link ${active === id ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "workstreams" && <span className="nav-count">{workstreamCount}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-ai-card">
          <span className="ai-orb"><Sparkles size={16} /></span>
          <strong>MANDAI assistant</strong>
          <p>Turn delivery signals into a clear leadership update.</p>
          <Link href="/#mandai">Ask MANDAI</Link>
        </div>

        <div className="sidebar-footer">
          <Link className={`nav-link ${active === "settings" ? "active" : ""}`} href="/settings"><Settings size={18} />Settings</Link>
          <Link className={`nav-link ${active === "help" ? "active" : ""}`} href="/help"><CircleHelp size={18} />Help centre</Link>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark"><Sparkles size={16} /></span> MANDAI
          </div>
          <div className="topbar-spacer" />
          {!configured && <span className="demo-badge">Preview mode</span>}
          <button className="icon-button" type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}>
            <Bell size={19} />
            <span className="notification-dot" />
          </button>
          {notificationsOpen && (
            <section className="notification-popover" aria-label="Notifications panel">
              <div><strong>Notifications</strong><button type="button" onClick={() => setNotificationsOpen(false)}>Close</button></div>
              <p><span className="notification-item-dot warning" />Review at-risk workstreams before your next leadership update.</p>
              <p><span className="notification-item-dot" />Your MANDAI workspace is connected and ready.</p>
              <Link href="/workspace" onClick={() => setNotificationsOpen(false)}>Open workstreams</Link>
            </section>
          )}
          <div className="profile-summary">
            <span className="avatar">{initials || "MO"}</span>
            <span className="profile-copy">
              <strong>{userName}</strong>
              <small>{userEmail ?? organisation.role}</small>
            </span>
          </div>
          {configured && (
            <form action="/auth/signout" method="post">
              <button className="icon-button" type="submit" aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </form>
          )}
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
