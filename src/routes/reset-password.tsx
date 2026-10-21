import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — NaomiLearn" },
      {
        name: "description",
        content: "Choose a new password for your NaomiLearn account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isSupabaseConfigured) {
      setError("Supabase authentication environment variables are not configured.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!data.session) {
        throw new Error(
          "Your reset link may have expired. Request a new password reset email from the login page.",
        );
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage("Password updated successfully. You can now sign in.");

      await supabase.auth.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-9">
        <Link
          to="/login"
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          ← Back to Sign In
        </Link>

        <div className="mb-7 mt-6 text-center">
          <img
            src="/favicon.png"
            alt="NaomiLearn logo"
            referrerPolicy="no-referrer"
            className="mx-auto mb-3 h-12 w-12 rounded-xl border border-border object-cover"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Reset your password
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Choose a strong new password for your NaomiLearn account.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              New password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter password again"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="accent-primary"
            />
            Show passwords
          </label>

          {error && (
            <p
              role="alert"
              className="break-words rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="break-words rounded-xl border border-success/40 bg-success/10 p-3 text-xs text-success"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Updating password..." : "Update Password"}
          </button>

          {message && (
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/80"
            >
              Go to Sign In
            </button>
          )}
        </form>
      </section>
    </main>
  );
}
