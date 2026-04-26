import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [pending, setPending] = useState(false);
  const [emailTakenHighlight, setEmailTakenHighlight] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/menus/create", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTakenHighlight(false);
    setPending(true);
    try {
      await register(email.trim(), password, businessName.trim());
      navigate("/menus/create", { replace: true });
    } catch (err) {
      // `registerRequest` surfaces API errors via snackbar (`showErrorSnack` default).
      if (err instanceof ApiError && err.code === "email_taken") {
        setEmailTakenHighlight(true);
      }
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
          <p className="mt-1 text-sm text-emerald-200/90">Create owner account</p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]"
        >
          <div className="space-y-2">
            <label
              htmlFor="register-email"
              className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailTakenHighlight(false);
              }}
              aria-invalid={emailTakenHighlight}
              className={`w-full rounded-xl border-none px-4 py-3 transition-colors focus:bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                emailTakenHighlight
                  ? "bg-error-container/20 ring-error/30 focus:ring-error/40"
                  : "bg-surface-container-low focus:ring-primary/40"
              }`}
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="register-password"
              className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
              required
            />
            <p className="text-xs text-on-surface-variant">At least 8 characters</p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="register-business"
              className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
            >
              Business name
            </label>
            <input
              id="register-business"
              type="text"
              autoComplete="organization"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="primary-gradient w-full rounded-xl py-3 text-sm font-semibold text-on-primary disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
          <p className="text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
