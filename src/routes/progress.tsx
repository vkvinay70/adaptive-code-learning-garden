import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Compass,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import {
  MODULES,
  analyze,
  loadStats,
  loadCompletedLessons,
  loadCompletedExercises,
  loadQuizHistory,
  getStudyMinutes,
  getStreak,
  getWeeklyActivity,
  getTodayCount,
  loadDailyGoal,
  type Stats,
  type CompletedLessonRecord,
  type QuizAttemptRecord,
} from "@/lib/tutor";
import { CURRICULUM_LESSONS, type LearningLevel } from "@/lib/curriculum";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Learning Progress & Analytics — NaomiLearn AI Academy" },
      {
        name: "description",
        content:
          "Inspect your Python learning streak, daily goal completion, module accuracy breakdown, completed lessons, and quiz attempt history at NaomiLearn AI Academy.",
      },
      {
        property: "og:title",
        content: "Learning Progress & Analytics — NaomiLearn AI Academy",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [stats, setStats] = useState<Stats>({});
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonRecord[]>([]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptRecord[]>([]);
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState<{ day: string; count: number }[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [filterLevel, setFilterLevel] = useState<LearningLevel | "All">("All");

  useEffect(() => {
    const refresh = () => {
      setStats(loadStats());
      setCompletedLessons(loadCompletedLessons());
      setCompletedExercises(loadCompletedExercises());
      setQuizHistory(loadQuizHistory());
      setStudyMinutes(getStudyMinutes());
      setStreak(getStreak());
      setWeek(getWeeklyActivity());
      setTodayCount(getTodayCount());
      setDailyGoal(loadDailyGoal());
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const a = analyze(stats, completedLessons);
  const weekTotal = week.reduce((s, d) => s + d.count, 0);
  const weekMax = Math.max(1, ...week.map((d) => d.count));
  const completedIds = new Set(completedLessons.map((c) => c.lessonId));
  const solvedIds = new Set(completedExercises);

  const visibleLessons =
    filterLevel === "All"
      ? CURRICULUM_LESSONS
      : CURRICULUM_LESSONS.filter((l) => l.level === filterLevel);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-foreground">
            <BarChart3 className="h-6 w-6 text-primary" />
            Learning Progress &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time statistics computed from your completed lessons, Code Lab verifications, and
            quiz attempts.
          </p>
        </div>

        <Link
          to="/learn"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
        >
          <BookOpen className="h-4 w-4" />
          Continue Curriculum
        </Link>
      </div>

      {/* Top KPI Row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Flame className="h-4 w-4 text-gold" />
            Learning Streak
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground tabular-nums">
            {streak} {streak === 1 ? "day" : "days"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {todayCount}/{dailyGoal} daily goal completed today
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Completed Modules
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground tabular-nums">
            {completedLessons.length} / {CURRICULUM_LESSONS.length}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {completedExercises.length} Code Lab exercises solved
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target className="h-4 w-4 text-primary" />
            Overall Accuracy
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground tabular-nums">
            {a.attempted > 0 ? `${a.accuracy}%` : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {a.correct} correct of {a.attempted} attempted
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Active Study Time
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground tabular-nums">
            {studyMinutes} min
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Cumulative workspace engagement</div>
        </div>
      </section>

      {/* Weekly Chart + Recommended Topic */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Weekly Activity Distribution</h2>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {weekTotal} activities in last 7 days
            </span>
          </div>

          {weekTotal === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No activities logged in the past 7 days yet. Complete a lesson, solve a Code Lab
              challenge, or take a quiz to start your weekly chart.
            </div>
          ) : (
            <div className="mt-5 flex h-40 items-end gap-3 pt-4">
              {week.map((d, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary transition-all"
                    style={{
                      height: `${Math.max(8, (d.count / weekMax) * 110)}px`,
                    }}
                  />
                  <span className="font-mono text-[11px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Compass className="h-4 w-4 text-primary" />
              Personalized Recommendation
            </h2>
            <p className="mt-2 text-lg font-extrabold text-foreground">{a.recommended}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {a.weak.includes(a.recommended)
                ? "Flagged for review because your accuracy in this module is currently under 70%."
                : "Recommended next step along your structured Python path."}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
              <div>
                <div className="flex items-center gap-1 font-semibold text-success">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Strong Topics ({a.strong.length})
                </div>
                <p className="mt-1 text-muted-foreground">
                  {a.strong.length > 0 ? a.strong.slice(0, 3).join(", ") : "None recorded yet"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 font-semibold text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Needs Practice ({a.weak.length})
                </div>
                <p className="mt-1 text-muted-foreground">
                  {a.weak.length > 0 ? a.weak.slice(0, 3).join(", ") : "No weak areas"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 border-t border-border pt-4">
            <Link
              to="/tutor"
              search={{ module: a.recommended }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
            >
              Practice with AI Tutor
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/quizzes"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 whitespace-nowrap"
            >
              Take Topic Quiz
            </Link>
          </div>
        </section>
      </div>

      {/* Module-by-Module Curriculum Matrix */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Module-Level Performance &amp; Completion Matrix
            </h2>
            <p className="text-xs text-muted-foreground">
              Track lesson completion, Code Lab verification, and quiz accuracy across all 24
              modules.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary p-1">
            {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterLevel(lvl)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  filterLevel === lvl
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground">
                <th className="py-2.5 pr-4">#</th>
                <th className="py-2.5 pr-4">Module</th>
                <th className="py-2.5 pr-4">Track</th>
                <th className="py-2.5 pr-4">Lesson Status</th>
                <th className="py-2.5 pr-4">Code Lab</th>
                <th className="py-2.5 text-right">Quiz Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleLessons.map((lesson) => {
                const isLessonDone = completedIds.has(lesson.id);
                const isLabDone = solvedIds.has(lesson.id);
                const modStat = stats[lesson.shortTitle];
                const acc = modStat?.attempted
                  ? `${Math.round((modStat.correct / modStat.attempted) * 100)}% (${modStat.correct}/${modStat.attempted})`
                  : "Not attempted";

                return (
                  <tr key={lesson.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground tabular-nums">
                      {String(lesson.number).padStart(2, "0")}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-foreground">
                      <Link
                        to="/learn"
                        search={{ level: lesson.level, lessonId: lesson.id }}
                        className="hover:text-primary hover:underline"
                      >
                        {lesson.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{lesson.level}</td>
                    <td className="py-3 pr-4">
                      {isLessonDone ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">In progress</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {isLabDone ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <Link
                          to="/practice"
                          search={{ lessonId: lesson.id }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Open Lab
                        </Link>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-muted-foreground tabular-nums">
                      {acc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quiz Attempt Log */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          Recorded Quiz Attempt Log
        </h2>

        {quizHistory.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No completed quizzes yet. Take a topic quiz in the Quizzes section to build your
            assessment history.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {quizHistory.slice(0, 10).map((q) => {
              const pct = Math.round((q.score / q.total) * 100);
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between py-3 text-xs sm:text-sm"
                >
                  <div>
                    <span className="font-semibold text-foreground">{q.module}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      · {q.level} · {new Date(q.date).toLocaleString()}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-primary tabular-nums">
                    {q.score}/{q.total} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
