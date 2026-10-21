import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Code2,
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
  Terminal,
  Flame,
  TrendingUp,
  Award,
} from "lucide-react";

import { NaomiLearnLogo } from "@/components/naomilearn-logo";
import { CURRICULUM_LESSONS, getLessonsByLevel, type LearningLevel } from "@/lib/curriculum";
import { useAuth } from "@/lib/auth";
import {
  CodeLabIllustration,
  AiTutorIllustration,
  TrackLevelEmblem,
} from "@/components/naomi-visuals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NaomiLearn — Python & AI Academy | Learn Python. Build your future." },
      {
        name: "description",
        content:
          "Learn Python. Build your future. Learn Python with your personal AI tutor across 24 structured modules, an in-browser Python 3 Code Lab, and adaptive quizzes.",
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

const TRACK_CARDS: {
  level: LearningLevel;
  badge: string;
  tagline: string;
  description: string;
  outcomes: string[];
  imagePath: string;
}[] = [
  {
    level: "Beginner",
    badge: "Modules 01 – 08",
    tagline: "Core Python Syntax & Computational Thinking",
    description:
      "Start from your very first Python program and master variables, conditionals, loops, dictionaries, and reusable functions.",
    outcomes: [
      "Write clean Python 3 scripts with variables, operators, and f-strings",
      "Control program flow using if/elif/else and for/while loops",
      "Manipulate lists, tuples, sets, and dictionaries with confidence",
    ],
    imagePath: "/assets/aistudio/31e1ad6a2e5ec38cc9a838027e98601e_b85f6a08.jpg",
  },
  {
    level: "Intermediate",
    badge: "Modules 09 – 16",
    tagline: "Object-Oriented Design, Files & Data Processing",
    description:
      "Transition from scripts to structured software with file handling, JSON APIs, exception safety, classes, and comprehensions.",
    outcomes: [
      "Design modular classes and object-oriented Python architectures",
      "Process structured JSON datasets and handle runtime exceptions safely",
      "Use list/dict comprehensions, iterators, and standard library tools",
    ],
    imagePath: "/assets/aistudio/173ee0eb290de65a6797e654d3040586_9ef4af1c.jpg",
  },
  {
    level: "Advanced",
    badge: "Modules 17 – 24",
    tagline: "Async Systems, Algorithms & AI Engineering",
    description:
      "Master production-grade Python with decorators, generators, static type checking, async concurrency, and AI pipeline architecture.",
    outcomes: [
      "Build custom decorators, memory-efficient generators, and async tasks",
      "Analyze algorithmic complexity and optimize performance with caching",
      "Architect end-to-end AI prompt and evaluation pipelines in Python",
    ],
    imagePath: "/assets/aistudio/ac14867d03e8c386ace5cecb7df31f8e_8406eee2.jpg",
  },
];

const CORE_FEATURES: {
  icon: typeof BookOpen;
  title: string;
  description: string;
  actionLabel: string;
  targetRoute: "/learn" | "/practice" | "/quizzes" | "/tutor";
}[] = [
  {
    icon: BookOpen,
    title: "24 Structured Python Lessons",
    description:
      "Step-by-step modules spanning Beginner, Intermediate, and Advanced tracks with clear objectives, annotated code, and common pitfalls.",
    actionLabel: "Browse 24 Modules",
    targetRoute: "/learn",
  },
  {
    icon: Code2,
    title: "In-Browser Python 3 Code Lab",
    description:
      "Write and execute real Python 3 code directly in your browser with instant stdout feedback, progressive hints, and automated solution verification.",
    actionLabel: "Open Code Lab",
    targetRoute: "/practice",
  },
  {
    icon: ClipboardCheck,
    title: "Adaptive Topic Quizzes",
    description:
      "Validate your understanding with curated and AI-generated quizzes that explain why each answer is right or wrong.",
    actionLabel: "Take a Topic Quiz",
    targetRoute: "/quizzes",
  },
  {
    icon: Sparkles,
    title: "Personal AI Python Tutor",
    description:
      "Ask Naomi for Socratic hints, line-by-line code breakdowns, debugging help, or custom exercises tailored to your current level.",
    actionLabel: "Ask Your AI Tutor",
    targetRoute: "/tutor",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01. Authenticate with Google",
    title: "Sign In with Google",
    description:
      "Connect your Google account in one click to unlock your personal Python workspace and automatic cloud progress sync.",
  },
  {
    step: "02. Interactive Curriculum",
    title: "Study 24 Structured Modules",
    description:
      "Read concise, structured lessons with real-world Python 3 code examples and clear learning objectives across three skill tracks.",
  },
  {
    step: "03. Browser Code Execution",
    title: "Practice in the Code Lab",
    description:
      "Solve hands-on coding exercises in the browser-based Python 3 runtime and verify your output against automated checkpoints.",
  },
  {
    step: "04. Adaptive Mastery",
    title: "Master with AI & Quizzes",
    description:
      "Ask your personal AI Tutor whenever you get stuck and complete adaptive quizzes to track your accuracy and daily streak.",
  },
];

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [heroImgError, setHeroImgError] = useState(false);

  const getStartedTarget = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* 1. Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="whitespace-nowrap shrink-0">
            <NaomiLearnLogo size="md" />
          </Link>

          <nav
            aria-label="Homepage sections"
            className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted-foreground"
          >
            <a
              href="#features"
              className="transition-colors hover:text-primary hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#tracks"
              className="transition-colors hover:text-primary hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Course Tracks
            </a>
            <a
              href="#progress-preview"
              className="transition-colors hover:text-primary hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Progress Preview
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-primary hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
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

      <main className="flex-1">
        {/* 2. Hero Section — Balanced Responsive Two-Column Layout on Desktop, Clean Stack on Mobile/Tablet */}
        <section className="relative overflow-hidden border-b border-border bg-hero-python bg-grid-python py-10 sm:py-16 lg:py-22">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Headline, Supporting Copy & Primary CTA */}
              <div className="lg:col-span-6 space-y-5 sm:space-y-6 animate-fade-up">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary">
                  <span>NaomiLearn Python &amp; AI Academy</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-muted-foreground">24 Interactive Modules</span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem] lg:leading-[1.12]">
                  <span className="text-primary">Learn Python.</span> Build your future.
                </h1>

                <div className="space-y-2 max-w-xl">
                  <p className="text-lg sm:text-xl font-bold text-foreground">
                    Learn Python with your personal AI tutor.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Master 24 structured modules from foundational syntax to AI systems, execute
                    real Python 3 code directly in your browser, and validate every concept with
                    adaptive quizzes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Link
                    to={getStartedTarget}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm sm:text-base font-bold text-primary-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:shadow-md whitespace-nowrap shrink-0"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                  <a
                    href="#tracks"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary whitespace-nowrap shrink-0"
                  >
                    <span>Explore Course Tracks</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                  </a>
                </div>

                {/* Key Platform Metrics */}
                <div className="grid grid-cols-3 gap-4 border-t border-border pt-6 max-w-lg">
                  <div>
                    <div className="font-mono text-xl sm:text-2xl font-extrabold text-primary tabular-nums">
                      24
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Hands-On Modules
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                      Python 3
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Browser Code Lab
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xl sm:text-2xl font-extrabold text-gold tabular-nums">
                      24/7
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Personal AI Tutor
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Harmonious Responsive Hero Artwork Container (Visible on Desktop, Tablet & Mobile) */}
              <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
                <div className="relative w-full max-w-xl lg:max-w-[560px]">
                  {/* Soft Python-Blue & Warm Gold Ambient Spotlight Behind Visual */}
                  <div
                    aria-hidden="true"
                    className="hero-spotlight pointer-events-none absolute -inset-3 sm:-inset-5 rounded-3xl bg-gradient-to-tr from-[#306998]/20 via-sky-400/12 to-[#FFD43B]/20 blur-2xl"
                  />

                  <figure className="relative z-10 overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/20 bg-card p-2 sm:p-2.5 shadow-lg ring-1 ring-primary/10">
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
                        className="block w-full h-auto aspect-[16/10] max-h-[250px] sm:max-h-[340px] lg:max-h-[400px] rounded-xl sm:rounded-2xl object-cover object-center transition-transform duration-300 hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="aspect-[16/10] w-full flex flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-[#0F172A] p-8 text-center text-white">
                        <Terminal className="h-10 w-10 text-sky-300 mb-2" />
                        <div className="font-bold">NaomiLearn — Python &amp; AI Academy</div>
                      </div>
                    )}
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Concise Introduction to NaomiLearn */}
        <section className="border-b border-border bg-card py-14 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 space-y-4">
            <div className="text-xs font-bold text-primary">
              Designed for Clarity &amp; Real Execution
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              A focused, distraction-free environment to master Python from first print statement to
              AI systems
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground">
              NaomiLearn combines a structured 24-module Python curriculum, an in-browser Python 3
              execution lab, adaptive topic quizzes, and a Socratic Gemini AI tutor—all unified
              under a single Google account.
            </p>
          </div>
        </section>

        {/* 4. Feature Sections (Lessons, Code Lab, Quizzes, AI Tutor) */}
        <section id="features" className="scroll-mt-16 border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs font-bold text-primary">Platform Capabilities</div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Everything you need to learn, run, test, and debug Python in one place
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Every lesson connects directly to hands-on code execution, automated verification,
                and personalized AI coaching.
              </p>
            </div>

            {/* 4 Feature Pillar Cards with Lift-on-Hover & Specific Feature Links */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {CORE_FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feat.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-tight text-foreground">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {feat.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <Link
                      to={feat.targetRoute}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline whitespace-nowrap"
                    >
                      <span>{feat.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Deep-Dive: Code Lab + AI Tutor Illustrations */}
            <div className="grid gap-8 lg:grid-cols-2 pt-2">
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md space-y-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Interactive Python 3 Code Lab</span>
                  <span className="font-mono text-muted-foreground">
                    Pyodide + Python 3 Runtime
                  </span>
                </div>
                <CodeLabIllustration className="w-full rounded-2xl border border-border" />
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-foreground">
                    Execute real Python 3 code with instant verification
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    Practice every concept in an interactive editor with starter templates,
                    progressive hints, stdout inspection, and automated test verification.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md space-y-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Personal AI Python Tutor</span>
                  <span className="font-mono text-muted-foreground">
                    Socratic Coaching &amp; Code Review
                  </span>
                </div>
                <AiTutorIllustration className="w-full rounded-2xl border border-border" />
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-foreground">
                    Guided explanations adapted to your exact skill level
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    Naomi understands your active module and progress—offering step-by-step hints,
                    line-by-line code breakdowns with copyable snippets, and custom practice
                    challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Beginner, Intermediate, and Advanced Course-Track Cards */}
        <section
          id="tracks"
          className="scroll-mt-16 border-b border-border bg-card/60 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2.5">
              <div className="text-xs font-bold text-primary">Structured 24-Module Syllabus</div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Three progressive Python tracks from Beginner to Advanced AI
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Each track includes 8 comprehensive modules with runnable examples, coding
                checkpoints, and topic quizzes.
              </p>
            </div>

            <div className="grid gap-7 lg:grid-cols-3">
              {TRACK_CARDS.map((track) => {
                const trackLessons = getLessonsByLevel(track.level);

                return (
                  <article
                    key={track.level}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      {/* Track Visual Header */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-slate-900">
                        <img
                          src={track.imagePath}
                          alt={`${track.level} Python track illustration`}
                          width={800}
                          height={450}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-white">
                          <span className="font-bold">{track.badge}</span>
                          <span className="font-semibold text-[#FFD43B]">
                            {trackLessons.length} Modules
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <TrackLevelEmblem level={track.level} className="h-10 w-10 shrink-0" />
                          <div>
                            <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                              {track.level} Track
                            </h3>
                            <p className="text-xs font-semibold text-primary">{track.tagline}</p>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                          {track.description}
                        </p>

                        <div className="space-y-2 pt-1">
                          <div className="text-xs font-bold text-foreground">
                            Key Learning Outcomes
                          </div>
                          <ul className="space-y-1.5 text-xs text-foreground">
                            {track.outcomes.map((outcome) => (
                              <li key={outcome} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Sample Modules Preview */}
                        <div className="rounded-xl border border-border bg-secondary/35 p-3 space-y-1.5">
                          <div className="text-[11px] font-bold text-secondary-foreground">
                            Sample Modules ({trackLessons.length} total):
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {trackLessons
                              .slice(0, 4)
                              .map((m) => `${String(m.number).padStart(2, "0")}. ${m.shortTitle}`)
                              .join(" · ")}{" "}
                            · +{trackLessons.length - 4} more
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border p-6 pt-4">
                      <Link
                        to="/learn"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-secondary/70 px-4 py-2.5 text-xs sm:text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
                      >
                        <span>Explore {track.level} Track</span>
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Dashboard / Learning-Progress Preview */}
        <section
          id="progress-preview"
          className="scroll-mt-16 border-b border-border py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5 space-y-5">
                <div className="text-xs font-bold text-primary">
                  Student Dashboard &amp; Analytics
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Track your daily streak, quiz accuracy, and module mastery in real time
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Your NaomiLearn dashboard automatically records completed lessons, Code Lab
                  exercises, and quiz scores—highlighting your strongest Python topics and
                  recommending what to study next.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-foreground">
                  <li className="flex items-start gap-2.5">
                    <Flame className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>
                      <strong>Daily Streak &amp; Goal Tracking:</strong> Stay consistent with
                      customizable daily learning targets.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      <strong>Topic Accuracy Breakdown:</strong> Identify strong modules and focus
                      areas across all 24 lessons.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>
                      <strong>Cloud-Synced via Google:</strong> Pick up right where you left off on
                      any device.
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-secondary px-5 py-3 text-xs sm:text-sm font-bold text-primary transition-all duration-150 hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
                  >
                    <span>Open Student Dashboard</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Interactive Dashboard Preview Card */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <div className="text-xs font-bold text-primary">
                        Student Progress Snapshot
                      </div>
                      <div className="text-base font-extrabold text-foreground">
                        Python &amp; AI Mastery Overview
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-primary tabular-nums">
                      {CURRICULUM_LESSONS.length} Curriculum Modules
                    </span>
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Flame className="h-4 w-4 text-gold" />
                        Learning Streak
                      </div>
                      <div className="mt-1.5 font-mono text-2xl font-extrabold text-foreground tabular-nums">
                        7 Days
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Daily target active
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Quiz Accuracy
                      </div>
                      <div className="mt-1.5 font-mono text-2xl font-extrabold text-foreground tabular-nums">
                        92%
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Verified across modules
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Code2 className="h-4 w-4 text-primary" />
                        Code Lab Runs
                      </div>
                      <div className="mt-1.5 font-mono text-2xl font-extrabold text-foreground tabular-nums">
                        Python 3
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Automated checkpoints
                      </div>
                    </div>
                  </div>

                  {/* Track Progress Bars Preview */}
                  <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
                    {[
                      { label: "Beginner Track (Modules 01–08)", pct: 100, color: "bg-primary" },
                      {
                        label: "Intermediate Track (Modules 09–16)",
                        pct: 65,
                        color: "bg-[#234E73]",
                      },
                      { label: "Advanced Track (Modules 17–24)", pct: 25, color: "bg-[#0F172A]" },
                    ].map((row) => (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-foreground">{row.label}</span>
                          <span className="font-mono font-bold text-primary tabular-nums">
                            {row.pct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div className={`h-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. How Learning Works */}
        <section
          id="how-it-works"
          className="scroll-mt-16 border-b border-border bg-card/60 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2.5">
              <div className="text-xs font-bold text-primary">How Learning Works</div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Four structured steps from concept to verified Python code
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Every module follows a proven active-learning loop so you retain concepts by writing
                and testing real programs.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-border bg-card p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md space-y-3"
                >
                  <div className="font-mono text-xs font-bold text-primary">{item.step}</div>
                  <h3 className="text-base font-extrabold text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Final Call-to-Action with Get Started */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0F172A] px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/35 blur-3xl"
              />
              <div className="relative z-10 mx-auto max-w-2xl space-y-5">
                <div className="text-xs font-bold text-sky-300">
                  NaomiLearn · Python &amp; AI Academy
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Learn Python. Build your future.
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                  Learn Python with your personal AI tutor. Sign in with your Google account to
                  unlock all 24 interactive Python modules, the browser Code Lab, and adaptive
                  quizzes.
                </p>
                <div className="pt-2">
                  <Link
                    to={getStartedTarget}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent whitespace-nowrap"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Clean Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center shrink-0">
            <NaomiLearnLogo size="md" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-primary">
              Features
            </a>
            <a href="#tracks" className="hover:text-primary">
              Course Tracks
            </a>
            <a href="#progress-preview" className="hover:text-primary">
              Progress Preview
            </a>
            <a href="#how-it-works" className="hover:text-primary">
              How It Works
            </a>
            <Link to="/learn" className="hover:text-primary">
              Curriculum
            </Link>
          </div>

          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} NaomiLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
