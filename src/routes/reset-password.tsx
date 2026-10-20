
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
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

    setLoading(true);

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!data.session) {
        throw new Error(
          "Your reset link may have expired. Request a new password reset email.",
        );
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage("Password updated successfully. You can now sign in.");

      await supabase.auth.signOut();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d1b] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111a2e] p-7 shadow-2xl sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-bold text-slate-950">
            N
          </div>
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="mt-2 text-sm text-slate-400">
            Choose a new password for your NaomiLearn account.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
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
              className="w-full rounded-xl border border-white/15 bg-[#080d1b] px-4 py-3 outline-none placeholder:text-slate-600 focus:border-yellow-400"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
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
              className="w-full rounded-xl border border-white/15 bg-[#080d1b] px-4 py-3 outline-none placeholder:text-slate-600 focus:border-yellow-400"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="accent-yellow-400"
            />
            Show passwords
          </label>

          {error && (
            <p role="alert" className="break-words rounded-lg bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="break-words rounded-lg bg-green-400/10 p-3 text-sm text-green-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-yellow-300 disabled:opacity-60"
          >
            {loading ? "Updating password..." : "Update password"}
          </button>

          {message && (
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="w-full rounded-xl border border-white/15 px-4 py-3 font-semibold hover:bg-white/5"
            >
              Go to sign in
            </button>
          )}
        </form>
      </section>
    </main>
  );
}
