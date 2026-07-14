"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail } from "lucide-react";
import {
  requestPasswordReset,
  updatePassword,
  type AuthState,
} from "@/app/auth/actions";

const initialState: AuthState = {};

export function PasswordResetForm({ update = false }: { update?: boolean }) {
  const action = update ? updatePassword : requestPasswordReset;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="auth-card compact-auth-card">
      <div className="auth-card-head">
        <span className="eyebrow">Account security</span>
        <h1>{update ? "Choose a new password" : "Reset your password"}</h1>
        <p>{update ? "Use at least eight characters for your new password." : "We’ll send a secure reset link to your account email."}</p>
      </div>
      <form className="auth-form reset-form" action={formAction}>
        <label className="input-field">
          <span>{update ? "New password" : "Account email"}</span>
          <div>
            {update ? <LockKeyhole size={18} /> : <Mail size={18} />}
            <input
              name={update ? "password" : "email"}
              type={update ? "password" : "email"}
              minLength={update ? 8 : undefined}
              autoComplete={update ? "new-password" : "email"}
              required
            />
          </div>
        </label>
        {state.error && <p className="form-message error">{state.error}</p>}
        {state.success && <p className="form-message success"><Check size={16} />{state.success}</p>}
        <button className="primary-submit" type="submit" disabled={pending}>
          {pending ? "Please wait..." : update ? "Update password" : "Send reset link"}<ArrowRight size={18} />
        </button>
      </form>
      <Link className="back-link" href="/login"><ArrowLeft size={15} /> Back to sign in</Link>
    </div>
  );
}
