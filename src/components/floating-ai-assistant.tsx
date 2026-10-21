import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sparkles,
  X,
  Minimize2,
  Send,
  Loader2,
  RotateCcw,
  ArrowRight,
  Code2,
  BookOpen,
  Lightbulb,
  Compass,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  LEVELS,
  SYSTEM_PROMPT,
  callGemini,
  loadPreferredLevel,
  persistTutorExchangeToSupabase,
  type Msg,
} from "@/lib/tutor";
import type { LearningLevel } from "@/lib/curriculum";
import { MarkdownMessage } from "./markdown-message";

const STARTER_PROMPTS = [
  {
    label: "What is included in NaomiLearn?",
    prompt:
      "What is included in NaomiLearn, and how are the 24 Python modules organized across Beginner, Intermediate, and Advanced tracks?",
    icon: Compass,
  },
  {
    label: "Explain Python lists vs tuples",
    prompt:
      "Explain the difference between a Python list and a tuple with a short runnable code example.",
    icon: BookOpen,
  },
  {
    label: "How do list comprehensions work?",
    prompt: "Show me how Python list comprehensions work step by step with an example.",
    icon: Code2,
  },
  {
    label: "Help me debug a Python loop",
    prompt:
      "What are the most common mistakes with Python for and while loops, and how do I avoid off-by-one errors?",
    icon: Lightbulb,
  },
];

const PERSONAL_DATA_PATTERN =
  /\b(my progress|my streak|my score|my quiz|my account|my completed|save my|my history|my dashboard)\b/i;

export function FloatingAiAssistant() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { isAuthenticated, displayName } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState<LearningLevel>("Beginner");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsAuthPrompt, setNeedsAuthPrompt] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLevel(loadPreferredLevel());
  }, []);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, loading, isOpen, needsAuthPrompt]);

  // Hide the floating launcher when already on the dedicated full-screen /tutor workspace
  if (pathname === "/tutor" || pathname.startsWith("/tutor/")) {
    return null;
  }

  const sendPrompt = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: Msg[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError("");

    // If a logged-out visitor specifically asks about their personal saved progress/account data,
    // provide a clear, friendly explanation and prompt Google sign-in without blocking general Q&A.
    if (!isAuthenticated && PERSONAL_DATA_PATTERN.test(trimmed)) {
      setNeedsAuthPrompt(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "To view or sync your **personal learning progress, daily streak, quiz accuracy, or saved chat history**, please sign in with your Google account via **Get Started**.\n\nMeanwhile, you can ask me any question about **Python syntax, debugging, algorithms, or NaomiLearn's 24-module curriculum** right here without signing in!",
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      const systemInstruction = `${SYSTEM_PROMPT}
Student Name: ${isAuthenticated ? displayName || "Student" : "Guest Learner"}
Authentication Status: ${isAuthenticated ? "Signed in with Google" : "Public visitor exploring NaomiLearn"}
Selected Level: ${level}
Context: Quick Floating Python AI Helper on ${pathname}.
- Answer general questions about NaomiLearn (24 structured Python modules across Beginner, Intermediate, and Advanced tracks; in-browser Python 3 Code Lab; adaptive quizzes; personal AI Tutor) and any Python programming or debugging question clearly.
- Include short, runnable \`\`\`python code snippets when helpful.
- Only mention signing in with Google if the user asks to save progress or view personal account stats.`;

      const res = await callGemini({
        system: systemInstruction,
        messages: nextMessages,
        level,
        module: "General Python Assistant",
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: res.text,
          ...(res.toolsUsed ? { toolsUsed: res.toolsUsed } : {}),
        },
      ]);

      if (isAuthenticated) {
        void persistTutorExchangeToSupabase({
          module: "Floating Assistant",
          level,
          userPrompt: trimmed,
          modelReply: res.text,
          toolsUsed: res.toolsUsed,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach the Python AI Assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end">
      {isOpen ? (
        <section
          aria-label="Naomi Python AI Assistant"
          className="mb-3 flex h-[520px] max-h-[80vh] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-fade-up"
        >
          {/* Assistant Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-[#0F172A] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <Sparkles className="h-4 w-4 text-[#FFD43B]" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-extrabold tracking-tight text-white">
                  Naomi Python AI Helper
                </div>
                <div className="truncate text-[11px] text-slate-300">
                  Ask about Python or NaomiLearn anytime
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isAuthenticated && (
                <Link
                  to="/tutor"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-2 py-1 text-[11px] font-semibold text-sky-300 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap"
                  title="Open full AI Tutor workspace"
                >
                  Full View
                </Link>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Minimize AI Assistant"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close AI Assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Subheader: Level Selector & Reset */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-secondary/40 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground">Level:</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as LearningLevel)}
                aria-label="Assistant difficulty level"
                className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError("");
                  setNeedsAuthPrompt(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground whitespace-nowrap"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Live Chat Area (Open to both public visitors and signed-in students) */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {messages.length === 0 && (
              <div className="space-y-3 py-1">
                <div className="rounded-xl border border-border bg-secondary/35 p-3 text-xs leading-relaxed text-foreground">
                  <span className="font-bold text-primary">
                    Hi{isAuthenticated && displayName ? `, ${displayName}` : ""}!
                  </span>{" "}
                  Ask me any Python question, explore NaomiLearn&apos;s 24 modules, or pick a quick
                  starter below:
                </div>

                <div className="space-y-1.5">
                  {STARTER_PROMPTS.map((sp) => (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => void sendPrompt(sp.prompt)}
                      disabled={loading}
                      className="flex w-full items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-secondary/50"
                    >
                      <sp.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{sp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                {m.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-3.5 py-2.5 text-xs text-primary-foreground">
                    {m.text}
                  </div>
                ) : (
                  <div className="max-w-[94%] rounded-2xl border border-border bg-background/80 p-3">
                    <MarkdownMessage content={m.text} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Thinking…</span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive"
              >
                {error}
              </div>
            )}

            {!isAuthenticated && (needsAuthPrompt || messages.length >= 2) && (
              <div className="rounded-xl border border-primary/25 bg-secondary/45 p-3 text-xs space-y-2">
                <div className="font-semibold text-foreground">
                  Want to save your chat history &amp; track module progress?
                </div>
                <Link
                  to="/login"
                  search={{ redirect: pathname === "/login" ? "/tutor" : pathname }}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                >
                  <span>Sign in with Google</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendPrompt(input);
            }}
            className="flex items-center gap-2 border-t border-border bg-card p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Python or NaomiLearn…"
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message to Python AI Assistant"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </section>
      ) : null}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close Python AI Assistant" : "Open Python AI Assistant"}
        className="group inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary whitespace-nowrap"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white group-hover:bg-white/20">
          <Sparkles className="h-3.5 w-3.5 text-[#FFD43B]" />
        </span>
        <span>Python AI Helper</span>
      </button>
    </div>
  );
}
