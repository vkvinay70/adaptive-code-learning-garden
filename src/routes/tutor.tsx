import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  BookOpen,
  Code2,
  ClipboardCheck,
  Send,
  Lightbulb,
  Baby,
  SkipForward,
  Target,
  TrendingUp,
  AlertTriangle,
  Compass,
  Loader2,
  CheckCircle2,
  XCircle,
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
  recordActivity,
  type Mode,
  type Msg,
  type Stats,
} from "@/lib/tutor";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — NaomiLearn" },
      {
        name: "description",
        content:
          "Chat with the NaomiLearn AI tutor: learn Python concepts, solve practice problems and take adaptive quizzes.",
      },
      { property: "og:title", content: "AI Tutor — NaomiLearn" },
      {
        property: "og:description",
        content:
          "Learn Python with an adaptive AI tutor: lessons, practice problems and quizzes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tutor,
});

type QuizQ = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

const inputCls =
  "h-9 rounded-md border border-input bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function Tutor() {
  const [name, setName] = useState("");
  const [module, setModule] = useState<string>(MODULES[0]);
  const [level, setLevel] = useState<string>(LEVELS[0]);
  const [mode, setMode] = useState<Mode>("learn");
  const [chats, setChats] = useState<Record<string, Msg[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>({});
  const [quiz, setQuiz] = useState<{
    qs: QuizQ[];
    idx: number;
    picks: number[];
  } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(loadName());
    setStats(loadStats());
  }, []);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveName(name);
  }, [name]);

  const chatKey = `${mode}|${module}`;
  const messages = chats[chatKey] ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading, quiz?.idx]);

  const record = (correct: boolean) => {
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

  const system = () =>
    `${SYSTEM_PROMPT}\n\nStudent: ${name || "Student"}. Module: ${module}. Difficulty: ${level}. Current mode: ${mode === "learn" ? "Learn Mode" : mode === "practice" ? "Practice Mode" : "Quiz Mode"}.` +
    (mode === "practice"
      ? "\nWhen you give a challenge, describe it clearly and wait for code. When the student submits code to solve a challenge, evaluate it and end your reply with exactly one line: VERDICT: CORRECT or VERDICT: INCORRECT. Give hints, not the full solution, unless asked twice."
      : "") +
    "\nKeep responses concise and use markdown with ```python code blocks.";

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const next = [...messages, { role: "user" as const, text }];

    setChats((c) => ({ ...c, [chatKey]: next }));
    setInput("");
    setError("");
    setLoading(true);

    try {
      let reply = await callGemini({
        system: system(),
        messages: next,
      });

      const m = reply.match(/VERDICT:\s*(CORRECT|INCORRECT)/i);

      if (m?.[1]) {
        const ok = m[1].toUpperCase() === "CORRECT";
        record(ok);
        reply = reply.replace(
          m[0],
          ok ? "✅ **Correct!**" : "❌ **Not quite yet.**",
        );
      }

      setChats((c) => ({
        ...c,
        [chatKey]: [...next, { role: "model", text: reply }],
      }));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to get an AI response.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function startQuiz() {
    if (loading) return;

    setLoading(true);
    setError("");
    setQuiz(null);

    try {
      const raw = await callGemini({
        system: system(),
        json: true,
        messages: [
          {
            role: "user",
            text: `Create 3 multiple-choice Python questions on "${module}" at ${level} level. Return JSON: {"questions":[{"question":"string, may include markdown code","options":["four options"],"answerIndex":0,"explanation":"string"}]}`,
          },
        ],
      });

      const parsed = JSON.parse(raw);
      const questions = parsed.questions;

      if (
        !Array.isArray(questions) ||
        questions.length < 3 ||
        questions.slice(0, 3).some(
          (q: QuizQ) =>
            typeof q.question !== "string" ||
            !Array.isArray(q.options) ||
            q.options.length !== 4 ||
            !Number.isInteger(q.answerIndex) ||
            q.answerIndex < 0 ||
            q.answerIndex > 3 ||
            typeof q.explanation !== "string",
        )
      ) {
        throw new Error("The AI returned an invalid quiz. Please try again.");
      }

      setQuiz({
        qs: questions.slice(0, 3),
        idx: 0,
        picks: [],
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to generate the quiz.",
      );
    } finally {
      setLoading(false);
    }
  }

  function pick(i: number) {
    if (!quiz || quiz.picks[quiz.idx] !== undefined) return;

    record(i === quiz.qs[quiz.idx]?.answerIndex);
    setQuiz({ ...quiz, picks: [...quiz.picks, i] });
  }

  const a = analyze(stats);

  const tabs: { id: Mode; label: string; icon: typeof BookOpen }[] = [
    { id: "learn", label: "Learn", icon: BookOpen },
    { id: "practice", label: "Practice", icon: Code2 },
    { id: "quiz", label: "Quiz", icon: ClipboardCheck },
  ];

  const starter =
    mode === "learn"
      ? `Teach me ${module}`
      : `Give me a ${level.toLowerCase()} practice problem on ${module}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Setup bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <input
          className={`${inputCls} w-40`}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Student name"
        />

        <select
          className={inputCls}
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setQuiz(null);
          }}
          aria-label="Module"
        >
          {MODULES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <select
          className={inputCls}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Difficulty level"
        >
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>

        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {module} · {level}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="flex min-h-[70vh] flex-col rounded-xl border border-border bg-card">
          <div className="flex gap-1 border-b border-border p-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  mode === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {mode !== "quiz" ? (
              <>
                {messages.length === 0 && (
                  <div className="py-12 text-center">
                    <h2 className="text-2xl font-bold">
                      Hi{name ? `, ${name}` : ""} 👋
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      {mode === "learn"
                        ? "Ask anything, or start with a lesson."
                        : "Solve challenges — I'll hint, not spoil."}
                    </p>
                    <button
                      onClick={() => send(starter)}
                      disabled={loading}
                      className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      {starter}
                    </button>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={m.role === "user" ? "flex justify-end" : ""}
                  >
                    {m.role === "user" ? (
                      <div className="max-w-[80%] whitespace-pre-wrap rounded-xl bg-accent px-4 py-2 font-mono text-sm text-accent-foreground">
                        {m.text}
                      </div>
                    ) : (
                      <div className="prose-tutor text-sm">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <QuizView
                quiz={quiz}
                loading={loading}
                onStart={startQuiz}
                onPick={pick}
                onNext={() =>
                  quiz && setQuiz({ ...quiz, idx: quiz.idx + 1 })
                }
                module={module}
              />
            )}

            {loading && mode !== "quiz" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Your tutor is thinking…
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {mode !== "quiz" && (
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={mode === "practice" ? 4 : 2}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      (e.metaKey ||
                        e.ctrlKey ||
                        (mode === "learn" && !e.shiftKey))
                    ) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={
                    mode === "practice"
                      ? "Paste your Python code here… (Ctrl+Enter to submit)"
                      : "Ask your tutor a question…"
                  }
                  className="flex-1 resize-none rounded-md border border-input bg-code p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <button
                  onClick={() => send(input)}
                  disabled={loading}
                  className="grid w-12 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { t: "Give me a hint", i: Lightbulb },
                  { t: "Explain simpler", i: Baby },
                  { t: "Next topic", i: SkipForward },
                ].map((q) => (
                  <button
                    key={q.t}
                    onClick={() => send(q.t)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
                  >
                    <q.i className="h-3.5 w-3.5" />
                    {q.t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Progress
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Attempted", a.attempted],
                ["Score", a.correct],
                ["Accuracy", `${a.accuracy}%`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-md bg-secondary p-2">
                  <div className="font-mono text-lg font-bold text-primary">
                    {v}
                  </div>
                  <div className="text-[10px] uppercase text-muted-foreground">
                    {l}
                  </div>
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

          <List
            title="Strong Areas"
            icon={TrendingUp}
            items={a.strong}
            tone="text-success"
            empty="Answer questions to discover strengths"
          />

          <List
            title="Needs Practice"
            icon={AlertTriangle}
            items={a.weak}
            tone="text-destructive"
            empty="Nothing flagged yet"
          />

          <div className="rounded-xl border border-primary/40 bg-card p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Compass className="h-4 w-4 text-primary" />
              Recommended Next Lesson
            </h3>

            <p className="font-semibold">{a.recommended}</p>

            <button
              onClick={() => {
                setModule(a.recommended);
                setMode("learn");
                setQuiz(null);
              }}
              className="mt-3 w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground"
            >
              Start lesson
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function List({
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
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className={`h-4 w-4 ${tone}`} />
        {title}
      </h3>

      {items.length ? (
        <ul className="space-y-1 text-sm">
          {items.map((i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full bg-current ${tone}`} />
              {i}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function QuizView({
  quiz,
  loading,
  onStart,
  onPick,
  onNext,
  module,
}: {
  quiz: { qs: QuizQ[]; idx: number; picks: number[] } | null;
  loading: boolean;
  module: string;
  onStart: () => void;
  onPick: (i: number) => void;
  onNext: () => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Generating your quiz…
      </div>
    );

  if (!quiz)
    return (
      <div className="py-16 text-center">
        <ClipboardCheck className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-3 text-2xl font-bold">
          3-question quiz on {module}
        </h2>
        <button
          onClick={onStart}
          className="mt-5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Start quiz
        </button>
      </div>
    );

  const done =
    quiz.picks.length === quiz.qs.length &&
    quiz.idx >= quiz.qs.length - 1 &&
    quiz.picks[quiz.idx] !== undefined;

  const score = quiz.picks.filter(
    (p, i) => p === quiz.qs[i]?.answerIndex,
  ).length;

  const q = quiz.qs[quiz.idx]!;
  const picked = quiz.picks[quiz.idx];

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {quiz.qs.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= quiz.idx ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      <div className="font-mono text-xs text-muted-foreground">
        Question {quiz.idx + 1} of {quiz.qs.length}
      </div>

      <div className="prose-tutor text-base font-medium">
        <ReactMarkdown>{q.question}</ReactMarkdown>
      </div>

      <div className="grid gap-2">
        {q.options.map((o, i) => {
          const state =
            picked === undefined
              ? "border-border hover:border-primary"
              : i === q.answerIndex
                ? "border-success text-success"
                : i === picked
                  ? "border-destructive text-destructive"
                  : "border-border opacity-60";

          return (
            <button
              key={i}
              onClick={() => onPick(i)}
              className={`rounded-md border px-4 py-3 text-left font-mono text-sm transition ${state}`}
            >
              {String.fromCharCode(65 + i)}. {o}
            </button>
          );
        })}
      </div>

      {picked !== undefined && (
        <div className="rounded-md bg-secondary p-3 text-sm">
          <div className="mb-1 font-semibold">
            {picked === q.answerIndex ? "✅ Correct!" : "❌ Incorrect"}
          </div>
          <div className="prose-tutor">
            <ReactMarkdown>{q.explanation}</ReactMarkdown>
          </div>
        </div>
      )}

      {picked !== undefined && !done && (
        <button
          onClick={onNext}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Next question
        </button>
      )}

      {done && (
        <div className="rounded-xl border border-primary/40 p-4">
          <h3 className="text-lg font-bold">
            Score: {score}/{quiz.qs.length}
          </h3>

          <ul className="mt-2 space-y-1 text-sm">
            {quiz.qs.map((qq, i) => (
              <li key={i} className="flex items-start gap-2">
                {quiz.picks[i] === qq.answerIndex ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <span>
                  Q{i + 1}: correct answer —{" "}
                  <span className="font-mono">
                    {qq.options[qq.answerIndex]}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={onStart}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            New quiz
          </button>
        </div>
      )}
    </div>
  );
}
