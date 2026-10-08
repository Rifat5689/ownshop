import React from "react";
import { useLogin } from "../../features/auth/hooks/useLogin";
export default function Login() {
  const hook = useLogin(["SUPER_ADMIN"], "/dashboard");
  return (
    <main className="auth-page">
      <form className="auth-card form-stack" onSubmit={hook.submit}>
        <div className="auth-brand">♛ OwnerSuite</div>
        <h1>Welcome Back</h1>
        <p>Sign in to manage your platform.</p>
        <label>
          Email or Username
          <input
            required
            autoComplete="username"
            value={hook.form.username}
            onChange={(event) =>
              hook.setForm({ ...hook.form, username: event.target.value })
            }
          />
        </label>
        <label>
          Password
          <input
            required
            autoComplete="current-password"
            type="password"
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
      </form>
    </main>
  );
}
