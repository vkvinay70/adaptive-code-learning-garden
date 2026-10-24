import { Link } from "@tanstack/react-router";
import { CheckCircle2, Code2, Sparkles, Terminal, TrendingUp } from "lucide-react";
import naomiLogo from "@/assets/naomilearn-logo.png";

/**
 * Original SVG illustration for the Interactive Python Code Lab
 */
export function CodeLabIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Interactive Python Code Lab architecture illustration"
    >
      <defs>
        <linearGradient
          id="codelab-bg"
          x1="0"
          y1="0"
          x2="480"
          y2="280"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="codelab-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4B8BBE" />
          <stop offset="100%" stopColor="#306998" />
        </linearGradient>
        <linearGradient id="codelab-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Background Canvas */}
      <rect width="480" height="280" rx="20" fill="url(#codelab-bg)" />

      {/* Subtle Grid Lines */}
      <g stroke="#334155" strokeOpacity="0.35" strokeWidth="1">
        <line x1="0" y1="56" x2="480" y2="56" />
        <line x1="0" y1="112" x2="480" y2="112" />
        <line x1="0" y1="168" x2="480" y2="168" />
        <line x1="0" y1="224" x2="480" y2="224" />
        <line x1="96" y1="0" x2="96" y2="280" />
        <line x1="192" y1="0" x2="192" y2="280" />
        <line x1="288" y1="0" x2="288" y2="280" />
        <line x1="384" y1="0" x2="384" y2="280" />
      </g>

      {/* Ambient Python Blue & Gold Glow */}
      <circle cx="370" cy="90" r="85" fill="#306998" fillOpacity="0.28" />
      <circle cx="120" cy="210" r="70" fill="#FFD43B" fillOpacity="0.1" />

      {/* Editor Window Card */}
      <rect
        x="28"
        y="26"
        width="290"
        height="186"
        rx="12"
        fill="#0F172A"
        stroke="#475569"
        strokeWidth="1.5"
      />
      {/* Editor Top Bar */}
      <rect x="29" y="27" width="288" height="28" rx="11" fill="#1E293B" />
      <circle cx="45" cy="41" r="4.5" fill="#F87171" />
      <circle cx="59" cy="41" r="4.5" fill="#FFD43B" />
      <circle cx="73" cy="41" r="4.5" fill="#34D399" />
      <rect x="92" y="36" width="84" height="10" rx="5" fill="#334155" />

      {/* Code Lines */}
      <text x="42" y="76" fill="#64748B" fontFamily="monospace" fontSize="11">
        1
      </text>
      <rect x="60" y="67" width="32" height="10" rx="4" fill="#FFD43B" />
      <rect x="98" y="67" width="88" height="10" rx="4" fill="#60A5FA" />
      <rect x="192" y="67" width="46" height="10" rx="4" fill="#94A3B8" />

      <text x="42" y="98" fill="#64748B" fontFamily="monospace" fontSize="11">
        2
      </text>
      <rect x="76" y="89" width="42" height="10" rx="4" fill="#60A5FA" />
      <rect x="124" y="89" width="110" height="10" rx="4" fill="#34D399" />

      <text x="42" y="120" fill="#64748B" fontFamily="monospace" fontSize="11">
        3
      </text>
      <rect x="76" y="111" width="54" height="10" rx="4" fill="#FFD43B" />
      <rect x="136" y="111" width="96" height="10" rx="4" fill="#E2E8F0" />

      <text x="42" y="142" fill="#64748B" fontFamily="monospace" fontSize="11">
        4
      </text>
      <rect x="60" y="133" width="44" height="10" rx="4" fill="#60A5FA" />
      <rect x="110" y="133" width="128" height="10" rx="4" fill="#93C5FD" />

      {/* Inline Console Output Box */}
      <rect
        x="42"
        y="156"
        width="262"
        height="42"
        rx="8"
        fill="#020617"
        stroke="#1E293B"
        strokeWidth="1"
      />
      <circle cx="56" cy="177" r="4" fill="#34D399" />
      <text x="68" y="181" fill="#6EE7B7" fontFamily="monospace" fontSize="11" fontWeight="600">
        stdout: [1, 9, 25, 49, 81] · 12ms
      </text>

      {/* Right Floating WebAssembly & Verification Nodes */}
      <rect
        x="294"
        y="62"
        width="158"
        height="72"
        rx="12"
        fill="#0F172A"
        stroke="#4B8BBE"
        strokeWidth="1.5"
      />
      <circle cx="320" cy="98" r="14" fill="url(#codelab-accent)" />
      <path d="M316 93L326 98L316 103V93Z" fill="#FFFFFF" />
      <rect x="344" y="84" width="88" height="10" rx="4" fill="#F8FAFC" />
      <rect x="344" y="102" width="64" height="8" rx="4" fill="#93C5FD" />

      {/* Test Verification Floating Card */}
      <rect
        x="266"
        y="162"
        width="186"
        height="92"
        rx="12"
        fill="#0F172A"
        stroke="#10B981"
        strokeWidth="1.5"
      />
      <circle cx="292" cy="192" r="11" fill="url(#codelab-emerald)" />
      <path
        d="M287 192L290.5 195.5L297.5 188.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="312" y="183" width="116" height="9" rx="4" fill="#ECFDF5" />
      <rect x="312" y="198" width="84" height="7" rx="3.5" fill="#6EE7B7" />
      <rect x="282" y="220" width="154" height="8" rx="4" fill="#1E293B" />
      <rect x="282" y="220" width="154" height="8" rx="4" fill="url(#codelab-emerald)" />
    </svg>
  );
}

