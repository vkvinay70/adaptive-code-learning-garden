import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ShieldCheck,
  Terminal,
  AlertCircle,
  Loader2,
  Sparkles,
  BookOpen,
  Code2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NaomiLearnLogo } from "@/components/naomilearn-logo";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = typeof search["redirect"] === "string" ? search["redirect"] : undefined;
    return redirect ? { redirect } : {};
  },
  head: () => ({
    meta: [
      { title: "Get Started — NaomiLearn Python & AI Academy" },
      {
        name: "description",
        content:
          "Sign in with Google to access NaomiLearn's 24 Python modules, interactive Code Lab, adaptive quizzes, and personal AI Tutor.",
      },
    ],
  }),
  component: GetStartedAuthPage,
});

const HERO_IMAGE_PATH = "/assets/aistudio/NaomiLearn__Neon_Python_AI_Academy_6441544b.png";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GetStartedAuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { isAuthenticated, loading: authLoading, isConfigured, signInWithGoogle } = useAuth();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  const destination =
    search.redirect && search.redirect.startsWith("/") && !search.redirect.startsWith("//")
      ? search.redirect
      : "/dashboard";

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void navigate({ to: destination });
    }
  }, [authLoading, isAuthenticated, destination, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const oauthError =
      params.get("error_description") ??
      hashParams.get("error_description") ??
      params.get("error") ??
      hashParams.get("error");
    if (oauthError) {
      setError(decodeURIComponent(oauthError.replace(/\+/g, " ")));
    }
  }, []);

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);

    const result = await signInWithGoogle(destination);
    if (result.error) {
      setError(result.error);
      setGoogleLoading(false);
    } else {
      // If opened in an iframe-safe popup window, reset button spinner after a brief delay
      // so the user can retry if they close the popup.
      window.setTimeout(() => {
        setGoogleLoading(false);
      }, 2500);
    }
  }

  return (
    <main className="min-h-screen bg-hero-python text-foreground flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-stretch gap-8 lg:grid-cols-12">
        {/* Left Column: Academy Showcase */}
        <section className="hidden lg:flex lg:col-span-6 flex-col justify-between rounded-3xl border border-slate-800 bg-[#0F172A] p-8 text-white shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <NaomiLearnLogo size="md" variant="light" />
              </Link>
              <span className="font-mono text-xs font-medium text-sky-200">
                Python 3 · AI Tutor
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/60 p-1.5 shadow-md">
              {!imgError ? (
                <img
                  src={HERO_IMAGE_PATH}
                  alt="NaomiLearn Python and AI Academy"
                  width={1280}
                  height={800}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="aspect-[16/10] w-full rounded-xl object-cover object-center block"
                />
              ) : (
                <div className="aspect-[16/10] w-full flex flex-col items-center justify-center rounded-xl bg-[#0F172A] p-6 text-center">
                  <Terminal className="h-10 w-10 text-sky-300 mb-2" />
                  <div className="font-bold">NaomiLearn — Python &amp; AI Academy</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Learn Python. Build your future.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Learn Python with your personal AI tutor. Sign in with your Google account to unlock
                all 24 interactive Python modules, run real Python 3 code in the browser lab, and
                track your mastery.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-200">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>24 structured modules across Beginner, Intermediate &amp; Advanced</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>In-browser Python 3 WebAssembly Code Lab with automated verification</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Automatic cloud sync for lessons, quiz accuracy, and study streaks</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              Verified Google OAuth 2.0 Authentication
            </span>
            <span className="font-mono text-slate-300">Supabase Auth + RLS</span>
          </div>
        </section>

        {/* Right Column: Unified Google Sign-In Card */}
        <section className="lg:col-span-6 flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
            <div className="flex items-center justify-between text-xs font-semibold">
              <Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
                ← Back to Home
              </Link>
              <span className="font-mono text-xs font-semibold text-primary">
                Google Student Sign-In
              </span>
            </div>

            <div className="mb-7 mt-6 text-center">
              <div className="mb-4 flex justify-center">
                <NaomiLearnLogo size="lg" showWordmark={true} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Get Started with NaomiLearn
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Continue with your Google account to access interactive Python lessons, the Code
                Lab, quizzes, and your personal AI Tutor.
              </p>
            </div>

            {search.redirect && (
              <div className="mb-5 rounded-xl border border-primary/25 bg-secondary/60 px-3.5 py-2.5 text-xs text-secondary-foreground">
                Sign in with Google to continue to{" "}
                <span className="font-mono font-bold text-primary">{destination}</span>.
              </div>
            )}

            {/* Primary Action: Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || authLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Opening Google Sign-In…</span>
                </>
              ) : (
                <>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                    <GoogleIcon />
                  </span>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs leading-relaxed text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <div className="font-bold">Google Authentication Notice</div>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!isConfigured && (
              <div className="mt-5 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-xs leading-relaxed text-foreground space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-gold" />
                  <span>Supabase Google OAuth Configuration Required</span>
                </div>
                <p className="text-muted-foreground">
                  To activate live Google Sign-In, configure{" "}
                  <code className="rounded bg-card px-1 py-0.5 font-mono text-[11px]">
                    VITE_SUPABASE_URL
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-card px-1 py-0.5 font-mono text-[11px]">
                    VITE_SUPABASE_PUBLISHABLE_KEY
                  </code>{" "}
                  in your environment and enable the <strong>Google</strong> provider under{" "}
                  <em>Supabase Dashboard → Authentication → Providers</em>.
                </p>
              </div>
            )}

            <details className="mt-4 rounded-xl border border-border bg-secondary/25 px-3.5 py-2.5 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-semibold text-foreground select-none">
                Seeing a Google 403 error or redirect issue?
              </summary>
              <div className="mt-2.5 space-y-2 leading-relaxed">
                <p>
                  <strong>1. Google Cloud OAuth Audience (403 Fix):</strong> In{" "}
                  <em>Google Cloud Console → Google Auth Platform → Audience</em>, either publish
                  the <strong>NaomiLearn</strong> consent screen to <strong>In production</strong>{" "}
                  or add your Google email under <strong>Test users</strong>.
                </p>
                <p>
                  <strong>2. Supabase Redirect URLs Allowlist:</strong> In{" "}
                  <em>Supabase Dashboard → Authentication → URL Configuration → Redirect URLs</em>,
                  add your current app URL with{" "}
                  <code className="font-mono text-[11px] text-foreground">/**</code> so Supabase
                  returns directly to <code className="font-mono text-[11px]">{destination}</code>.
                </p>
              </div>
            </details>

            {/* What's Included Summary */}
            <div className="mt-6 border-t border-border pt-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Included with your student account
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/35 p-2.5 font-medium text-foreground">
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  <span>24 Python Modules</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/35 p-2.5 font-medium text-foreground">
                  <Code2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>Browser Code Lab</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/35 p-2.5 font-medium text-foreground">
                  <Sparkles className="h-4 w-4 shrink-0 text-gold" />
                  <span>Personal AI Tutor</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/35 p-2.5 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                  <span>Cloud Progress Sync</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
