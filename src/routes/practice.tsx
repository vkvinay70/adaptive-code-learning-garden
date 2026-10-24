import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Code2,
  Play,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Terminal,
  BookOpen,
} from "lucide-react";
import {
  CURRICULUM_LESSONS,
  getLessonsByLevel,
  type LearningLevel,
  type LessonModule,
} from "@/lib/curriculum";
import { runPythonInBrowser } from "@/lib/pyodide";
import {
  callGemini,
  loadCompletedExercises,
  markExerciseCompleted,
  markLessonCompleted,
  recordModuleAttempt,
  SYSTEM_PROMPT,
} from "@/lib/tutor";

export const Route = createFileRoute("/practice")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { lessonId?: string; level?: LearningLevel } => {
    const lessonId = typeof search["lessonId"] === "string" ? search["lessonId"] : undefined;
    const lvl = search["level"];
    const validLevel =
      lvl === "Beginner" || lvl === "Intermediate" || lvl === "Advanced" ? lvl : undefined;
    return {
      ...(lessonId ? { lessonId } : {}),
      ...(validLevel ? { level: validLevel } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Python Code Lab — NaomiLearn AI Academy" },
      {
        name: "description",
        content:
          "Write, edit, and run real Python 3 code in your browser using the NaomiLearn AI Academy WebAssembly Code Lab. Solve guided exercises with progressive hints and AI code review.",
      },
      { property: "og:title", content: "Python Code Lab — NaomiLearn AI Academy" },
      {
        property: "og:description",
        content:
          "Interactive Python 3 Code Lab with real execution, test verification, and AI Tutor hints.",
      },
    ],
  }),
  component: CodeLabPage,
});