/**
 * Original SVG illustration for the Socratic AI Tutor Agent
 */
export function AiTutorIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Naomi AI Python Tutor Socratic coaching illustration"
    >
      <defs>
        <linearGradient
          id="tutor-bg"
          x1="0"
          y1="0"
          x2="480"
          y2="280"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#EBF3F9" />
        </linearGradient>
        <linearGradient id="tutor-orb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4B8BBE" />
          <stop offset="100%" stopColor="#306998" />
        </linearGradient>
      </defs>

      <rect width="480" height="280" rx="20" fill="url(#tutor-bg)" />

      {/* Decorative Concentric Orbit Rings */}
      <circle cx="112" cy="140" r="74" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="5 5" />
      <circle cx="112" cy="140" r="52" fill="#DBEAFE" fillOpacity="0.6" />

      {/* Central AI Mentor Core */}
      <circle cx="112" cy="140" r="34" fill="url(#tutor-orb)" />
      <path
        d="M112 121L116.5 133.5L129 138L116.5 142.5L112 155L107.5 142.5L95 138L107.5 133.5L112 121Z"
        fill="#FFD43B"
      />

      {/* Connection Pathways */}
      <path
        d="M146 126C178 126 184 74 214 74"
        stroke="#306998"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M146 140C178 140 184 140 214 140"
        stroke="#306998"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M146 154C178 154 184 208 214 208"
        stroke="#306998"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Card 1: Curriculum Context Lookup */}
      <rect
        x="214"
        y="42"
        width="236"
        height="58"
        rx="12"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      <circle cx="240" cy="71" r="12" fill="#EBF3F9" />
      <circle cx="240" cy="71" r="5" fill="#306998" />
      <rect x="262" y="59" width="124" height="9" rx="4.5" fill="#0F172A" />
      <rect x="262" y="75" width="162" height="7" rx="3.5" fill="#64748B" />

      {/* Card 2: Socratic Hint Generation */}
      <rect
        x="214"
        y="111"
        width="236"
        height="58"
        rx="12"
        fill="#0F172A"
        stroke="#306998"
        strokeWidth="1.5"
      />
      <circle cx="240" cy="140" r="12" fill="#FFD43B" fillOpacity="0.2" />
      <circle cx="240" cy="140" r="5" fill="#FFD43B" />
      <rect x="262" y="128" width="142" height="9" rx="4.5" fill="#F8FAFC" />
      <rect x="262" y="144" width="168" height="7" rx="3.5" fill="#93C5FD" />

      {/* Card 3: Line-by-Line Code Verification */}
      <rect
        x="214"
        y="180"
        width="236"
        height="58"
        rx="12"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      <circle cx="240" cy="209" r="12" fill="#DCFCE7" />
      <path
        d="M235.5 209L238.5 212L245 205.5"
        stroke="#059669"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="262" y="197" width="132" height="9" rx="4.5" fill="#0F172A" />
      <rect x="262" y="213" width="150" height="7" rx="3.5" fill="#64748B" />
    </svg>
  );
}

/**
 * Original SVG emblem for each of the 3 curriculum tracks
 */
