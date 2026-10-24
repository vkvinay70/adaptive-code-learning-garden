import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Loader2,
  Award,
  Filter,
} from "lucide-react";
import {
  getCuratedQuizzes,
  getLessonsByLevel,
  type LearningLevel,
  type QuizQuestion,
} from "@/lib/curriculum";
import {
  callGemini,
  loadQuizHistory,
  recordModuleAttempt,
  saveQuizAttempt,
  SYSTEM_PROMPT,
  type QuizAttemptRecord,
} from "@/lib/tutor";

export const Route = createFileRoute("/quizzes")({
  head: () => ({
    meta: [
      { title: "Adaptive Python Quizzes — NaomiLearn AI Academy" },
      {
        name: "description",
        content:
          "Test your Python mastery with Beginner, Intermediate, and Advanced topic quizzes at NaomiLearn AI Academy. Receive instant feedback, explanations, and review missed questions.",
      },
      { property: "og:title", content: "Adaptive Python Quizzes — NaomiLearn AI Academy" },
      {
        property: "og:description",
        content: "Topic-based Python quizzes with instant explanations and score tracking.",
      },
    ],
  }),
  component: QuizzesPage,
});

function QuizzesPage() {
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel>("Beginner");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(() =>
    getCuratedQuizzes("Beginner", "All Topics"),
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");
  const [history, setHistory] = useState<QuizAttemptRecord[]>([]);

  useEffect(() => {
    setHistory(loadQuizHistory());
  }, []);

  // Load curated questions whenever level or topic changes
  useEffect(() => {
    const curated = getCuratedQuizzes(selectedLevel, selectedTopic);
    setActiveQuestions(curated.length > 0 ? curated : getCuratedQuizzes(selectedLevel));
    setCurrentIndex(0);
    setPicks({});
    setQuizCompleted(false);
    setAiError("");
  }, [selectedLevel, selectedTopic]);

  const levelTopics = ["All Topics", ...getLessonsByLevel(selectedLevel).map((l) => l.shortTitle)];

  const currentQuestion = activeQuestions[currentIndex];
  const currentPick = picks[currentIndex];

  const handleSelectOption = (optionIdx: number) => {
    if (!currentQuestion || currentPick !== undefined) return;
    const isCorrect = optionIdx === currentQuestion.answerIndex;
    recordModuleAttempt(currentQuestion.module, isCorrect);

    const nextPicks = { ...picks, [currentIndex]: optionIdx };
    setPicks(nextPicks);

    // If this was the last question, record the completed quiz attempt
    if (Object.keys(nextPicks).length === activeQuestions.length) {
      const finalScore = activeQuestions.reduce(
        (acc, q, i) => acc + (nextPicks[i] === q.answerIndex ? 1 : 0),
        0,
      );
      const updatedHistory = saveQuizAttempt({
        module: selectedTopic === "All Topics" ? `${selectedLevel} Comprehensive` : selectedTopic,
        level: selectedLevel,
        score: finalScore,
        total: activeQuestions.length,
      });
      setHistory(updatedHistory);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetryAll = () => {
    setCurrentIndex(0);
    setPicks({});
    setQuizCompleted(false);
  };

  const handleRetryMissedOnly = () => {
    const missed = activeQuestions.filter((q, idx) => picks[idx] !== q.answerIndex);
    if (missed.length === 0) return;
    setActiveQuestions(missed);
    setCurrentIndex(0);
    setPicks({});
    setQuizCompleted(false);
  };

  const handleGenerateAiQuiz = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError("");

    const topicName =
      selectedTopic === "All Topics" ? `${selectedLevel} Python concepts` : selectedTopic;

    try {
      const raw = await callGemini({
        system: SYSTEM_PROMPT,
        json: true,
        level: selectedLevel,
        module: topicName,
        messages: [
          {
            role: "user",
            text: `Create 4 distinct multiple-choice Python questions on "${topicName}" at ${selectedLevel} difficulty. Include code snippets where helpful. Return JSON: {"questions":[{"question":"string","options":["A","B","C","D"],"answerIndex":0,"explanation":"string"}]}`,
          },
        ],
      });

      const parsed = JSON.parse(raw.text);
      const list = parsed?.questions;
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("Invalid quiz structure returned.");
      }

      const formatted: QuizQuestion[] = list
        .slice(0, 4)
        .map((q: Record<string, unknown>, idx: number) => {
          const opts = Array.isArray(q["options"]) ? q["options"] : [];
          const ansIdx = q["answerIndex"];
          return {
            id: `ai-q-${Date.now()}-${idx}`,
            level: selectedLevel,
            module: selectedTopic === "All Topics" ? selectedLevel : selectedTopic,
            question: String(q["question"] ?? ""),
            options: [
              String(opts[0] ?? "Option A"),
              String(opts[1] ?? "Option B"),
              String(opts[2] ?? "Option C"),
              String(opts[3] ?? "Option D"),
            ],
            answerIndex:
              typeof ansIdx === "number" && Number.isInteger(ansIdx) && ansIdx >= 0 && ansIdx <= 3
                ? ansIdx
                : 0,
            explanation: String(q["explanation"] ?? ""),
          };
        });

      setActiveQuestions(formatted);
      setCurrentIndex(0);
      setPicks({});
      setQuizCompleted(false);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : "Unable to generate AI quiz. Using curated topic questions instead.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const totalScore = activeQuestions.reduce(
    (acc, q, idx) => acc + (picks[idx] === q.answerIndex ? 1 : 0),
    0,
  );
  const missedCount = activeQuestions.length - totalScore;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-foreground">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Python Assessment &amp; Topic Quizzes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Practice curated multiple-choice questions by level and topic, or generate a fresh AI
            quiz on demand.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary p-1">
            {(["Beginner", "Intermediate", "Advanced"] as LearningLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelectedLevel(lvl);
                  setSelectedTopic("All Topics");
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedLevel === lvl
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Topic Selector */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              aria-label="Filter quiz by topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-3 text-xs sm:text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {levelTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Generate AI Quiz Button */}
          <button
            type="button"
            onClick={handleGenerateAiQuiz}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50 whitespace-nowrap"
          >
            {aiLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            )}
            {aiLoading ? "Generating..." : "Generate Fresh AI Quiz"}
          </button>
        </div>
      </div>

      {aiError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs sm:text-sm text-destructive"
        >
          {aiError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Main Quiz Card (8 cols) */}
        <section className="lg:col-span-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          {!quizCompleted && currentQuestion ? (
            <div className="space-y-6">
              {/* Progress Bar & Question Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {currentQuestion.level} · {currentQuestion.module}
                  </span>
                  <span className="font-mono tabular-nums">
                    Question {currentIndex + 1} of {activeQuestions.length}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {activeQuestions.map((q, i) => {
                    const picked = picks[i];
                    const tone =
                      picked === undefined
                        ? i === currentIndex
                          ? "bg-primary"
                          : "bg-secondary"
                        : picked === q.answerIndex
                          ? "bg-success"
                          : "bg-destructive";
                    return (
                      <div
                        key={q.id}
                        className={`h-2 flex-1 rounded-full transition-colors ${tone}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Question Prompt */}
              <div className="prose-tutor text-base sm:text-lg font-semibold text-foreground">
                <ReactMarkdown>{currentQuestion.question}</ReactMarkdown>
              </div>

              {/* 4 Multiple-Choice Options */}
              <div className="grid gap-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isAnswered = currentPick !== undefined;
                  const isCorrectOpt = idx === currentQuestion.answerIndex;
                  const isPickedOpt = idx === currentPick;

                  let styleCls =
                    "border-border bg-background/60 hover:border-primary/60 hover:bg-secondary/40 text-foreground";
                  if (isAnswered) {
                    if (isCorrectOpt) {
                      styleCls = "border-success bg-success/10 text-foreground font-semibold";
                    } else if (isPickedOpt) {
                      styleCls = "border-destructive bg-destructive/10 text-destructive";
                    } else {
                      styleCls = "border-border opacity-55";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left font-mono text-xs sm:text-sm transition-colors ${styleCls}`}
                    >
                      <span>
                        <strong className="mr-2 font-bold">{String.fromCharCode(65 + idx)}.</strong>
                        {opt}
                      </span>
                      {isAnswered && isCorrectOpt && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      )}
                      {isAnswered && isPickedOpt && !isCorrectOpt && (
                        <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Explanation Feedback */}
              {currentPick !== undefined && (
                <div
                  role="status"
                  className={`rounded-xl border p-4 text-sm ${
                    currentPick === currentQuestion.answerIndex
                      ? "border-success/40 bg-success/10"
                      : "border-destructive/40 bg-destructive/10"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    {currentPick === currentQuestion.answerIndex ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span>
                          Not quite — Correct answer:{" "}
                          {String.fromCharCode(65 + currentQuestion.answerIndex)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="prose-tutor mt-1.5 text-xs sm:text-sm text-muted-foreground">
                    <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <button
                  type="button"
                  onClick={handleRetryAll}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart Quiz
                </button>

                {currentPick !== undefined && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
                  >
                    {currentIndex + 1 < activeQuestions.length
                      ? "Next Question"
                      : "View Quiz Results"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completion Summary & Review Screen */
            <div className="space-y-6">
              <div className="rounded-2xl border border-primary/30 bg-secondary/40 p-6 text-center">
                <Award className="mx-auto h-10 w-10 text-gold" />
                <h2 className="mt-3 text-2xl font-extrabold text-foreground">
                  Quiz Complete! Score: {totalScore}/{activeQuestions.length} (
                  {Math.round((totalScore / Math.max(1, activeQuestions.length)) * 100)}
                  %)
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {missedCount === 0
                    ? "Flawless work! Every answer was correct."
                    : `You answered ${totalScore} correctly and missed ${missedCount}. Review the breakdown below or retry missed questions.`}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRetryAll}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retry Full Quiz
                  </button>
                  {missedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleRetryMissedOnly}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-secondary whitespace-nowrap"
                    >
                      Retry {missedCount} Missed Question
                      {missedCount > 1 ? "s" : ""}
                    </button>
                  )}
                  <Link
                    to="/tutor"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary hover:bg-secondary whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4" />
                    Discuss with AI Tutor
                  </Link>
                </div>
              </div>

              {/* Detailed Question-by-Question Review */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">
                  Question Breakdown &amp; Explanations
                </h3>
                {activeQuestions.map((q, idx) => {
                  const userPick = picks[idx];
                  const correct = userPick === q.answerIndex;
                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-border bg-background/50 p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-primary">
                          Q{idx + 1} · {q.module}
                        </span>
                        {correct ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                            <XCircle className="h-3.5 w-3.5" />
                            Missed
                          </span>
                        )}
                      </div>
                      <div className="prose-tutor text-sm font-medium text-foreground">
                        <ReactMarkdown>{q.question}</ReactMarkdown>
                      </div>
                      <div className="text-xs font-mono text-foreground">
                        Correct Answer:{" "}
                        <span className="text-success font-semibold">
                          {q.options[q.answerIndex]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{q.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Right Sidebar: Quiz History & Stats (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground">Recent Quiz History</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Complete the current quiz to record your first attempt in your learning log.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {history.slice(0, 6).map((h) => {
                  const pct = Math.round((h.score / h.total) * 100);
                  return (
                    <li key={h.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <div className="font-semibold text-foreground">{h.module}</div>
                        <div className="text-muted-foreground">
                          {h.level} · {new Date(h.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-primary tabular-nums">
                        {h.score}/{h.total} ({pct}%)
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
