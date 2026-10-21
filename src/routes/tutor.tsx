import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Code2,
  Send,
  Lightbulb,
  Sparkles,
  SkipForward,
  Target,
  TrendingUp,
  AlertTriangle,
  Compass,
  Loader2,
  RotateCcw,
  Wrench,
  FileCode,
  HelpCircle,
} from "lucide-react";
import {
  MODULES,
  LEVELS,
  SYSTEM_PROMPT,
  callGemini,
  analyze,
  loadStats,
  saveStats,
  loadName,
  saveName,
  loadCompletedLessons,
  recordActivity,
  persistTutorExchangeToSupabase,
  type Msg,
  type Stats,
  type CompletedLessonRecord,
} from "@/lib/tutor";
import type { LearningLevel } from "@/lib/curriculum";
import { MarkdownMessage } from "@/components/markdown-message";

export const Route = createFileRoute("/tutor")({
  validateSearch: (search: Record<string, unknown>): { module?: string; level?: LearningLevel } => {
    const mod = typeof search["module"] === "string" ? search["module"] : undefined;
    const lvl = search["level"];
    const validLevel =
      lvl === "Beginner" || lvl === "Intermediate" || lvl === "Advanced" ? lvl : undefined;
    return {
      ...(mod ? { module: mod } : {}),
      ...(validLevel ? { level: validLevel } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "AI Python Tutor Agent — NaomiLearn" },
      {
        name: "description",
        content:
          "Chat with Naomi, your Gemini-powered AI Python Tutor. Get level-adapted explanations, step-by-step hints, line-by-line code breakdowns, and custom practice exercises.",
      },
      { property: "og:title", content: "AI Python Tutor Agent — NaomiLearn" },
      {
        property: "og:description",
        content:
          "Personalized Python coaching powered by Gemini with curriculum-aware agent tools.",
      },
    ],
  }),
  component: TutorPage,
});

const TOOL_LABELS: Record<string, string> = {
  getCurriculumModule: "Loaded Curriculum Module",
  recommendNextLesson: "Analyzed Learning Path",
  generatePracticeExercise: "Generated Guided Exercise",
  explainQuizAnswer: "Retrieved Quiz Reference",
  summarizeStudentProgress: "Checked Student Progress",
  reviewStudentCode: "Inspected Python Code",
};

const inputCls =
  "h-9 rounded-xl border border-border bg-card px-3 text-xs sm:text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring";