export function TrackLevelEmblem({
  level,
  className = "h-11 w-11",
}: {
  level: "Beginner" | "Intermediate" | "Advanced";
  className?: string;
}) {
  if (level === "Beginner") {
    return (
      <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
        <rect width="44" height="44" rx="12" fill="#EBF3F9" />
        <rect x="10" y="24" width="6" height="10" rx="2" fill="#306998" />
        <rect x="19" y="18" width="6" height="16" rx="2" fill="#93C5FD" />
        <rect x="28" y="12" width="6" height="22" rx="2" fill="#CBD5E1" />
      </svg>
    );
  }
  if (level === "Intermediate") {
    return (
      <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
        <rect width="44" height="44" rx="12" fill="#DBEAFE" />
        <rect x="10" y="24" width="6" height="10" rx="2" fill="#306998" />
        <rect x="19" y="18" width="6" height="16" rx="2" fill="#306998" />
        <rect x="28" y="12" width="6" height="22" rx="2" fill="#93C5FD" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
      <rect width="44" height="44" rx="12" fill="#0F172A" />
      <rect x="10" y="24" width="6" height="10" rx="2" fill="#60A5FA" />
      <rect x="19" y="18" width="6" height="16" rx="2" fill="#306998" />
      <rect x="28" y="12" width="6" height="22" rx="2" fill="#FFD43B" />
    </svg>
  );
}

/**
 * Split-screen executive brand panel for the Get Started Google Auth page
 */
export function AuthBrandShowcase() {
  return (
    <div className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden rounded-3xl bg-[#0F172A] p-10 text-white shadow-xl border border-slate-800">
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#306998]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#FFD43B]/10 blur-3xl"
      />

      <div className="relative z-10 space-y-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <img
            src={naomiLogo}
            alt="NaomiLearn logo"
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-xl border border-white/15 object-cover"
          />
          <div>
            <div className="text-lg font-extrabold tracking-tight text-white">NaomiLearn</div>
            <div className="text-xs font-medium text-sky-200">Python &amp; AI Academy</div>
          </div>
        </Link>

        <div className="space-y-3 pt-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-white leading-snug">
            Learn Python. Build your future.
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Work through structured modules from Beginner to Advanced, execute real Python 3 in the
            browser Code Lab, and receive Socratic coaching from your personal AI Tutor.
          </p>
        </div>

        {/* Hero Artwork Preview */}
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/60 shadow-md">
          <img
            src="/assets/aistudio/NaomiLearn__Neon_Python_AI_Academy_6441544b.png"
            alt="NaomiLearn Python and AI Academy workspace illustration"
            referrerPolicy="no-referrer"
            className="aspect-video w-full object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center gap-2 font-bold text-sky-200">
              <Code2 className="h-4 w-4 text-sky-300" />
              Structured Learning
            </div>
            <p className="mt-1 text-slate-300/80">
              Beginner, Intermediate &amp; Advanced tracks with live checkpoints.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center gap-2 font-bold text-sky-200">
              <Sparkles className="h-4 w-4 text-[#FFD43B]" />
              Socratic AI Tutor
            </div>
            <p className="mt-1 text-slate-300/80">
              Step-by-step hints, code reviews, and adaptive topic quizzes.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-300">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Cloud-Synced Progress via Google OAuth
        </span>
        <span className="flex items-center gap-1.5 font-mono">
          <Terminal className="h-3.5 w-3.5 text-sky-300" />
          Python 3 · Pyodide
        </span>
      </div>
    </div>
  );
}

/**
 * Reusable analytics & mastery visual card for Dashboard / Progress
 */
export function MasteryProgressGraphic({
  beginnerPct,
  intermediatePct,
  advancedPct,
}: {
  beginnerPct: number;
  intermediatePct: number;
  advancedPct: number;
}) {
  const tracks = [
    {
      label: "Beginner — Python Fundamentals",
      pct: beginnerPct,
      color: "bg-primary",
      modules: "Foundation Track",
    },
    {
      label: "Intermediate — Applied Python Development",
      pct: intermediatePct,
      color: "bg-[#234E73]",
      modules: "Engineering Track",
    },
    {
      label: "Advanced — Advanced Python & AI Engineering",
      pct: advancedPct,
      color: "bg-[#0F172A]",
      modules: "Production & AI Track",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Curriculum Track Mastery
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Completion progress across all three NaomiLearn Python tracks
          </p>
        </div>
        <Link
          to="/learn"
          className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
        >
          Open Syllabus →
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {tracks.map((t) => (
          <div
            key={t.label}
            className="rounded-xl border border-border bg-secondary/40 p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{t.label}</span>
              <span className="font-mono font-bold text-primary tabular-nums">{t.pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full ${t.color} transition-all duration-300`}
                style={{ width: `${t.pct}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">{t.modules}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
