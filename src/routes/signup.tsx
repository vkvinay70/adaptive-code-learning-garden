import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, Terminal } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { saveName } from "@/lib/tutor";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — NaomiLearn" },
      {
        name: "description",
        content:
          "Create your NaomiLearn student account to save and sync your Python learning progress.",
      },
    ],
  }),
  component: SignupPage,
});

const HERO_IMAGE_PATH = "/assets/aistudio/NaomiLearn__Neon_Python_AI_Academy_6441544b.png";

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [imgError, setImgError] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
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

    if (name.trim()) {
      saveName(name.trim());
    }

    if (!isSupabaseConfigured) {
      setMessage(
        "Your display name has been saved locally! (Cloud account creation requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to be configured.)",
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.session) {
        await navigate({ to: "/dashboard" });
      } else {
        setMessage(
          "Account request submitted. Check your email for a verification link before signing in.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setMessage("");

    if (!isSupabaseConfigured) {
      setError(
        "Google sign-up requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to be configured.",
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
      setError(err instanceof Error ? err.message : "Google sign-up failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-hero-lavender text-foreground flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-stretch gap-8 lg:grid-cols-12">
        {/* Left Column: Academy Visual Showcase */}
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
                Start your Python &amp; AI engineering journey today
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Create your free student profile to personalize your AI Tutor greetings, track your
                daily coding goal, and back up your progress in the cloud.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Beginner, Intermediate, and Advanced Python tracks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Interactive Pyodide Code Lab &amp; adaptive topic quizzes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Socratic AI coaching tailored to your current level</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>No account required to explore lessons</span>
            <Link
              to="/learn"
              className="inline-flex items-center gap-1 font-semibold text-purple-300 hover:text-white"
            >
              Start Learning Immediately
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Right Column: Signup Form Card */}
        <section className="lg:col-span-6 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-xs sm:p-9">
            <div className="flex items-center justify-between text-xs font-semibold">
              <Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
                ← Back to Home
              </Link>
              <Link to="/learn" className="text-primary hover:underline">
                Start Learning Now →
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
                Create your NaomiLearn account
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Join the Python &amp; AI Academy and track your journey.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="font-bold text-primary">G</span>
              {googleLoading ? "Connecting to Google..." : "Sign up with Google"}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">or use email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

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
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Password
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
                  Confirm password
                </label>
                <div className="flex rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter password again"
                    className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide passwords" : "Show passwords"}
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

              {message && (
                <div
                  role="status"
                  className="break-words rounded-xl border border-success/40 bg-success/10 p-3 text-xs text-foreground space-y-2"
                >
                  <p>{message}</p>
                  <Link
                    to="/dashboard"
                    className="inline-block font-bold text-primary hover:underline"
                  >
                    Go to Student Dashboard →
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
