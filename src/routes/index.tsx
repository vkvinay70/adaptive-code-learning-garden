import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Sparkles,
  CheckCircle2,
  Terminal,
  Flame,
  TrendingUp,
  BarChart3,
  Layers,
  Cpu,
  UserCheck,
  Sun,
  Moon,
} from "lucide-react";

import { NaomiLearnLogo } from "@/components/naomilearn-logo";
import { type LearningLevel } from "@/lib/curriculum";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NaomiLearn — Python & AI Academy | Learn Python. Build your future." },
      {
        name: "description",
        content:
          "Learn Python. Build your future. Learn Python with your personal AI tutor across structured modules, an in-browser Python 3 Code Lab, and adaptive quizzes.",
      },
      {
        property: "og:title",
        content: "NaomiLearn — Python & AI Academy",
      },
      {
        property: "og:description",
        content: "Learn Python. Build your future. Learn Python with your personal AI tutor.",
      },
    ],
  }),
  component: HomePage,
});

const HERO_IMAGE_PATH = "/assets/aistudio/NaomiLearn__Neon_Python_AI_Academy_6441544b.png";

function GoogleIcon({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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

const TRACK_CARDS: {
  level: LearningLevel;
  title: string;
  tagline: string;
  description: string;
  outcomes: string[];
  featuredTopics: string[];
  icon: typeof BarChart3;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    level: "Beginner",
    title: "Beginner Track",
    tagline: "Python Fundamentals",
    description: "Start from the basics and build a strong foundation in Python programming.",
    outcomes: [
      "Write clean Python 3 scripts with variables, operators, and f-strings",
      "Control program flow using if/elif/else and for/while loops",
      "Manipulate lists, tuples, sets, and dictionaries with confidence",
    ],
    featuredTopics: [
      "Variables & Data Types",
      "Conditionals & Logic",
      "Loops & Iteration",
      "Lists & Dictionaries",
      "Functions & Scope",
    ],
    icon: BarChart3,
    iconBg: "bg-sky-100 dark:bg-sky-950/70",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    level: "Intermediate",
    title: "Intermediate Track",
    tagline: "Applied Python Development",
    description:
      "Move from concepts to real-world development with files, data, APIs, and classes.",
    outcomes: [
      "Design modular classes and object-oriented Python architectures",
      "Process structured JSON datasets and handle runtime exceptions safely",
      "Use list/dict comprehensions, iterators, and standard library tools",
    ],
    featuredTopics: [
      "Object-Oriented Programming",
      "File Handling & JSON",
      "Exception Handling",
      "Comprehensions & Generators",
      "Standard Library Modules",
    ],
    icon: Layers,
    iconBg: "bg-blue-100 dark:bg-blue-950/70",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    level: "Advanced",
    title: "Advanced Track",
    tagline: "Advanced Python & AI Engineering",
    description:
      "Master modern Python, async programming, generators, and AI pipeline architecture.",
    outcomes: [
      "Build custom decorators, memory-efficient generators, and async tasks",
      "Analyze algorithmic complexity and optimize performance with caching",
      "Architect end-to-end AI prompt and evaluation pipelines in Python",
    ],
    featuredTopics: [
      "Custom Decorators & Metaprogramming",
      "Asyncio & Concurrency",
      "Algorithmic Complexity",
      "Static Typing & Protocols",
      "AI Pipeline Architecture",
    ],
    icon: Cpu,
    iconBg: "bg-slate-900 dark:bg-slate-800",
    iconColor: "text-white dark:text-sky-300",
  },
];

const CORE_FEATURES = [
  {
    icon: BookOpen,
    iconBg: "bg-blue-100 dark:bg-blue-950/70",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Structured Learning Path",
    description: "From Python basics to advanced AI concepts with real examples.",
  },
  {
    icon: Code2,
    iconBg: "bg-blue-100 dark:bg-blue-950/70",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Interactive Code Lab",
    description: "Write, run, and experiment with Python 3 in your browser.",
  },
  {
    icon: CheckCircle2,
    iconBg: "bg-emerald-100 dark:bg-emerald-950/70",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Adaptive Quizzes",
    description: "Practice with instant feedback and track your understanding.",
  },
  {
    icon: Sparkles,
    iconBg: "bg-purple-100 dark:bg-purple-950/70",
    iconColor: "text-purple-600 dark:text-purple-400",
    title: "Personal AI Tutor",
    description: "Get step-by-step help and explanations whenever you need it.",
  },
];

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [heroImgError, setHeroImgError] = useState(false);

  const getStartedTarget = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-background text-foreground overflow-x-hidden">
      {/* 1. Top Navigation Bar (Matching Reference Image 1) */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 dark:bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="whitespace-nowrap shrink-0">
            <NaomiLearnLogo size="md" />
          </Link>

          <nav
            aria-label="Homepage navigation"
            className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted-foreground"
          >
            <a
              href="#"
              className="text-foreground transition-colors hover:text-primary whitespace-nowrap"
            >
              Home
            </a>
            <a href="#features" className="transition-colors hover:text-primary whitespace-nowrap">
              Features
            </a>
            <a href="#tracks" className="transition-colors hover:text-primary whitespace-nowrap">
              How It Works
            </a>
            <a
              href="#progress-preview"
              className="transition-colors hover:text-primary whitespace-nowrap"
            >
              For Students
            </a>
            <a href="#tracks" className="transition-colors hover:text-primary whitespace-nowrap">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle Icon Preview */}
            <div
              className="hidden sm:flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-secondary/50 text-muted-foreground transition-colors"
              title="Theme Toggle"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </div>

            <Link
              to={getStartedTarget}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-primary-foreground shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent whitespace-nowrap shrink-0"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-12 sm:space-y-16 pb-12 sm:pb-16">
        {/* 2. Hero Section (Matching Reference Image 1) */}
        <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-6 sm:pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Pill, Two-tone Headline, Subtext, CTAs, 3 Mini Badges */}
              <div className="lg:col-span-6 space-y-6">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-primary dark:border-blue-900/50 dark:bg-blue-950/50">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Your Journey to Python &amp; AI Starts Here</span>
                </div>

                {/* Two-Tone Headline */}
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.12]">
                  <span className="block text-foreground">Learn Python.</span>
                  <span className="block text-primary">Build your future.</span>
                </h1>

                {/* Supporting Copy */}
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Learn Python with your personal AI tutor. Master real skills through interactive
                  lessons, hands-on projects, and adaptive practice.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <Link
                    to={getStartedTarget}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:shadow-md whitespace-nowrap"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white p-0.5">
                      <GoogleIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>Get Started with Google</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>

                  <a
                    href="#tracks"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-white dark:bg-card px-5 py-3 text-sm font-bold text-foreground shadow-2xs transition-all duration-150 hover:bg-secondary whitespace-nowrap"
                  >
                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    <span>Explore Courses</span>
                  </a>
                </div>

                {/* Three Mini Pill Badges */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-semibold">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3 py-1 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <Terminal className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Hands-on Practice</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/70 bg-purple-50/80 px-3 py-1 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/50 dark:text-purple-300">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span>AI-Powered Learning</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/50 dark:text-sky-300">
                    <TrendingUp className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Track Your Progress</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Artwork */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg lg:max-w-xl">
                  <div className="overflow-hidden rounded-3xl border border-border/80 bg-white dark:bg-card p-2 shadow-md">
                    {!heroImgError ? (
                      <img
                        src={HERO_IMAGE_PATH}
                        alt="NaomiLearn Python and AI Academy interactive learning showcase"
                        width={1280}
                        height={800}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgError(true)}
                        className="block w-full h-auto aspect-[16/10] rounded-2xl object-cover object-center"
                      />
                    ) : (
                      <div className="aspect-[16/10] w-full flex flex-col items-center justify-center rounded-2xl bg-[#0F172A] p-8 text-center text-white">
                        <Terminal className="h-10 w-10 text-sky-300 mb-2" />
                        <div className="font-bold">NaomiLearn — Python &amp; AI Academy</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Platform Capabilities (4 Cards in a Row - Matching Reference Image 1) */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CORE_FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-border bg-white dark:bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md flex items-start gap-4"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${feat.iconBg} ${feat.iconColor}`}
                  >
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-foreground">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Curriculum / Course Tracks (Text-First, Clean, No Decorative Images) */}
        <section id="tracks" className="scroll-mt-20 pt-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Three progressive Python tracks
                  <br />
                  from Beginner to Advanced AI
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Choose the track that matches your goals. Each track includes comprehensive
                  modules with runnable examples, coding checkpoints, and topic quizzes.
                </p>
              </div>

              <Link
                to={isAuthenticated ? "/learn" : "/login"}
                search={isAuthenticated ? undefined : { redirect: "/learn" }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline whitespace-nowrap shrink-0"
              >
                <span>Learn more about our curriculum</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>

            {/* 3 Text-First Course Track Cards (Equal Heights, No Large Decorative Images) */}
            <div className="grid gap-6 lg:grid-cols-3 items-stretch">
              {TRACK_CARDS.map((track) => (
                <article
                  key={track.level}
                  className="rounded-3xl border border-border bg-white dark:bg-card p-6 sm:p-7 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full space-y-6"
                >
                  <div className="space-y-5">
                    {/* Header Row: Relevant Small Icon + Track Name & Subtitle */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${track.iconBg} ${track.iconColor}`}
                      >
                        <track.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                          {track.title}
                        </h3>
                        <p className="text-xs font-semibold text-primary">{track.tagline}</p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {track.description}
                    </p>

                    {/* Key Learning Outcomes */}
                    <div className="space-y-2 pt-1 border-t border-border/60">
                      <div className="text-xs font-bold text-foreground">Key Learning Outcomes</div>
                      <ul className="space-y-2 text-xs text-foreground">
                        {track.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="leading-tight">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Featured Topics */}
                    <div className="rounded-xl border border-border/80 bg-secondary/35 p-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-secondary-foreground">
                        Featured Topics:
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {track.featuredTopics.join(" · ")}
                      </div>
                    </div>
                  </div>

                  {/* Explore Track Action */}
                  <div className="pt-2">
                    <Link
                      to={isAuthenticated ? "/learn" : "/login"}
                      search={isAuthenticated ? undefined : { redirect: "/learn" }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-secondary/70 px-4 py-3 text-xs sm:text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white whitespace-nowrap"
                    >
                      <span>Explore {track.level} Track</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Track Your Progress and Stay Motivated (Matching Reference Image 1) */}
        <section id="progress-preview" className="scroll-mt-20 pt-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              {/* Left Column: Heading, Subtext, Open Dashboard CTA */}
              <div className="lg:col-span-5 space-y-5">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Track your progress and stay motivated
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  See your learning streak, quiz accuracy, and module completion—all in one place.
                </p>

                <div className="pt-1">
                  <Link
                    to={isAuthenticated ? "/dashboard" : "/login"}
                    search={isAuthenticated ? undefined : { redirect: "/dashboard" }}
                    className="inline-flex items-center gap-2.5 rounded-xl border border-primary/25 bg-secondary/70 px-5 py-3 text-xs sm:text-sm font-bold text-primary transition-all duration-150 hover:bg-primary hover:text-white whitespace-nowrap"
                  >
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span>Open Student Dashboard</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Student Progress Snapshot Card with Sample Preview */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-border bg-white dark:bg-card p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span>Student Progress Snapshot</span>
                    </div>
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-[11px] font-semibold text-primary">
                      Sample Preview
                    </span>
                  </div>

                  {/* 3 Metric Boxes */}
                  <div className="grid gap-3.5 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Flame className="h-4 w-4 text-[#FFD43B]" />
                        <span>Learning Streak</span>
                      </div>
                      <div className="mt-1.5 font-mono text-2xl font-extrabold text-foreground tabular-nums">
                        7 Days
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">Keep going!</div>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <span>Quiz Accuracy</span>
                      </div>
                      <div className="mt-1.5 font-mono text-2xl font-extrabold text-foreground tabular-nums">
                        92%
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Across all quizzes
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Code2 className="h-4 w-4 text-primary" />
                        <span>Code Lab Runs</span>
                      </div>
                      <div className="mt-1.5 font-mono text-2xl font-extrabold text-foreground tabular-nums">
                        Python 3
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Practice &amp; build skills
                      </div>
                    </div>
                  </div>

                  {/* 3 Track Progress Bars */}
                  <div className="space-y-3 rounded-2xl border border-border bg-[#f8fafc] dark:bg-background p-4">
                    {[
                      { label: "Beginner Track", pct: 100 },
                      { label: "Intermediate Track", pct: 65 },
                      { label: "Advanced Track", pct: 25 },
                    ].map((row) => (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-foreground">{row.label}</span>
                          <span className="font-mono font-bold text-primary tabular-nums">
                            {row.pct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Dark Call To Action Banner (Matching Reference Image 1) */}
        <section className="pt-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0B1528] px-6 py-8 sm:px-12 sm:py-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="text-xs font-bold text-sky-300">
                  NaomiLearn · Python &amp; AI Academy
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Learn Python. Build your future.
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Join thousands of learners and start your Python journey today.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  to={getStartedTarget}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent whitespace-nowrap"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white p-0.5">
                    <GoogleIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Minimal Clean Footer (Matching Reference Image 1) */}
      <footer className="border-t border-border bg-white dark:bg-card py-8 pb-28 sm:pb-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link to="/" className="inline-flex items-center shrink-0">
              <NaomiLearnLogo size="md" />
            </Link>
            <p className="text-xs text-muted-foreground sm:border-l sm:border-border sm:pl-3">
              Learn Python through hands-on practice and personalized AI guidance.
            </p>
          </div>

          <p className="text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
            &copy; 2026 NaomiLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