function CodeLabPage() {
  const search = Route.useSearch();
  const initialLesson =
    (search.lessonId ? CURRICULUM_LESSONS.find((l) => l.id === search.lessonId) : undefined) ??
    CURRICULUM_LESSONS[0]!;

  const [selectedLevel, setSelectedLevel] = useState<LearningLevel>(
    search.level ?? initialLesson.level,
  );
  const [activeLessonId, setActiveLessonId] = useState<string>(initialLesson.id);
  const [code, setCode] = useState<string>(initialLesson.starterCode);
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [runtimeError, setRuntimeError] = useState<string>("");
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [running, setRunning] = useState<boolean>(false);

  // Hints & verification state
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [verification, setVerification] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Optional AI Code Review state
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewText, setAiReviewText] = useState<string>("");
  const [aiReviewError, setAiReviewError] = useState<string>("");

  useEffect(() => {
    setCompletedExercises(loadCompletedExercises());
  }, []);

  useEffect(() => {
    if (search.lessonId) {
      const found = CURRICULUM_LESSONS.find((l) => l.id === search.lessonId);
      if (found) {
        setSelectedLevel(found.level);
        setActiveLessonId(found.id);
        setCode(found.starterCode);
        setStdout("");
        setStderr("");
        setRuntimeError("");
        setDurationMs(null);
        setRevealedHints(0);
        setVerification(null);
        setAiReviewText("");
        setAiReviewError("");
      }
    }
  }, [search.lessonId]);

  const levelLessons = getLessonsByLevel(selectedLevel);
  const activeLesson: LessonModule =
    CURRICULUM_LESSONS.find((l) => l.id === activeLessonId) ??
    levelLessons[0] ??
    CURRICULUM_LESSONS[0]!;

  const selectExercise = (lesson: LessonModule) => {
    setSelectedLevel(lesson.level);
    setActiveLessonId(lesson.id);
    setCode(lesson.starterCode);
    setStdout("");
    setStderr("");
    setRuntimeError("");
    setDurationMs(null);
    setRevealedHints(0);
    setVerification(null);
    setAiReviewText("");
    setAiReviewError("");
  };

  const handleRunCode = async (verifyAfterRun = false) => {
    if (running) return;
    setRunning(true);
    setRuntimeError("");
    setVerification(null);

    try {
      const res = await runPythonInBrowser(code);
      setStdout(res.stdout);
      setStderr(res.stderr);
      setDurationMs(res.durationMs);
      if (res.error) {
        setRuntimeError(res.error);
        if (verifyAfterRun) {
          setVerification({
            passed: false,
            message:
              "Your code raised an error during execution. Fix the traceback above and run again.",
          });
          recordModuleAttempt(activeLesson.shortTitle, false);
        }
        return;
      }

      if (verifyAfterRun) {
        const missingConstructs = (activeLesson.requiredConstructs ?? []).filter(
          (c) => !code.includes(c),
        );
        const missingOutputs = activeLesson.expectedOutputContains.filter(
          (expected) => !res.stdout.includes(expected),
        );

        if (missingConstructs.length > 0) {
          setVerification({
            passed: false,
            message: `Almost there! Make sure your solution uses: ${missingConstructs.join(", ")}`,
          });
          recordModuleAttempt(activeLesson.shortTitle, false);
        } else if (missingOutputs.length > 0) {
          setVerification({
            passed: false,
            message: `Expected output to include "${missingOutputs[0]}", but got "${res.stdout || "(empty output)"}".`,
          });
          recordModuleAttempt(activeLesson.shortTitle, false);
        } else {
          setVerification({
            passed: true,
            message:
              "All exercise requirements verified! Your solution produced the exact expected output.",
          });
          recordModuleAttempt(activeLesson.shortTitle, true);
          const updatedEx = markExerciseCompleted(activeLesson.id);
          setCompletedExercises(updatedEx);
          markLessonCompleted({
            id: activeLesson.id,
            title: activeLesson.title,
            level: activeLesson.level,
          });
        }
      }
    } catch (err) {
      setRuntimeError(err instanceof Error ? err.message : "Unable to execute Python in browser.");
    } finally {
      setRunning(false);
    }
  };

  const handleResetCode = () => {
    setCode(activeLesson.starterCode);
    setStdout("");
    setStderr("");
    setRuntimeError("");
    setDurationMs(null);
    setVerification(null);
  };

  const handleLoadExample = () => {
    setCode(activeLesson.exampleCode);
    setStdout("");
    setStderr("");
    setRuntimeError("");
    setDurationMs(null);
    setVerification(null);
  };

  const handleLoadSolution = () => {
    setCode(activeLesson.solutionCode);
    setStdout("");
    setStderr("");
    setRuntimeError("");
    setDurationMs(null);
    setVerification(null);
  };

  const handleAskAiReview = async () => {
    if (aiReviewLoading) return;
    setAiReviewLoading(true);
    setAiReviewError("");
    setAiReviewText("");

    try {
      const prompt = `Please review my Python code for the ${activeLesson.level} exercise "${activeLesson.exerciseTitle}" (${activeLesson.exercisePrompt}).\n\nMy code:\n\`\`\`python\n${code}\n\`\`\`\n\nProgram output so far:\n\`\`\`\n${stdout || runtimeError || "(Not run yet)"}\n\`\`\`\n\nGive me constructive coaching and a hint without spoiling the entire answer unless my code is already complete.`;

      const res = await callGemini({
        system: `${SYSTEM_PROMPT}\nLevel: ${activeLesson.level}. Module: ${activeLesson.shortTitle}.`,
        messages: [{ role: "user", text: prompt }],
        level: activeLesson.level,
        module: activeLesson.shortTitle,
      });
      setAiReviewText(res.text);
    } catch (err) {
      setAiReviewError(
        err instanceof Error ? err.message : "Unable to reach AI Tutor for code review.",
      );
    } finally {
      setAiReviewLoading(false);
    }
  };

  const nextLesson = CURRICULUM_LESSONS.find((l) => l.number === activeLesson.number + 1);
  const isSolved = completedExercises.includes(activeLesson.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Bar: Title + Track Selector + Exercise Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-foreground">
            <Code2 className="h-6 w-6 text-primary" />
            Interactive Python Code Lab
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Powered by Pyodide WebAssembly (Python 3). Write code, run it in your browser, inspect
            output, and verify exercise requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary p-1">
            {(["Beginner", "Intermediate", "Advanced"] as LearningLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelectedLevel(lvl);
                  const first = getLessonsByLevel(lvl)[0];
                  if (first) selectExercise(first);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedLevel === lvl
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <select
            aria-label="Select guided exercise"
            value={activeLesson.id}
            onChange={(e) => {
              const found = CURRICULUM_LESSONS.find((l) => l.id === e.target.value);
              if (found) selectExercise(found);
            }}
            className="h-9 rounded-xl border border-border bg-card px-3 text-xs sm:text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {levelLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {String(l.number).padStart(2, "0")}. {l.shortTitle} — {l.exerciseTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two-Zone Sandbox Layout: Left (Editor & Output Console) + Right (Exercise Brief, Hints & Verification) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Zone (7 cols): Python Editor + Standard Output Console */}
        <section className="lg:col-span-7 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-[#0F172A] text-slate-100 shadow-xs">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="h-4 w-4 text-purple-400" />
                <span>solution_{activeLesson.number}.py</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">Python 3</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadExample}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 whitespace-nowrap"
                >
                  Load Example
                </button>
                <button
                  type="button"
                  onClick={handleLoadSolution}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 whitespace-nowrap"
                >
                  Show Solution
                </button>
                <button
                  type="button"
                  onClick={handleResetCode}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => handleRunCode(false)}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-900 transition-colors hover:bg-white disabled:opacity-50 whitespace-nowrap"
                >
                  {running ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Run Code
                </button>
                <button
                  type="button"
                  onClick={() => handleRunCode(true)}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Check Solution
                </button>
              </div>
            </div>

            {/* Code Editor Textarea */}
            <div className="relative">
              <textarea
                aria-label="Python code editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleRunCode(true);
                  } else if (e.key === "Tab") {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    const nextVal = code.substring(0, start) + "    " + code.substring(end);
                    setCode(nextVal);
                    setTimeout(() => {
                      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                    }, 0);
                  }
                }}
                rows={14}
                spellCheck={false}
                className="w-full resize-y bg-[#0F172A] p-4 font-mono text-sm leading-relaxed text-slate-100 outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="# Write your Python 3 code here..."
              />
            </div>

            {/* Execution Output Console */}
            <div className="border-t border-slate-800 bg-slate-950 p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span>Console Output (stdout / stderr)</span>
                {durationMs !== null && <span className="tabular-nums">{durationMs} ms</span>}
              </div>

              {running ? (
                <div className="flex items-center gap-2 py-3 text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  <span>Executing Python 3 script...</span>
                </div>
              ) : runtimeError ? (
                <pre className="whitespace-pre-wrap text-red-400 leading-relaxed">
                  {runtimeError}
                </pre>
              ) : stdout || stderr ? (
                <div className="space-y-2">
                  {stdout && (
                    <pre className="whitespace-pre-wrap text-emerald-300 leading-relaxed">
                      {stdout}
                    </pre>
                  )}
                  {stderr && (
                    <pre className="whitespace-pre-wrap text-amber-300 leading-relaxed">
                      {stderr}
                    </pre>
                  )}
                </div>
              ) : durationMs !== null ? (
                <div className="py-2 text-emerald-300/90">
                  Program executed cleanly (no output printed to stdout — use print() to display
                  values).
                </div>
              ) : (
                <div className="py-2 text-slate-500">
                  Click &quot;Run Code&quot; or press Ctrl+Enter to execute your Python script.
                </div>
              )}
            </div>
          </div>

          {/* Solution Verification Banner */}
          {verification && (
            <div
              role="status"
              className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                verification.passed
                  ? "border-success/40 bg-success/10 text-foreground"
                  : "border-destructive/40 bg-destructive/10 text-foreground"
              }`}
            >
              {verification.passed ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              )}
              <div className="flex-1">
                <div className="font-bold">
                  {verification.passed ? "Exercise Passed!" : "Keep Iterating — Not Passing Yet"}
                </div>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                  {verification.message}
                </p>
              </div>
              {verification.passed && nextLesson && (
                <button
                  type="button"
                  onClick={() => selectExercise(nextLesson)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 whitespace-nowrap shrink-0"
                >
                  Next Exercise
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* Right Zone (5 cols): Exercise Prompt, Requirements, Hints & AI Code Review */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-primary">
                {activeLesson.level} · Module {String(activeLesson.number).padStart(2, "0")}
              </span>
              {isSolved ? (
                <span className="inline-flex items-center gap-1 font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Solved
                </span>
              ) : (
                <span className="text-muted-foreground">Unsolved</span>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">{activeLesson.exerciseTitle}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {activeLesson.exercisePrompt}
              </p>
            </div>

            {/* Exercise Requirements Checklist */}
            <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-2">
              <div className="text-xs font-bold text-foreground">Verification Requirements</div>
              <ul className="space-y-1.5 text-xs text-muted-foreground font-mono">
                {activeLesson.expectedOutputContains.map((out) => (
                  <li key={out}>• Output includes: {out}</li>
                ))}
                {(activeLesson.requiredConstructs ?? []).map((req) => (
                  <li key={req}>• Uses Python construct: {req}</li>
                ))}
              </ul>
            </div>

            {/* Progressive Hints */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Guided Hints ({revealedHints}/{activeLesson.hints.length})
                </span>
                {revealedHints < activeLesson.hints.length && (
                  <button
                    type="button"
                    onClick={() => setRevealedHints((h) => h + 1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Reveal Hint {revealedHints + 1}
                  </button>
                )}
              </div>

              {revealedHints > 0 && (
                <div className="space-y-2">
                  {activeLesson.hints.slice(0, revealedHints).map((hint, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-secondary/40 p-3 text-xs text-foreground"
                    >
                      <span className="font-semibold text-primary">Hint {i + 1}: </span>
                      {hint}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: AI Code Review & Back to Lesson */}
            <div className="flex flex-wrap items-center gap-2.5 border-t border-border pt-4">
              <button
                type="button"
                onClick={handleAskAiReview}
                disabled={aiReviewLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50 whitespace-nowrap"
              >
                {aiReviewLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {aiReviewLoading ? "Reviewing Code..." : "Ask AI Tutor for Feedback"}
              </button>

              <Link
                to="/learn"
                search={{
                  level: activeLesson.level,
                  lessonId: activeLesson.id,
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary whitespace-nowrap"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Read Lesson Notes
              </Link>
            </div>

            {/* AI Code Review Result */}
            {aiReviewError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                {aiReviewError}
              </div>
            )}
            {aiReviewText && (
              <div className="rounded-xl border border-primary/30 bg-secondary/40 p-4 text-xs">
                <div className="mb-1.5 flex items-center gap-1.5 font-bold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Tutor Code Feedback
                </div>
                <div className="prose-tutor text-xs text-foreground">
                  <ReactMarkdown>{aiReviewText}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
