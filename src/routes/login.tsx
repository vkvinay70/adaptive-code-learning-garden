import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, Terminal } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — NaomiLearn" },
      {
        name: "description",
        content:
          "Sign in to your NaomiLearn account to sync your Python learning progress and streak.",
      },
    ],
  }),
  component: LoginPage,
});

const HERO_IMAGE_PATH = "/assets/aistudio/NaomiLearn__Neon_Python_AI_Academy_6441544b.png";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imgError, setImgError] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatusMsg("");

    if (!isSupabaseConfigured) {
      setError(
        "Supabase authentication environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) are not configured yet. You can continue using NaomiLearn immediately in guest mode.",
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      await navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setStatusMsg("");

    if (!isSupabaseConfigured) {
      setError(
        "Google sign-in requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to be configured.",
      );
      return;
    }

    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setStatusMsg("");

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    if (!isSupabaseConfigured) {
      setError("Password reset emails require Supabase authentication to be configured.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setStatusMsg("If an account exists for this email, a password reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-hero-lavender text-foreground flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-stretch gap-8 lg:grid-cols-12">
        {/* Left Column: Academy Visual Showcase (prevents desert-island viewport collapse on desktop) */}
        <section className="hidden lg:flex lg:col-span-6 flex-col justify-between rounded-2xl border border-border bg-[#0F172A] p-8 text-white">
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold tracking-tight text-white text-base">NaomiLearn</span>
              <span>Python &amp; AI Academy</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              {!imgError ? (
                <img
                  src={HERO_IMAGE_PATH}
                  alt="NaomiLearn Python and AI Academy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="aspect-[16/9] w-full object-cover block"
                />
              ) : (
                <div className="aspect-[16/9] w-full flex flex-col items-center justify-center bg-[#1E1B4B] p-6 text-center">
                  <Terminal className="h-10 w-10 text-purple-300 mb-2" />
                  <div className="font-bold">NaomiLearn — Python &amp; AI Academy</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Learn Python. Master AI. Build Your Future.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sign in to synchronize your completed Python modules, Code Lab solutions, quiz
                accuracy, and daily learning streak across devices.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>24 structured modules across Beginner, Intermediate &amp; Advanced</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>In-browser Python 3 WebAssembly Code Lab with solution verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Instant guest access available anytime without waiting</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Prefer to start coding right away?</span>
            <Link
              to="/learn"
              className="inline-flex items-center gap-1 font-semibold text-purple-300 hover:text-white"
            >
              Open Curriculum in Guest Mode
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Right Column: Login Card */}
        <section className="lg:col-span-6 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-xs sm:p-9">
            <div className="flex items-center justify-between text-xs font-semibold">
              <Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
                ← Back to Home
              </Link>
              <Link to="/dashboard" className="text-primary hover:underline">
                Continue as Guest →
              </Link>
            </div>

            <div className="mb-7 mt-6 text-center">
              <img
                src="/favicon.png"
                alt="NaomiLearn logo"
                referrerPolicy="no-referrer"
                className="mx-auto mb-3 h-12 w-12 rounded-xl border border-border object-cover"
              />
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Welcome back to NaomiLearn
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sign in to sync your Python learning progress across devices.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="font-bold text-primary">G</span>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                or sign in with email
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label htmlFor="password" className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="flex rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="break-words rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {error}
                </p>
              )}

              {statusMsg && (
                <p
                  role="status"
                  className="break-words rounded-xl border border-success/40 bg-success/10 p-3 text-xs text-success"
                >
                  {statusMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              New to NaomiLearn?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
