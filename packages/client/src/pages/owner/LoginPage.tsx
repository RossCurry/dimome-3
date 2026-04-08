import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("dev@dimome.local");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, fromPath, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      navigate(fromPath, { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Sign-in failed. Try again.";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="glass-header text-on-primary">
        <div className="mx-auto w-full max-w-md px-6 py-6">
          <h1 className="font-headline text-2xl font-bold italic tracking-tight text-emerald-50">
            DiMoMe
          </h1>
          <p className="mt-1 text-sm text-emerald-200/90">Owner sign in</p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
        <form onSubmit={onSubmit} className="space-y-6 rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
          {error ? (
            <p className="rounded-lg bg-error-container/30 px-3 py-2 text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="primary-gradient w-full rounded-xl py-3 text-sm font-semibold text-on-primary disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-xs text-on-surface-variant">
            Seed user after <code className="rounded bg-surface-container-low px-1">db:seed</code>:{" "}
            <span className="font-mono">dev@dimome.local</span>
          </p>
        </form>
      </main>
    </div>
  );
}
