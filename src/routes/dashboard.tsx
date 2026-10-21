import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Flame,
  Target,
  ClipboardCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  Compass,
  Award,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  CheckCircle2,
} from "lucide-react";
import {
  MODULES,
  analyze,
  loadStats,
  loadName,
  loadPreferredLevel,
  loadDailyGoal,
  loadCompletedLessons,
  loadQuizHistory,
  getStudyMinutes,
  getStreak,
  getWeeklyActivity,
  getTodayCount,
  type Stats,
  type CompletedLessonRecord,
  type QuizAttemptRecord,
} from "@/lib/tutor";
import { CURRICULUM_LESSONS, type LearningLevel } from "@/lib/curriculum";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — NaomiLearn" },
      {
        name: "description",
        content:
          "Your NaomiLearn student dashboard: learning streak, daily goal, quiz accuracy, study time, completed lessons, and recommended next module.",
      },
      { property: "og:title", content: "Student Dashboard — NaomiLearn" },
      {
        property: "og:description",
        content:
          "Track your Python learning streak, accuracy, and curriculum progress on NaomiLearn.",
      },
    ],
  }),
  component: DashboardPage,
});

function useStudentDashboardData() {
  const [name, setName] = useState("");
  const [preferredLevel, setPreferredLevel] = useState<LearningLevel>("Beginner");
  const [dailyGoal, setDailyGoal] = useState(5);
  const [stats, setStats] = useState<Stats>({});
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonRecord[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptRecord[]>([]);
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState<{ day: string; count: number }[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setName(loadName());
      setPreferredLevel(loadPreferredLevel());
      setDailyGoal(loadDailyGoal());
      setStats(loadStats());
      setCompletedLessons(loadCompletedLessons());
      setQuizHistory(loadQuizHistory());
      setStudyMinutes(getStudyMinutes());
      setStreak(getStreak());
      setWeek(getWeeklyActivity());
      setTodayCount(getTodayCount());
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  return {
    name,
    preferredLevel,
    dailyGoal,
    stats,
    completedLessons,
    quizHistory,
    studyMinutes,
    streak,
    week,
    todayCount,
  };
}

function DashboardPage() {
  const {
    name,
    preferredLevel,
    dailyGoal,
    stats,
    completedLessons,
    quizHistory,
    studyMinutes,
    streak,
    week,
    todayCount,
  } = useStudentDashboardData();

  const a = analyze(stats, completedLessons);
  const hasActivity = a.attempted > 0 || completedLessons.length > 0;
  const weekTotal = week.reduce((s, d) => s + d.count, 0);
  const weekMax = Math.max(1, ...week.map((d) => d.count));
  const goalPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  const completedIds = new Set(completedLessons.map((l) => l.lessonId));
  const nextCurriculumLesson =
    CURRICULUM_LESSONS.find((l) => l.level === preferredLevel && !completedIds.has(l.id)) ??
    CURRICULUM_LESSONS.find((l) => !completedIds.has(l.id)) ??
    CURRICULUM_LESSONS[0]!;

  const achievements = [
    {
      title: "First Steps",
      desc: "Complete your first lesson or answer a quiz question",
      unlocked: a.attempted >= 1 || completedLessons.length >= 1,
    },
    {
      title: "Consistent Coder",
      desc: "Answer 10 practice or quiz questions",
      unlocked: a.attempted >= 10,
    },
    {
      title: "Sharp Accuracy",
      desc: "Reach 80% accuracy with at least 5 answers",
      unlocked: a.attempted >= 5 && a.accuracy >= 80,
    },
    {
      title: "Track Explorer",
      desc: "Complete at least 3 curriculum modules",
      unlocked: completedLessons.length >= 3,
    },
    {
      title: "On a Roll",
      desc: "Keep a 3-day learning streak",
      unlocked: streak >= 3,
    },
  ];

  const formattedStudyTime =
    studyMinutes > 0
      ? studyMinutes >= 60
        ? `${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m`
        : `${studyMinutes} min`
      : "0 min";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      {/* Welcome Banner + Daily Goal */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span>{preferredLevel} Track</span>
              <span aria-hidden="true">·</span>
              <span>
                {completedLessons.length} of {CURRICULUM_LESSONS.length} modules completed
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
              Welcome back{name ? `, ${name}` : " to NaomiLearn"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Learn Python. Master AI. Build Your Future.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/learn"
              search={{ level: nextCurriculumLesson.level, lessonId: nextCurriculumLesson.id }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4" />
              Continue Learning
            </Link>
            <Link
              to="/tutor"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Open AI Tutor
            </Link>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="mt-5 rounded-xl border border-border bg-secondary/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-semibold text-foreground">
              <Target className="h-4 w-4 text-gold" />
              Daily learning goal: {dailyGoal} activities
            </span>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {todayCount}/{dailyGoal} completed today ({goalPct}%)
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          {todayCount === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Complete a lesson checkpoint, run an exercise in the Code Lab, or answer a quiz
              question to start today&apos;s streak.
            </p>
          )}
        </div>
      </section>

      {/* 4 Primary Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Learning streak"
          value={streak > 0 ? `${streak} day${streak > 1 ? "s" : ""}` : "0 days"}
          hint={streak > 0 ? "Active consecutive days" : "Complete 1 activity today to start"}
          tone="text-gold"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Questions attempted"
          value={String(a.attempted)}
          hint={
            a.attempted > 0
              ? `${a.correct} correct · ${completedLessons.length} lessons done`
              : "No quiz or practice questions yet"
          }
          tone="text-primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Quiz accuracy"
          value={a.attempted > 0 ? `${a.accuracy}%` : "—"}
          hint={a.attempted > 0 ? "Across all attempted modules" : "Take a topic quiz to measure"}
          tone="text-success"
        />
        <StatCard
          icon={Clock}
          label="Study time"
          value={formattedStudyTime}
          hint={
            studyMinutes > 0
              ? "Recorded across lessons, lab & quizzes"
              : "Automatically tracked as you learn"
          }
          tone="text-primary"
        />
      </section>

      {/* Continue Learning + Recommended Next Lesson */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-primary">
                Continue Learning · {nextCurriculumLesson.level} Track
              </span>
              <span className="font-mono tabular-nums">
                Module {String(nextCurriculumLesson.number).padStart(2, "0")} ·{" "}
                {nextCurriculumLesson.duration}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-foreground">{nextCurriculumLesson.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{nextCurriculumLesson.summary}</p>

            <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              {nextCurriculumLesson.objectives.map((obj) => (
                <li key={obj} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Link
              to="/learn"
              search={{
                level: nextCurriculumLesson.level,
                lessonId: nextCurriculumLesson.id,
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
            >
              Open Lesson
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/practice"
              search={{ lessonId: nextCurriculumLesson.id }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 whitespace-nowrap"
            >
              <Code2 className="h-4 w-4" />
              Practice in Code Lab
            </Link>
          </div>
        </section>

        <section className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Compass className="h-4 w-4 text-primary" />
              Recommended Focus Topic
            </h2>
            <p className="mt-2 text-lg font-bold text-foreground">{a.recommended}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {a.weak.includes(a.recommended)
                ? "Your accuracy in this topic is below 70%. A quick review or AI Tutor session will help solidify it."
                : "Recommended next based on your current curriculum progression."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5 border-t border-border pt-4">
            <Link
              to="/tutor"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
            >
              Study with AI Tutor
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/quizzes"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 whitespace-nowrap"
            >
              Take Topic Quiz
            </Link>
          </div>
        </section>
      </div>

      {/* Weekly Activity + Track Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">7-Day Learning Activity</h2>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {weekTotal} total this week
            </span>
          </div>

          {weekTotal === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No recorded activity this week yet. Complete a lesson or answer a quiz question to
                populate your 7-day chart.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex h-36 items-end gap-3 pt-4">
              {week.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-[11px] font-semibold text-foreground tabular-nums">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary transition-all"
                    style={{
                      height: `${Math.max(8, (d.count / weekMax) * 100)}px`,
                    }}
                    title={`${d.count} activities on ${d.day}`}
                  />
                  <span className="font-mono text-[11px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Track Completion Overview */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Curriculum Track Progress</h2>
            <Link to="/progress" className="text-xs font-semibold text-primary hover:underline">
              Full Analytics
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {(["Beginner", "Intermediate", "Advanced"] as LearningLevel[]).map((lvl) => {
              const totalInLevel = CURRICULUM_LESSONS.filter((l) => l.level === lvl).length;
              const doneInLevel = completedLessons.filter((c) => c.level === lvl).length;
              const pct = Math.round((doneInLevel / totalInLevel) * 100);

              return (
                <div key={lvl}>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">{lvl} Python Track</span>
                    <span className="font-mono text-muted-foreground tabular-nums">
                      {doneInLevel}/{totalInLevel} modules · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent Quiz Attempts + Achievements */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Recent Quiz Attempts
            </h2>
            <Link to="/quizzes" className="text-xs font-semibold text-primary hover:underline">
              Take a Quiz
            </Link>
          </div>

          {quizHistory.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No quiz attempts recorded yet. Your scores and accuracy will appear here after your
                first quiz.
              </p>
              <Link
                to="/quizzes"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Start your first quiz
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {quizHistory.slice(0, 5).map((attempt) => {
                const pct = Math.round((attempt.score / attempt.total) * 100);
                return (
                  <li key={attempt.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="font-semibold text-foreground">{attempt.module}</div>
                      <div className="text-xs text-muted-foreground">
                        {attempt.level} · {new Date(attempt.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-mono text-sm font-bold text-primary tabular-nums">
                      {attempt.score}/{attempt.total} ({pct}%)
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Award className="h-4 w-4 text-gold" />
            Milestones &amp; Achievements
          </h2>
          <ul className="mt-4 space-y-2.5">
            {achievements.map((ach) => (
              <li
                key={ach.title}
                className={`flex items-start gap-3 rounded-xl border p-3 ${
                  ach.unlocked ? "border-primary/30 bg-secondary/60" : "border-border opacity-65"
                }`}
              >
                {ach.unlocked ? (
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                ) : (
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <div className="text-sm font-semibold text-foreground">{ach.title}</div>
                  <div className="text-xs text-muted-foreground">{ach.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Strengths & Weaknesses */}
      {hasActivity && (
        <section className="grid gap-6 sm:grid-cols-2">
          <MiniList
            title="Strong Areas (70%+ Accuracy)"
            icon={TrendingUp}
            items={a.strong}
            tone="text-success"
            empty="Complete quizzes to reveal your strongest modules."
          />
          <MiniList
            title="Recommended for Practice"
            icon={AlertTriangle}
            items={a.weak}
            tone="text-destructive"
            empty="No weak modules flagged — great work!"
          />
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  hint: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className={`h-4 w-4 ${tone}`} />
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function MiniList({
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
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-2.5 flex items-center gap-2 text-sm font-bold text-foreground">
        <Icon className={`h-4 w-4 ${tone}`} />
        {title}
      </h3>
      {items.length ? (
        <ul className="space-y-1.5 text-sm text-foreground">
          {items.map((i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${tone}`} />
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
