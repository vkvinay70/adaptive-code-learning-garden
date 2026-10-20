
import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      await navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.",
      );
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (error) throw error;

      setError("If an account exists for this email, a reset link will be sent.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send reset email.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d1b] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111a2e] p-7 shadow-2xl sm:p-9">
        <Link
          to="/"
          className="text-sm text-slate-300 transition hover:text-yellow-300"
        >
          ← Back to NaomiLearn
        </Link>

        <div className="mb-8 mt-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-bold text-slate-950">
            N
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue your Python learning journey.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-4 py-3 font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg font-bold text-blue-600">G</span>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-widest text-slate-500">
            or email
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/15 bg-[#080d1b] px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-yellow-400"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-xs text-yellow-300 hover:text-yellow-200"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex rounded-xl border border-white/15 bg-[#080d1b] focus-within:border-yellow-400">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-xs text-slate-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="status"
              aria-live="polite"
              className="break-words rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          New to NaomiLearn?{" "}
          <Link
            to="/signup"
            className="font-semibold text-yellow-300 hover:text-yellow-200"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Your account helps keep your learning progress connected to you.
        </p>
      </section>
    </main>
  );
}
