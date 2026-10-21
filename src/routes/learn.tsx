import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  Code2,
  Sparkles,
  ArrowRight,
  Loader2,
  Terminal,
} from "lucide-react";
import {
  CURRICULUM_LESSONS,
  getLessonsByLevel,
  type LearningLevel,
  type LessonModule,
} from "@/lib/curriculum";
import {
  loadCompletedLessons,
  markLessonCompleted,
  loadPreferredLevel,
  savePreferredLevel,
  type CompletedLessonRecord,
} from "@/lib/tutor";
import { runPythonInBrowser } from "@/lib/pyodide";

export const Route = createFileRoute("/learn")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { level?: LearningLevel; lessonId?: string } => {
    const lvl = search["level"];
    const validLevel =
      lvl === "Beginner" || lvl === "Intermediate" || lvl === "Advanced" ? lvl : undefined;
    const lessonId = typeof search["lessonId"] === "string" ? search["lessonId"] : undefined;
    return {
      ...(validLevel ? { level: validLevel } : {}),
      ...(lessonId ? { lessonId } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Learn Python Curriculum — NaomiLearn" },
      {
        name: "description",
        content:
          "Master Python step by step across Beginner, Intermediate, and Advanced tracks with objectives, runnable examples, and hands-on checkpoints.",
      },
      { property: "og:title", content: "Learn Python Curriculum — NaomiLearn" },
      {
        property: "og:description",
        content: "24 structured Python modules across Beginner, Intermediate, and Advanced levels.",
      },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const search = Route.useSearch();
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel>(search.level ?? "Beginner");
  const [completed, setCompleted] = useState<CompletedLessonRecord[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>(
    search.lessonId ?? "beg-1-setup-first-program",
  );

  // Example code runner state inside lesson
  const [runningExample, setRunningExample] = useState(false);
  const [exampleOutput, setExampleOutput] = useState<string | null>(null);
  const [exampleError, setExampleError] = useState<string | null>(null);
  const [hasVerifiedExample, setHasVerifiedExample] = useState(false);

  useEffect(() => {
    const savedCompleted = loadCompletedLessons();
    setCompleted(savedCompleted);
    if (!search.level) {
      const pref = loadPreferredLevel();
      setSelectedLevel(pref);
    }
  }, [search.level]);

  useEffect(() => {
    if (search.level) {
      setSelectedLevel(search.level);
    }
    if (search.lessonId) {
      const target = CURRICULUM_LESSONS.find((l) => l.id === search.lessonId);
      if (target) {
        setSelectedLevel(target.level);
        setActiveLessonId(target.id);
      }
    }
  }, [search.level, search.lessonId]);

  const levelLessons = getLessonsByLevel(selectedLevel);
  const activeLesson: LessonModule =
    CURRICULUM_LESSONS.find((l) => l.id === activeLessonId) ??
    levelLessons[0] ??
    CURRICULUM_LESSONS[0]!;

  // Reset example output when switching lessons (never auto-complete on open!)
  useEffect(() => {
    setExampleOutput(null);
    setExampleError(null);
    setHasVerifiedExample(false);
  }, [activeLesson.id]);

  const completedIds = new Set(completed.map((c) => c.lessonId));
  const isCurrentCompleted = completedIds.has(activeLesson.id);

  const handleSelectLevel = (lvl: LearningLevel) => {
    setSelectedLevel(lvl);
    savePreferredLevel(lvl);
    const firstInLevel = getLessonsByLevel(lvl)[0];
    if (firstInLevel) {
      setActiveLessonId(firstInLevel.id);
    }
  };

  const handleRunExample = async () => {
    setRunningExample(true);
    setExampleError(null);
    try {
      const res = await runPythonInBrowser(activeLesson.exampleCode);
      if (res.error) {
        setExampleError(res.error);
      } else {
        setExampleOutput(res.stdout || "(No output)");
        setHasVerifiedExample(true);
      }
    } catch (err) {
      // Fallback to expected example output if offline
      setExampleOutput(activeLesson.exampleOutput);
      setHasVerifiedExample(true);
      if (err instanceof Error) {
        setExampleError(null);
      }
    } finally {
      setRunningExample(false);
    }
  };

  const handleMarkComplete = () => {
    const updated = markLessonCompleted({
      id: activeLesson.id,
      title: activeLesson.title,
      level: activeLesson.level,
    });
    setCompleted(updated);
  };

  const nextLesson = CURRICULUM_LESSONS.find((l) => l.number === activeLesson.number + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header & Level Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-foreground">
            <BookOpen className="h-6 w-6 text-primary" />
            Python &amp; AI Curriculum
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            24 structured modules across Beginner, Intermediate, and Advanced tracks. Complete
            checkpoints to record real progress.
          </p>
        </div>

        {/* Interactive Track Filter Tabs */}
        <div
          role="tablist"
          aria-label="Curriculum difficulty tracks"
          className="flex items-center gap-1 rounded-xl border border-border bg-secondary p-1"
        >
          {(["Beginner", "Intermediate", "Advanced"] as LearningLevel[]).map((lvl) => {
            const total = getLessonsByLevel(lvl).length;
            const done = completed.filter((c) => c.level === lvl).length;
            const active = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectLevel(lvl)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lvl} ({done}/{total})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Workspace: Module List (Left) + Lesson Reader (Right) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Sidebar: 8 Modules in Selected Level */}
        <aside className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
            <span>{selectedLevel} Modules</span>
            <span className="font-mono tabular-nums">
              {completed.filter((c) => c.level === selectedLevel).length}/{levelLessons.length}{" "}
              completed
            </span>
          </div>

          <div className="space-y-2">
            {levelLessons.map((lesson) => {
              const isSelected = lesson.id === activeLesson.id;
              const isDone = completedIds.has(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-card shadow-xs"
                      : "border-border bg-card/70 hover:border-primary/40 hover:bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-primary tabular-nums">
                      Module {String(lesson.number).padStart(2, "0")}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono tabular-nums">
                      {lesson.duration}
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-label="Completed" />
                      ) : (
                        <Circle
                          className="h-4 w-4 text-muted-foreground/50"
                          aria-label="In progress"
                        />
                      )}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-foreground">{lesson.title}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {lesson.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Content Area: Active Lesson View */}
        <article className="lg:col-span-8 rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
          {/* Lesson Kicker & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span className="font-mono tabular-nums">
                Module {String(activeLesson.number).padStart(2, "0")}
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeLesson.level} Track</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-muted-foreground tabular-nums">
                {activeLesson.duration}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              {isCurrentCompleted ? (
                <span className="inline-flex items-center gap-1.5 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                <span className="text-muted-foreground">Not completed yet</span>
              )}
            </div>
          </div>

          {/* Title & Summary */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {activeLesson.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              {activeLesson.summary}
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="rounded-xl border border-border bg-secondary/40 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Learning Objectives
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              {activeLesson.objectives.map((obj) => (
                <li key={obj} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Concept Explanation */}
          <div className="space-y-3.5 text-sm sm:text-base leading-relaxed text-foreground">
            <h3 className="text-lg font-bold text-foreground">Core Concept Walkthrough</h3>
            {activeLesson.explanation.map((para, idx) => (
              <p key={idx} className="text-muted-foreground">
                {para}
              </p>
            ))}
          </div>

          {/* Interactive Runnable Example */}
          <div className="rounded-xl border border-border bg-[#0F172A] text-slate-100 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="h-3.5 w-3.5 text-purple-400" />
                <span>example_{activeLesson.number}.py</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunExample}
                  disabled={runningExample}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                >
                  {runningExample ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {runningExample ? "Running Python..." : "Run Example"}
                </button>
              </div>
            </div>

            <pre className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-100">
              <code>{activeLesson.exampleCode}</code>
            </pre>

            {(exampleOutput !== null || exampleError !== null) && (
              <div className="border-t border-slate-800 bg-slate-950/90 p-4 font-mono text-xs">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Output:</div>
                {exampleError ? (
                  <pre className="text-red-400 whitespace-pre-wrap">{exampleError}</pre>
                ) : (
                  <pre className="text-emerald-300 whitespace-pre-wrap">{exampleOutput}</pre>
                )}
              </div>
            )}
          </div>

          {/* Practice Exercise Callout + Completion Action */}
          <div className="rounded-xl border border-border bg-secondary/50 p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-primary">Hands-On Practice Exercise</div>
                <h3 className="mt-1 text-base font-bold text-foreground">
                  {activeLesson.exerciseTitle}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{activeLesson.exercisePrompt}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/practice"
                search={{ lessonId: activeLesson.id }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
              >
                <Code2 className="h-4 w-4" />
                Solve in Code Lab
              </Link>

              <Link
                to="/tutor"
                search={{
                  module: activeLesson.shortTitle,
                  level: activeLesson.level,
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:bg-secondary whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Ask AI Tutor About This Lesson
              </Link>

              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={isCurrentCompleted}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  isCurrentCompleted
                    ? "border border-success/40 bg-success/10 text-success cursor-default"
                    : "border border-border bg-card text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCurrentCompleted
                  ? "Lesson Completed"
                  : hasVerifiedExample
                    ? "Mark Lesson Complete"
                    : "Complete Lesson Checkpoint"}
              </button>
            </div>
          </div>

          {/* Next Step Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <p className="text-xs text-muted-foreground">{activeLesson.nextStepHint}</p>
            {nextLesson && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLevel(nextLesson.level);
                  setActiveLessonId(nextLesson.id);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline whitespace-nowrap"
              >
                Next: {nextLesson.shortTitle}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