function TutorPage() {
  const search = Route.useSearch();
  const [name, setName] = useState("");
  const [module, setModule] = useState<string>(search.module ?? MODULES[0]);
  const [level, setLevel] = useState<LearningLevel>(search.level ?? LEVELS[0]);
  const [chats, setChats] = useState<Record<string, Msg[]>>({});
  const [input, setInput] = useState("");
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>({});
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonRecord[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(loadName());
    setStats(loadStats());
    setCompletedLessons(loadCompletedLessons());
  }, []);

  useEffect(() => {
    if (search.module) setModule(search.module);
    if (search.level) setLevel(search.level);
  }, [search.module, search.level]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveName(name);
  }, [name]);

  const chatKey = `${level}|${module}`;
  const messages = chats[chatKey] ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const a = analyze(stats, completedLessons);

  const recordVerdict = (correct: boolean) => {
    recordActivity();
    setStats((s) => {
      const cur = s[module] ?? { attempted: 0, correct: 0 };
      return {
        ...s,
        [module]: {
          attempted: cur.attempted + 1,
          correct: cur.correct + (correct ? 1 : 0),
        },
      };
    });
  };

  const buildSystemInstruction = () =>
    `${SYSTEM_PROMPT}

Student Name: ${name || "Student"}
Selected Difficulty Level: ${level}
Active Topic / Module: ${module}
Student Recorded Progress: ${a.attempted} questions attempted (${a.accuracy}% accuracy), ${completedLessons.length}/24 lessons completed.

Teaching Guidelines:
- Adapt your vocabulary and depth strictly to ${level} level.
- Use valid Python 3 examples inside \`\`\`python code blocks and explain expected output accurately.
- Prefer Socratic hints and step-by-step reasoning before showing a complete solution.
- When a student submits Python code to solve a practice challenge, evaluate it carefully and end your response with VERDICT: CORRECT or VERDICT: INCORRECT.`;

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLastSubmittedPrompt(trimmed);
    const next: Msg[] = [...messages, { role: "user", text: trimmed }];

    setChats((c) => ({ ...c, [chatKey]: next }));
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await callGemini({
        system: buildSystemInstruction(),
        messages: next,
        level,
        module,
        progressSummary: {
          attempted: a.attempted,
          accuracy: a.accuracy,
          completedCount: completedLessons.length,
          recommended: a.recommended,
        },
      });

      let reply = res.text;
      const m = reply.match(/VERDICT:\s*(CORRECT|INCORRECT)/i);

      if (m?.[1]) {
        const ok = m[1].toUpperCase() === "CORRECT";
        recordVerdict(ok);
        reply = reply.replace(
          m[0],
          ok
            ? "✅ **Solution Verified: Correct!**"
            : "❌ **Not quite yet — see the hint above and try again.**",
        );
      }

      setChats((c) => ({
        ...c,
        [chatKey]: [
          ...next,
          {
            role: "model",
            text: reply,
            ...(res.toolsUsed ? { toolsUsed: res.toolsUsed } : {}),
          },
        ],
      }));

      void persistTutorExchangeToSupabase({
        module,
        level,
        userPrompt: trimmed,
        modelReply: reply,
        toolsUsed: res.toolsUsed,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to get an AI Tutor response.");
    } finally {
      setLoading(false);
    }
  }

  const handleRetryLast = () => {
    if (!lastSubmittedPrompt || loading) return;
    const currentList = chats[chatKey] ?? [];
    if (currentList.length > 0 && currentList[currentList.length - 1]?.role === "user") {
      const trimmedHistory = currentList.slice(0, -1);
      setChats((c) => ({ ...c, [chatKey]: trimmedHistory }));
    }
    void send(lastSubmittedPrompt);
  };

  const handleClearChat = () => {
    setChats((c) => ({ ...c, [chatKey]: [] }));
    setError("");
  };

  const quickActions = [
    {
      label: `Teach me ${module}`,
      prompt: `Teach me "${module}" at ${level} level with a clear explanation, a short runnable Python example, and 1 quick check question.`,
      icon: BookOpen,
    },
    {
      label: "Give me a practice problem",
      prompt: `Generate a ${level} Python practice problem on "${module}". Describe the goal and expected output, and wait for my code before showing the solution.`,
      icon: Code2,
    },
    {
      label: "Give me a hint",
      prompt: `Give me a progressive hint for "${module}" without revealing the full answer yet.`,
      icon: Lightbulb,
    },
    {
      label: "Explain line by line",
      prompt: `Show a canonical Python example for "${module}" and explain how it works line by line, including the exact expected output.`,
      icon: FileCode,
    },
    {
      label: "Explain simpler",
      prompt: `Explain "${module}" using a simple everyday analogy and a minimal 3-line Python snippet.`,
      icon: HelpCircle,
    },
    {
      label: "Suggested next step",
      prompt: `Based on my current progress and ${level} level, what should I study or practice next after "${module}"?`,
      icon: SkipForward,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
      {/* Context Setup Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-extrabold text-foreground">AI Python Tutor Agent</span>
        </div>

        <input
          className={`${inputCls} w-36 sm:w-44 font-normal`}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Student name"
        />

        <select
          className={inputCls}
          value={level}
          onChange={(e) => setLevel(e.target.value as LearningLevel)}
          aria-label="Difficulty level"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l} Level
            </option>
          ))}
        </select>

        <select
          className={inputCls}
          value={module}
          onChange={(e) => setModule(e.target.value)}
          aria-label="Topic module"
        >
          {MODULES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Thread
          </button>
        )}
      </div>

      {/* Main Split: Chat Canvas (Left) + Student Context & Next Step Panel (Right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <section className="flex min-h-[72vh] flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          {/* Chat Messages Viewport */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
            {messages.length === 0 && (
              <div className="mx-auto max-w-xl py-10 text-center space-y-5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground">
                    Hi{name ? `, ${name}` : ""}! I&apos;m Naomi, your AI Python Tutor.
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Currently tuned to <strong>{level}</strong> level for <strong>{module}</strong>.
                    Ask any Python question, paste code for debugging help, or pick a guided action
                    below.
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 text-left">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      type="button"
                      disabled={loading}
                      onClick={() => void send(qa.prompt)}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-background/70 p-3 text-xs font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-secondary/50 disabled:opacity-50"
                    >
                      <qa.icon className="h-4 w-4 shrink-0 text-primary" />
                      <span>{qa.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                {m.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
                    {m.text}
                  </div>
                ) : (
                  <div className="max-w-[92%] rounded-2xl border border-border bg-background/70 p-4 sm:p-5 space-y-2.5">
                    {m.toolsUsed && m.toolsUsed.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2 text-[11px] font-semibold text-primary">
                        <Wrench className="h-3.5 w-3.5" />
                        <span>
                          Agent actions: {m.toolsUsed.map((t) => TOOL_LABELS[t] ?? t).join(" · ")}
                        </span>
                      </div>
                    )}
                    <MarkdownMessage content={m.text} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground w-fit">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Naomi is analyzing your request…</span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs sm:text-sm text-destructive"
              >
                <span>{error}</span>
                {lastSubmittedPrompt && (
                  <button
                    type="button"
                    onClick={handleRetryLast}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-foreground border border-border hover:bg-secondary whitespace-nowrap"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry Request
                  </button>
                )}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input Composer & Quick Action Bar */}
          <div className="border-t border-border bg-secondary/30 p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => void send(qa.prompt)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50 whitespace-nowrap"
                >
                  <qa.icon className="h-3.5 w-3.5" />
                  {qa.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Ask a Python question, paste code for debugging, or request a step-by-step explanation… (Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none rounded-xl border border-border bg-card p-3 font-mono text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />

              <button
                type="button"
                onClick={() => void send(input)}
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
                aria-label="Send message to AI Tutor"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Context Panel: Progress, Strengths, Weaknesses & Recommended Lesson */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <Target className="h-4 w-4 text-primary" />
              Your Recorded Progress
            </h2>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Attempted", a.attempted],
                ["Lessons", `${completedLessons.length}/24`],
                ["Accuracy", `${a.accuracy}%`],
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl bg-secondary/70 p-2.5">
                  <div className="font-mono text-base font-bold text-primary tabular-nums">
                    {val}
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${a.accuracy}%` }}
              />
            </div>
          </div>

          <StatusList
            title="Strong Areas"
            icon={TrendingUp}
            items={a.strong}
            tone="text-success"
            empty="Complete exercises or quizzes to uncover strengths."
          />

          <StatusList
            title="Needs Practice"
            icon={AlertTriangle}
            items={a.weak}
            tone="text-destructive"
            empty="No weak modules flagged."
          />

          <div className="rounded-2xl border border-primary/30 bg-card p-5 space-y-3 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Compass className="h-4 w-4 text-primary" />
              Recommended Next Step
            </h2>

            <p className="text-base font-bold text-foreground">{a.recommended}</p>
            <p className="text-xs text-muted-foreground">
              Switch to this topic to study concepts or practice with Naomi.
            </p>

            <div className="grid gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setModule(a.recommended);
                  void send(
                    `Teach me "${a.recommended}" at ${level} level with an example and a quick practice question.`,
                  );
                }}
                className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-accent"
              >
                Study {a.recommended} Now
              </button>
              <Link
                to="/practice"
                className="w-full rounded-xl border border-border bg-secondary py-2 text-center text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                Open Python Code Lab
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusList({
  title,
  icon: Icon,
  items,
  tone,
  empty,
}: {
  title: string;
  icon: typeof Target;
  items: string[];
  tone: string;
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
        <Icon className={`h-4 w-4 ${tone}`} />
        {title}
      </h2>

      {items.length ? (
        <ul className="space-y-1.5 text-xs sm:text-sm text-foreground">
          {items.slice(0, 5).map((i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full bg-current ${tone}`} />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
