import React from "react";
import { Link, useParams } from "react-router-dom";
import { useLogin } from "../../../features/auth/hooks/useLogin";
export default function Login() {
  const { storeSlug } = useParams();
  const hook = useLogin(["ADMIN", "ECO"], `/${storeSlug}/admin/dashboard`);
  return (
    <main className="auth-page">
      <form className="auth-card form-stack" onSubmit={hook.submit}>
        <div className="auth-brand">◉ OwnShop</div>
        <h1>Merchant Login</h1>
        <p>Sign in to manage your store.</p>
        <label>
          Email or Username
          <input
            autoComplete="username"
            required
            value={hook.form.username}
            onChange={(event) =>
              hook.setForm({ ...hook.form, username: event.target.value })
            }
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            type="password"
            required
            value={hook.form.password}
            onChange={(event) =>
              hook.setForm({ ...hook.form, password: event.target.value })
            }
          />
        </label>
        {hook.error && (
          <p role="alert" className="error">
            {hook.error}
          </p>
        )}
        <button className="btn-primary" disabled={hook.pending}>
          {hook.pending ? "Signing In..." : "Sign In"}
        </button>
        <Link to={`/${storeSlug}`}>View Store</Link>
      </form>
    </main>
  );
}
