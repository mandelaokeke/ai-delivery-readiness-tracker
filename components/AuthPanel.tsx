"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

type AuthMode = "signin" | "individual" | "organisation";

export function AuthPanel({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialState
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialState
  );
  const state = mode === "signin" ? signInState : signUpState;
  const pending = mode === "signin" ? signInPending : signUpPending;
  const isSignup = mode !== "signin";

  return (
    <div className="auth-card">
      <div className="auth-card-head">
        <span className="eyebrow">Secure workspace</span>
        <h1>{mode === "signin" ? "Welcome back" : mode === "individual" ? "Create your account" : "Create your organisation"}</h1>
        <p>
          {mode === "signin"
            ? "Sign in to monitor delivery health, risks, and launch decisions."
            : mode === "individual"
              ? "Start with a private personal workspace. You can create an organisation later."
              : "Set up your organisation and invite your delivery team next."}
        </p>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={mode === "signin" ? "active" : ""}
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={mode === "individual" ? "active" : ""}
          onClick={() => setMode("individual")}
        >
          Individual
        </button>
        <button
          type="button"
          className={mode === "organisation" ? "active" : ""}
          onClick={() => setMode("organisation")}
        >
          Organisation
        </button>
      </div>

      <form className="auth-form" action={mode === "signin" ? signInAction : signUpAction}>
        {isSignup && <input type="hidden" name="accountType" value={mode} />}
        {isSignup && (
          <div className={mode === "organisation" ? "field-row" : ""}>
            <label className="input-field">
              <span>Full name</span>
              <div><UserRound size={18} /><input name="fullName" placeholder="Mandela Okeke" autoComplete="name" required /></div>
            </label>
            {mode === "organisation" && (
              <label className="input-field">
                <span>Organisation</span>
                <div><Building2 size={18} /><input name="organisationName" placeholder="Northstar Delivery" autoComplete="organization" required /></div>
              </label>
            )}
          </div>
        )}

        <label className="input-field">
          <span>Email address</span>
          <div><Mail size={18} /><input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></div>
        </label>

        <label className="input-field">
          <span>Password</span>
          <div>
            <LockKeyhole size={18} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={8}
              required
            />
            <button type="button" className="field-action" onClick={() => setShowPassword((value) => !value)} aria-label="Show or hide password">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {mode === "signin" && (
          <div className="form-options">
            <label><input type="checkbox" name="remember" /> Keep me signed in</label>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
        )}

        {state.error && <p className="form-message error">{state.error}</p>}
        {state.success && <p className="form-message success"><Check size={16} />{state.success}</p>}

        <button className="primary-submit" type="submit" disabled={pending}>
          {pending ? "Please wait..." : mode === "signin" ? "Sign in to workspace" : mode === "individual" ? "Create personal workspace" : "Create organisation"}
          {!pending && <ArrowRight size={18} />}
        </button>
      </form>

      {!configured && (
        <div className="preview-access">
          <span><Sparkles size={16} /> UI preview is ready</span>
          <p>Connect Supabase environment keys to activate secure accounts.</p>
          <Link href="/">Open product preview <ArrowRight size={15} /></Link>
        </div>
      )}

      <p className="auth-legal">
        By continuing, you agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  );
}
