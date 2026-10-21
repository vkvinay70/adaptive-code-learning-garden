import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Code2,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Terminal,
  Compass,
  Menu,
  X,
  Play,
  Loader2,
  Target,
  Award,
  Flame,
  Lock,
  Wrench,
  Lightbulb,
} from "lucide-react";
import { CURRICULUM_LESSONS, type LearningLevel } from "@/lib/curriculum";
import { runPythonInBrowser } from "@/lib/pyodide";
import {
  loadCompletedLessons,
  loadCompletedExercises,
  loadDailyGoal,
  getTodayCount,
  getStreak,
  loadStats,
  analyze,
  type CompletedLessonRecord,
} from "@/lib/tutor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NaomiLearn — Python & AI Academy | Learn Python. Build your future." },
      {
        name: "description",
        content:
          "Learn Python step by step with personalized AI assistance. Interactive Beginner, Intermediate, and Advanced Python lessons, in-browser Code Lab, quizzes, and AI Tutor.",
      },
      {
        property: "og:title",
        content: "NaomiLearn — Python & AI Academy",
      },
      {
        property: "og:description",
        content:
          "Learn Python. Master AI. Build Your Future. Step-by-step Python lessons, real Code Lab execution, adaptive quizzes, and personal AI tutoring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const HERO_IMAGE_PATH = "/assets/aistudio/NaomiLearn__Neon_Python_AI_Academy_6441544b.png";

const HERO_CODE_SNIPPETS = [
  {
    id: "beg",
    label: "01. Loops & F-Strings",
    filename: "academy_welcome.py",
    level: "Beginner",
    code: `topics = ["Variables", "Loops", "Functions", "AI Agents"]
for idx, topic in enumerate(topics, start=1):
    print(f"Step {idx}: Mastering {topic}")`,
    defaultOutput: `Step 1: Mastering Variables\nStep 2: Mastering Loops\nStep 3: Mastering Functions\nStep 4: Mastering AI Agents`,
  },
  {
    id: "int",
    label: "02. List Comprehensions",
    filename: "score_analyzer.py",
    level: "Intermediate",
    code: `scores = [72, 88, 95, 64, 91, 100]
passed = [s for s in scores if s >= 85]
avg = sum(passed) / len(passed)
print(f"High achievers: {passed} (Avg: {avg:.1f}%)")`,
    defaultOutput: `High achievers: [88, 95, 91, 100] (Avg: 93.5%)`,
  },
  {
    id: "adv",
    label: "03. AI Context Pipeline",
    filename: "rag_pipeline.py",
    level: "Advanced",
    code: `docs = {"loops": "Repeat blocks cleanly", "dicts": "O(1) key-value lookup"}
query = "dicts"
context = docs.get(query, "General Python")
print(f"[Prompt Ready] Topic: {query} -> {context}")`,
    defaultOutput: `[Prompt Ready] Topic: dicts -> O(1) key-value lookup`,
  },
];

const LEVEL_CARDS: {
  level: LearningLevel;
  number: string;
  subtitle: string;
  duration: string;
  description: string;
  highlights: string[];
}[] = [
  {
    level: "Beginner",
    number: "01. Foundation Track",
    subtitle: "8 Modules · Zero Prior Experience Required",
    duration: "~3.5 hours",
    description:
      "Start from your very first print() statement and build fluency with variables, operators, branching conditionals, loops, collections, functions, and debugging.",
    highlights: [
      "Python setup, syntax & first program",
      "Variables, f-strings, input/output & operators",
      "Conditionals (if/elif/else) & for/while loops",
      "Lists, tuples, sets, dicts, functions & mini project",
    ],
  },
  {
    level: "Intermediate",
    number: "02. Core Engineering Track",
    subtitle: "8 Modules · Data Structures, OOP & Files",
    duration: "~4.5 hours",
    description:
      "Write expressive, idiomatic Python using sequence slicing, flexible function signatures, context managers, defensive exception handling, classes, and comprehensions.",
    highlights: [
      "Strings, slicing & collections in depth",
      "Functions, *args/**kwargs, modules & packages",
      "File handling, JSON serialization & exceptions",
      "Object-oriented programming, comprehensions & projects",
    ],
  },
  {
    level: "Advanced",
    number: "03. Production & AI Track",
    subtitle: "8 Modules · Architecture, Async & AI Pipelines",
    duration: "~5.5 hours",
    description:
      "Master professional systems engineering: decorators, lazy generators, dataclasses, static type hints, Big-O algorithms, asyncio concurrency, and AI prompt pipelines.",
    highlights: [
      "Higher-order decorators & lazy yield generators",
      "Dataclasses, dunder protocols, type hints & testing",
      "Algorithms, Big-O data structures & asyncio",
      "LRU caching, API architecture & AI retrieval capstone",
    ],
  },
];

const JOURNEY_STEPS = [
  {
    step: "01. Learn Concepts with Clarity",
    title: "Structured Modules Built for Real Understanding",
    description:
      "Each module introduces one core concept at a time with clear learning objectives, line-by-line explanations, and runnable Python examples you can inspect and modify.",
    link: "/learn",
    linkLabel: "Explore 24 Modules",
  },
  {
    step: "02. Practice in the WebAssembly Code Lab",
    title: "Run Real Python 3 Code Directly in Your Browser",
    description:
      "Write code in the interactive Code Lab powered by Pyodide. Execute scripts, inspect standard output and tracebacks, use progressive hints, and validate solutions against exercise checks.",
    link: "/practice",
    linkLabel: "Launch Code Lab",
  },
  {
    step: "03. Coach with Your Personal AI Tutor",
    title: "Socratic Guidance That Teaches Instead of Spoiling",
    description:
      "Ask Naomi, your Gemini-powered AI Tutor, to explain code line by line, simplify tricky concepts, review your code, or generate custom practice questions tailored to your current level.",
    link: "/tutor",
    linkLabel: "Ask Naomi Tutor",
  },
  {
    step: "04. Verify Mastery & Track Progress",
    title: "Adaptive Topic Quizzes & Honest Learning Analytics",
    description:
      "Test your retention with Beginner, Intermediate, and Advanced quizzes. Review detailed answer explanations and watch your daily streak, accuracy, and completed lessons grow.",
    link: "/quizzes",
    linkLabel: "Take a Topic Quiz",
  },
];

function TrackIllustration({ level }: { level: LearningLevel }) {
  if (level === "Beginner") {
    return (
      <div className="relative flex h-28 w-full items-center justify-between overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-[#0F172A] px-5 py-4 text-white">
        <div className="space-y-1">
          <div className="font-mono text-[11px] text-purple-300">
            print(&quot;Hello, Python!&quot;)
          </div>
          <div className="text-xs font-semibold text-slate-200">
            Syntax · Variables · Control Flow
          </div>
          <div className="font-mono text-[11px] text-emerald-300">for step in range(1, 9):</div>
        </div>
        <svg viewBox="0 0 120 80" className="h-20 w-28 shrink-0" aria-hidden="true">
          <rect
            x="10"
            y="44"
            width="28"
            height="24"
            rx="5"
            fill="#7C3AED"
            stroke="#C4B5FD"
            strokeWidth="1.5"
          />
          <rect
            x="46"
            y="28"
            width="28"
            height="40"
            rx="5"
            fill="#6D28D9"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
          <rect
            x="82"
            y="12"
            width="28"
            height="56"
            rx="5"
            fill="#F59E0B"
            stroke="#FDE68A"
            strokeWidth="1.5"
          />
          <path
            d="M24 38 L60 22 L96 8"
            stroke="#A7F3D0"
            strokeWidth="2"
            strokeDasharray="3 3"
            fill="none"
          />
          <circle cx="24" cy="38" r="3.5" fill="#34D399" />
          <circle cx="60" cy="22" r="3.5" fill="#34D399" />
          <circle cx="96" cy="8" r="3.5" fill="#FBBF24" />
        </svg>
      </div>
    );
  }

  if (level === "Intermediate") {
    return (
      <div className="relative flex h-28 w-full items-center justify-between overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#311068] px-5 py-4 text-white">
        <div className="space-y-1">
          <div className="font-mono text-[11px] text-sky-300">class DataPipeline:</div>
          <div className="text-xs font-semibold text-slate-200">
            Data Structures · OOP · JSON I/O
          </div>
          <div className="font-mono text-[11px] text-purple-300">
            [x.transform() for x in items]
          </div>
        </div>
        <svg viewBox="0 0 120 80" className="h-20 w-28 shrink-0" aria-hidden="true">
          <line x1="60" y1="16" x2="30" y2="44" stroke="#93C5FD" strokeWidth="1.75" />
          <line x1="60" y1="16" x2="90" y2="44" stroke="#C4B5FD" strokeWidth="1.75" />
          <line x1="30" y1="44" x2="18" y2="66" stroke="#93C5FD" strokeWidth="1.5" />
          <line x1="30" y1="44" x2="44" y2="66" stroke="#93C5FD" strokeWidth="1.5" />
          <line x1="90" y1="44" x2="76" y2="66" stroke="#C4B5FD" strokeWidth="1.5" />
          <line x1="90" y1="44" x2="104" y2="66" stroke="#C4B5FD" strokeWidth="1.5" />
          <circle cx="60" cy="16" r="8" fill="#7C3AED" stroke="#EDE9FE" strokeWidth="1.5" />
          <circle cx="30" cy="44" r="7" fill="#0284C7" stroke="#E0F2FE" strokeWidth="1.5" />
          <circle cx="90" cy="44" r="7" fill="#6D28D9" stroke="#EDE9FE" strokeWidth="1.5" />
          <circle cx="18" cy="66" r="5" fill="#38BDF8" />
          <circle cx="44" cy="66" r="5" fill="#38BDF8" />
          <circle cx="76" cy="66" r="5" fill="#A78BFA" />
          <circle cx="104" cy="66" r="5" fill="#FBBF24" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex h-28 w-full items-center justify-between overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#3B0764] px-5 py-4 text-white">
      <div className="space-y-1">
        <div className="font-mono text-[11px] text-amber-300">async def query_agent(ctx):</div>
        <div className="text-xs font-semibold text-slate-200">
          Decorators · Asyncio · AI Systems
        </div>
        <div className="font-mono text-[11px] text-emerald-300">await asyncio.gather(*tasks)</div>
      </div>
      <svg viewBox="0 0 120 80" className="h-20 w-28 shrink-0" aria-hidden="true">
        <path
          d="M16 22 L60 40 L16 58 M104 22 L60 40 L104 58 M16 40 L104 40"
          stroke="#A78BFA"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="16" cy="22" r="5.5" fill="#38BDF8" />
        <circle cx="16" cy="40" r="5.5" fill="#818CF8" />
        <circle cx="16" cy="58" r="5.5" fill="#38BDF8" />
        <rect
          x="46"
          y="26"
          width="28"
          height="28"
          rx="7"
          fill="#6D28D9"
          stroke="#FDE68A"
          strokeWidth="1.75"
        />
        <circle cx="60" cy="40" r="5" fill="#FBBF24" />
        <circle cx="104" cy="22" r="5.5" fill="#34D399" />
        <circle cx="104" cy="40" r="5.5" fill="#FBBF24" />
        <circle cx="104" cy="58" r="5.5" fill="#34D399" />
      </svg>
    </div>
  );
}

function HomePage() {
  const [heroImgError, setHeroImgError] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedPreviewLevel, setSelectedPreviewLevel] = useState<LearningLevel>("Beginner");

  // Interactive Hero Python Mini-Runner state
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
  const [snippetOutput, setSnippetOutput] = useState<string>(HERO_CODE_SNIPPETS[0]!.defaultOutput);
  const [runningSnippet, setRunningSnippet] = useState(false);

  // Real student progress state for live homepage indicators
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonRecord[]>([]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [attempted, setAttempted] = useState(0);

  useEffect(() => {
    const lessons = loadCompletedLessons();
    const exercises = loadCompletedExercises();
    const stats = loadStats();
    const analysis = analyze(stats, lessons);
    setCompletedLessons(lessons);
    setCompletedExercises(exercises);
    setDailyGoal(loadDailyGoal());
    setTodayCount(getTodayCount());
    setStreak(getStreak());
    setAccuracy(analysis.accuracy);
    setAttempted(analysis.attempted);
  }, []);

  const activeSnippet = HERO_CODE_SNIPPETS[activeSnippetIdx] ?? HERO_CODE_SNIPPETS[0]!;

  const handleSelectSnippet = (idx: number) => {
    setActiveSnippetIdx(idx);
    const target = HERO_CODE_SNIPPETS[idx];
    if (target) {
      setSnippetOutput(target.defaultOutput);
    }
  };

  const handleRunHeroSnippet = async () => {
    if (runningSnippet) return;
    setRunningSnippet(true);
    try {
      const res = await runPythonInBrowser(activeSnippet.code);
      if (res.error) {
        setSnippetOutput(res.error);
      } else {
        setSnippetOutput(res.stdout || activeSnippet.defaultOutput);
      }
    } catch {
      setSnippetOutput(activeSnippet.defaultOutput);
    } finally {
      setRunningSnippet(false);
    }
  };

  const previewLessons = CURRICULUM_LESSONS.filter((l) => l.level === selectedPreviewLevel);
  const completedIds = new Set(completedLessons.map((c) => c.lessonId));
  const solvedExerciseIds = new Set(completedExercises);
  const goalPct = Math.min(100, Math.round((todayCount / Math.max(1, dailyGoal)) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation Bar following strict 3-zone contract */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            className="text-lg font-extrabold tracking-tight text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 whitespace-nowrap shrink-0"
          >
            NaomiLearn
          </Link>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground"
          >
            <Link
              to="/learn"
              className="hover:text-primary hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Learn Python
            </Link>
            <Link
              to="/practice"
              className="hover:text-primary hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Practice
            </Link>
            <Link
              to="/quizzes"
              className="hover:text-primary hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Quizzes
            </Link>
            <Link
              to="/tutor"
              className="hover:text-primary hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              AI Tutor
            </Link>
            <Link
              to="/login"
              className="hover:text-primary hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Log In
            </Link>
          </nav>

          {/* Zone 3: 1 Primary Action (+ mobile menu toggle on small screens) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap shrink-0"
            >
              Sign Up
            </Link>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
              className="inline-flex md:hidden items-center justify-center rounded-lg border border-border p-2 text-foreground hover:bg-secondary"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileNavOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-border bg-card px-4 py-4 md:hidden"
          >
            <div className="flex flex-col space-y-2.5 text-sm font-medium">
              <Link
                to="/dashboard"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-secondary"
              >
                Dashboard
              </Link>
              <Link
                to="/learn"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-secondary"
              >
                Learn Python
              </Link>
              <Link
                to="/practice"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-secondary"
              >
                Practice (Code Lab)
              </Link>
              <Link
                to="/quizzes"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-secondary"
              >
                Quizzes
              </Link>
              <Link
                to="/tutor"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-secondary"
              >
                AI Tutor
              </Link>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Link
                  to="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex-1 rounded-lg border border-border bg-secondary py-2 text-center font-semibold text-secondary-foreground"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex-1 rounded-lg bg-primary py-2 text-center font-semibold text-primary-foreground"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section: Balanced Proposition + Composed Interactive Academy Visual Stage */}
        <section className="bg-hero-lavender border-b border-border">
          <div className="mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 lg:px-8 lg:pt-14 lg:pb-20">
            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Value Proposition, Actions, and Proof Strip */}
              <div className="lg:col-span-6 space-y-6 lg:pt-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary">
                  <span>NaomiLearn</span>
                  <span aria-hidden="true">·</span>
                  <span>Python &amp; AI Academy</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-muted-foreground">
                    Learn Python. Master AI. Build Your Future.
                  </span>
                </div>

                <h1
                  className="font-extrabold tracking-tight text-foreground"
                  style={{ fontSize: "clamp(2.25rem, 4vw, 3.65rem)", lineHeight: 1.08 }}
                >
                  Learn Python. Build your future.
                </h1>

                <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                  Master Python programming step by step with personalized AI assistance. Work
                  through 24 structured modules from Beginner to Advanced, execute real Python 3
                  code directly in your browser, and get Socratic coaching from Naomi, your personal
                  AI Tutor.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <Link
                    to="/learn"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap shrink-0"
                  >
                    Start Learning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#learning-levels"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary whitespace-nowrap shrink-0"
                  >
                    Explore Courses
                  </a>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary hover:underline underline-offset-4 whitespace-nowrap shrink-0"
                  >
                    Student Dashboard
                  </Link>
                </div>

                {/* Live Socratic AI Tutor Conversation Card Preview */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Naomi · Personal AI Python Tutor</span>
                    </div>
                    <span className="font-mono text-[11px] text-primary">Socratic Mode</span>
                  </div>
                  <div className="mt-3 space-y-2.5 text-xs sm:text-sm">
                    <div className="rounded-xl bg-secondary/70 px-3.5 py-2 text-foreground">
                      <span className="font-semibold text-primary">Student: </span>
                      Why does <code className="font-mono text-xs">range(1, 5)</code> stop at 4
                      instead of 5?
                    </div>
                    <div className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Naomi: </span>
                      In Python,{" "}
                      <code className="font-mono text-xs text-primary">
                        range(start, stop)
                      </code>{" "}
                      includes <code className="font-mono text-xs">start</code> but stops{" "}
                      <em>just before</em> <code className="font-mono text-xs">stop</code>. Try
                      changing <code className="font-mono text-xs">5</code> to{" "}
                      <code className="font-mono text-xs">6</code> in the live runner—what numbers
                      print?
                    </div>
                  </div>
                </div>

                {/* Quantitative Platform Proof Strip */}
                <div className="grid grid-cols-3 gap-4 border-t border-border pt-5">
                  <div>
                    <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
                      24
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Structured Python modules
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
                      3 Tracks
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Beginner, Intermediate &amp; AI
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
                      Python 3
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      In-browser WebAssembly Lab
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Composed Visual Stage (NaomiLearn Artwork + Interactive Live Python Runner) */}
              <div className="lg:col-span-6 space-y-4">
                {/* Primary Artwork Card with Preserved 16:9 Aspect Ratio */}
                <div className="overflow-hidden rounded-2xl border border-border bg-[#0F172A] shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-semibold">
                      <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                      <span>NaomiLearn Interactive Learning Environment</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      {completedLessons.length}/24 Modules Completed
                    </span>
                  </div>
                  {!heroImgError ? (
                    <img
                      src={HERO_IMAGE_PATH}
                      alt="NaomiLearn Python and AI Academy illustration showing a young student learning Python with an AI tutor companion"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="aspect-[16/9] w-full object-cover block"
                    />
                  ) : (
                    <div className="aspect-[16/9] w-full flex flex-col items-center justify-center bg-[#1E1B4B] p-8 text-center text-white">
                      <Terminal className="h-12 w-12 text-purple-300 mb-3" />
                      <div className="text-xl font-bold">NaomiLearn — Python &amp; AI Academy</div>
                      <p className="mt-1 text-sm text-purple-200 font-mono">
                        for i in range(5): print(&quot;Keep Learning!&quot;)
                      </p>
                    </div>
                  )}
                </div>

                {/* Interactive In-Browser Python 3 Mini Code Editor Preview */}
                <div className="overflow-hidden rounded-2xl border border-border bg-[#0F172A] text-slate-100 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {HERO_CODE_SNIPPETS.map((snip, idx) => (
                        <button
                          key={snip.id}
                          type="button"
                          onClick={() => handleSelectSnippet(idx)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                            activeSnippetIdx === idx
                              ? "bg-primary text-primary-foreground"
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {snip.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleRunHeroSnippet}
                      disabled={runningSnippet}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      {runningSnippet ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      {runningSnippet ? "Running..." : "Run Python"}
                    </button>
                  </div>

                  <div className="grid divide-y divide-slate-800 sm:grid-cols-12 sm:divide-y-0 sm:divide-x">
                    <pre className="sm:col-span-7 overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-slate-100">
                      <code>{activeSnippet.code}</code>
                    </pre>
                    <div className="sm:col-span-5 bg-slate-950/80 p-3.5 font-mono text-xs">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>stdout</span>
                        <span>{activeSnippet.level}</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-emerald-300 leading-relaxed">
                        {snippetOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Learning-Level Cards + Course/Module Cards with Progress Indicators */}
        <section
          id="learning-levels"
          className="border-b border-border bg-secondary/35 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-xs font-semibold text-primary">
                  Structured Learning Pathways
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Beginner, Intermediate, and Advanced Python tracks
                </h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Every track contains 8 hands-on modules with explicit learning objectives,
                  runnable examples, guided Code Lab exercises, and topic quizzes.
                </p>
              </div>
              <Link
                to="/learn"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline whitespace-nowrap"
              >
                View Full 24-Module Syllabus
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {LEVEL_CARDS.map((card) => {
                const trackLessons = CURRICULUM_LESSONS.filter((l) => l.level === card.level);
                const doneInTrack = completedLessons.filter((c) => c.level === card.level).length;
                const pct = Math.round((doneInTrack / Math.max(1, trackLessons.length)) * 100);

                return (
                  <div
                    key={card.level}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/50"
                  >
                    <div>
                      <TrackIllustration level={card.level} />

                      <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">{card.number}</span>
                        <span className="font-mono tabular-nums">{card.duration}</span>
                      </div>

                      <h3 className="mt-1.5 text-xl font-bold text-foreground">
                        {card.level} Python
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {card.subtitle}
                      </p>

                      {/* Track Progress Indicator */}
                      <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">Track Progress</span>
                          <span className="font-mono text-primary tabular-nums">
                            {doneInTrack}/{trackLessons.length} modules ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full bg-primary transition-all duration-200"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {card.description}
                      </p>

                      <ul className="mt-4 space-y-2 border-t border-border pt-4 text-xs sm:text-sm text-foreground">
                        {card.highlights.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                      <Link
                        to="/learn"
                        search={{ level: card.level }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
                      >
                        Start {card.level} Track
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Course / Module Cards Explorer with Progress Indicators */}
            <div className="mt-10 rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Interactive Course &amp; Module Explorer
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Inspect all 8 modules in each track, check your completion status, or jump
                    straight into any lesson or Code Lab exercise.
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
                  {(["Beginner", "Intermediate", "Advanced"] as LearningLevel[]).map((lvl) => {
                    const countDone = completedLessons.filter((c) => c.level === lvl).length;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedPreviewLevel(lvl)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          selectedPreviewLevel === lvl
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {lvl} ({countDone}/8)
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {previewLessons.map((lesson) => {
                  const isDone = completedIds.has(lesson.id);
                  const isLabSolved = solvedExerciseIds.has(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-background/60 p-4 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/50 hover:bg-secondary/30"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-mono font-semibold text-primary tabular-nums">
                            Module {String(lesson.number).padStart(2, "0")}
                          </span>
                          <span className="font-mono tabular-nums">{lesson.duration}</span>
                        </div>

                        <div className="mt-1.5 text-sm font-bold text-foreground">
                          {lesson.shortTitle}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {lesson.summary}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span
                          className={
                            isDone || isLabSolved
                              ? "inline-flex items-center gap-1 font-semibold text-success"
                              : "text-muted-foreground"
                          }
                        >
                          {isDone || isLabSolved ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </>
                          ) : (
                            "Ready to start"
                          )}
                        </span>

                        <div className="flex items-center gap-2.5 font-semibold">
                          <Link
                            to="/learn"
                            search={{ level: lesson.level, lessonId: lesson.id }}
                            className="text-primary hover:underline"
                          >
                            Lesson
                          </Link>
                          <span aria-hidden="true" className="text-muted-foreground">
                            ·
                          </span>
                          <Link
                            to="/practice"
                            search={{ lessonId: lesson.id }}
                            className="text-foreground hover:text-primary hover:underline"
                          >
                            Lab
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Python Code Lab & AI Tutor Personalized Learning Showcase */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold text-primary">
                Hands-On Execution &amp; AI Coaching
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                An interactive Python Code Lab paired with a curriculum-aware AI Tutor
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Instead of passively watching videos, you write real Python 3 code in the browser
                and get instant verification and Socratic hints whenever you get stuck.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-stretch">
              {/* Left 7 Cols: Interactive Python Code Lab Visual Architecture */}
              <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                      <Code2 className="h-4 w-4" />
                      01. In-Browser WebAssembly Code Lab
                    </span>
                    <span className="font-mono text-muted-foreground">Pyodide · Python 3.12</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Write, execute, and verify real Python solutions
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every module includes a guided coding challenge with starter code, progressive
                    hints, automated output &amp; construct checks, and one-click AI code review.
                  </p>
                </div>

                {/* Realistic IDE Preview Window */}
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] text-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-purple-400" />
                      <span>solution_05_functions.py</span>
                    </div>
                    <span className="text-emerald-400">All Checks Passed</span>
                  </div>
                  <div className="p-4 font-mono text-xs leading-relaxed space-y-1">
                    <div className="text-slate-400">
                      # Define a reusable function with type hints
                    </div>
                    <div>
                      <span className="text-purple-400">def</span>{" "}
                      <span className="text-sky-300">calculate_XP</span>(lessons:{" "}
                      <span className="text-amber-300">int</span>, streak_days:{" "}
                      <span className="text-amber-300">int</span>) -&gt;{" "}
                      <span className="text-amber-300">int</span>:
                    </div>
                    <div className="pl-4">base = lessons * 100</div>
                    <div className="pl-4">bonus = streak_days * 25</div>
                    <div className="pl-4">
                      <span className="text-purple-400">return</span> base + bonus
                    </div>
                    <div className="pt-1">
                      print(
                      <span className="text-emerald-300">
                        f&quot;Total XP: &#123;calculate_XP(8, 5)&#125;&quot;
                      </span>
                      )
                    </div>
                  </div>
                  <div className="border-t border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-xs flex items-center justify-between">
                    <span className="text-emerald-300">stdout: Total XP: 925</span>
                    <span className="text-slate-400 tabular-nums">14 ms</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>• Real stdout &amp; tracebacks</span>
                    <span>• Progressive hints</span>
                    <span>• Solution checker</span>
                  </div>
                  <Link
                    to="/practice"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
                  >
                    Open Code Lab
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right 5 Cols: AI Tutor & Personalized Learning Architecture */}
              <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                      <Sparkles className="h-4 w-4" />
                      02. Personal AI Tutor Agent
                    </span>
                    <span className="font-mono text-muted-foreground">6 Curriculum Tools</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Personalized explanations &amp; Socratic debugging
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Naomi inspects your active track, completed modules, and code submissions to
                    give targeted hints, line-by-line explanations, and custom practice problems.
                  </p>
                </div>

                {/* Agent Workflow Card */}
                <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-border pb-2 font-semibold text-primary">
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Agent Actions: Loaded Curriculum Module · Inspected Python Code</span>
                  </div>
                  <div className="space-y-2 text-foreground">
                    <p className="font-semibold">
                      &ldquo;Your loop logic is close! Notice that{" "}
                      <code className="font-mono">total</code> is defined inside the{" "}
                      <code className="font-mono">for</code> loop, so it resets on every
                      iteration.&rdquo;
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-primary">Hint 1:</strong> Move{" "}
                      <code className="font-mono">total = 0</code> to the line above your{" "}
                      <code className="font-mono">for</code> statement and run your script again.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span>Progressive Hints</span>
                    </div>
                    <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                      <ClipboardCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Adaptive Quizzes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    Beginner · Intermediate · Advanced
                  </span>
                  <Link
                    to="/tutor"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-xs sm:text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
                  >
                    Chat with AI Tutor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Dashboard Preview, Daily Learning Goals & Achievement Highlights */}
        <section className="border-b border-border bg-secondary/35 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-xs font-semibold text-primary">
                  Honest Analytics &amp; Motivation
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Daily learning goals, streaks, and student dashboard preview
                </h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Every lesson checkpoint, Code Lab verification, and quiz answer updates your real
                  progress immediately—with instant guest access and optional cloud sync.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
                >
                  <BarChart3 className="h-4 w-4" />
                  Open Live Dashboard
                </Link>
                <Link
                  to="/quizzes"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:bg-secondary whitespace-nowrap"
                >
                  Take a Quiz
                </Link>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left 7 Cols: Live Student Dashboard & Daily Goal Card */}
              <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 space-y-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <div className="text-xs font-semibold text-primary">
                      Student Workspace Snapshot
                    </div>
                    <h3 className="mt-0.5 text-lg font-bold text-foreground">
                      Daily Goal &amp; Real-Time Telemetry
                    </h3>
                  </div>
                  <Link
                    to="/settings"
                    className="text-xs font-semibold text-muted-foreground hover:text-primary"
                  >
                    Customize Daily Goal →
                  </Link>
                </div>

                {/* 3 KPI Stat Blocks */}
                <div className="grid gap-3.5 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-background/70 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/40">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Flame className="h-4 w-4 text-gold" />
                      <span>Active Streak</span>
                    </div>
                    <div className="mt-1.5 font-mono text-2xl font-bold text-foreground tabular-nums">
                      {streak} {streak === 1 ? "day" : "days"}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      Consecutive study days
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/70 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/40">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Modules Mastered</span>
                    </div>
                    <div className="mt-1.5 font-mono text-2xl font-bold text-foreground tabular-nums">
                      {completedLessons.length}/24
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {completedExercises.length} Code Lab solutions
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/70 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/40">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Target className="h-4 w-4 text-primary" />
                      <span>Quiz Accuracy</span>
                    </div>
                    <div className="mt-1.5 font-mono text-2xl font-bold text-foreground tabular-nums">
                      {attempted > 0 ? `${accuracy}%` : "—"}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {attempted > 0 ? `${attempted} questions answered` : "Take a quiz to measure"}
                    </div>
                  </div>
                </div>

                {/* Daily Learning Goal Bar */}
                <div className="rounded-xl border border-border bg-secondary/50 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <Target className="h-4 w-4 text-gold" />
                      Daily Learning Goal: {dailyGoal} activities
                    </span>
                    <span className="font-mono text-xs text-primary font-semibold tabular-nums">
                      {todayCount}/{dailyGoal} today ({goalPct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${goalPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Activities include completing a lesson checkpoint, verifying a Code Lab
                    solution, or answering a topic quiz question.
                  </p>
                </div>
              </div>

              {/* Right 5 Cols: Milestones & Achievement Highlights */}
              <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-4 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-gold" />
                      <h3 className="text-base font-bold text-foreground">
                        Achievement Highlights
                      </h3>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">5 Milestones</span>
                  </div>

                  <ul className="mt-4 space-y-2.5">
                    {[
                      {
                        title: "First Steps",
                        desc: "Complete your first module or answer a quiz question",
                        unlocked: attempted >= 1 || completedLessons.length >= 1,
                      },
                      {
                        title: "Track Explorer",
                        desc: "Complete at least 3 Python curriculum modules",
                        unlocked: completedLessons.length >= 3,
                      },
                      {
                        title: "Consistent Coder",
                        desc: "Answer 10 practice or quiz questions",
                        unlocked: attempted >= 10,
                      },
                      {
                        title: "Sharp Accuracy",
                        desc: "Maintain 80%+ quiz accuracy across 5+ questions",
                        unlocked: attempted >= 5 && accuracy >= 80,
                      },
                      {
                        title: "On a Roll",
                        desc: "Maintain a 3-day consecutive learning streak",
                        unlocked: streak >= 3,
                      },
                    ].map((ach) => (
                      <li
                        key={ach.title}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm ${
                          ach.unlocked
                            ? "border-primary/40 bg-secondary/60"
                            : "border-border bg-background/50 hover:border-primary/30"
                        }`}
                      >
                        {ach.unlocked ? (
                          <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        ) : (
                          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                          <div className="font-bold text-foreground">{ach.title}</div>
                          <div className="text-muted-foreground">{ach.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Unlocked automatically as you learn</span>
                  <Link to="/progress" className="font-semibold text-primary hover:underline">
                    View Full Analytics →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How the Learning Journey Works */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div className="text-xs font-semibold text-primary">
                  How the Learning Journey Works
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  A structured four-step loop from concept to mastery
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Unlike passive video courses or generic chat tools that dump unverified code,
                  NaomiLearn connects every explanation directly to live code execution, Socratic
                  coaching, and measurable skill verification.
                </p>

                <div className="rounded-2xl border border-border bg-card p-5 space-y-3 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Compass className="h-4 w-4 text-primary" />
                    <span>Why Students Progress Faster Here</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li>• Adapts vocabulary and depth to Beginner, Intermediate, or Advanced</li>
                    <li>• Gives targeted hints first so you build genuine problem-solving skill</li>
                    <li>• Explains Python snippets line by line and predicts exact output</li>
                    <li>
                      • Reviews your Code Lab submissions and recommends your optimal next step
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
                {JOURNEY_STEPS.map((item) => (
                  <div
                    key={item.step}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40"
                  >
                    <div>
                      <div className="text-xs font-semibold text-primary">{item.step}</div>
                      <h3 className="mt-2 text-base font-bold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-5 border-t border-border pt-3">
                      <Link
                        to={item.link}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        {item.linkLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action Section */}
        <section className="bg-hero-lavender py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="text-xs font-semibold text-primary">
              Instant Guest Access · Optional Cloud Sync
            </div>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Ready to write and run your next Python program?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
              Jump straight into the 24-module interactive curriculum and WebAssembly Code Lab with
              zero setup required, or create an account to sync your progress across devices.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-primary/90 whitespace-nowrap"
              >
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-secondary whitespace-nowrap"
              >
                Open Python Code Lab
              </Link>
              <Link
                to="/tutor"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-5 py-3.5 text-sm font-semibold text-secondary-foreground transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-secondary/80 whitespace-nowrap"
              >
                Meet Your AI Tutor
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Professional Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="text-base font-extrabold tracking-tight text-foreground">
                NaomiLearn
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Python &amp; AI Academy · Learn Python. Master AI. Build Your Future.
              </p>
            </div>

            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap items-center gap-5 text-xs font-medium text-muted-foreground"
            >
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link to="/learn" className="hover:text-foreground">
                Learn Python
              </Link>
              <Link to="/practice" className="hover:text-foreground">
                Code Lab
              </Link>
              <Link to="/quizzes" className="hover:text-foreground">
                Quizzes
              </Link>
              <Link to="/tutor" className="hover:text-foreground">
                AI Tutor
              </Link>
              <Link to="/progress" className="hover:text-foreground">
                Progress
              </Link>
              <Link to="/settings" className="hover:text-foreground">
                Settings
              </Link>
              <Link to="/login" className="hover:text-foreground">
                Log In
              </Link>
              <Link to="/signup" className="hover:text-foreground">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
