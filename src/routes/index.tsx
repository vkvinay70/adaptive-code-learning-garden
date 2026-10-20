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
} from "lucide-react";
import {
  MODULES,
  analyze,
  loadStats,
  loadName,
  getStreak,
  getWeeklyActivity,
  getTodayCount,
  DAILY_GOAL,
  type Stats,
} from "@/lib/tutor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — NaomiLearn" },
      {
        name: "description",
        content:
          "Your NaomiLearn student dashboard: learning streak, quiz accuracy, module progress and recommended next lessons.",
      },
      { property: "og:title", content: "Dashboard — NaomiLearn" },
      {
        property: "og:description",
        content:
          "Track your Python learning streak, accuracy and progress on NaomiLearn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function useStudentData() {
  const [name, setName] = useState("");
  const [stats, setStats] = useState<Stats>({});
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState<{ day: string; count: number }[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setName(loadName());
      setStats(loadStats());
      setStreak(getStreak());
      setWeek(getWeeklyActivity());
      setTodayCount(getTodayCount());
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  return { name, stats, streak, week, todayCount };
}

function Dashboard() {
  const { name, stats, streak, week, todayCount } = useStudentData();
  const a = analyze(stats);
  const hasActivity = a.attempted > 0;
  const weekTotal = week.reduce((s, d) => s + d.count, 0);
  const weekMax = Math.max(1, ...week.map((d) => d.count));
  const goalPct = Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100));

  const achievements = [
    {
      title: "First Steps",
      desc: "Answer your first question",
      unlocked: a.attempted >= 1,
    },
    {
      title: "Getting Consistent",
      desc: "Answer 10 questions",
      unlocked: a.attempted >= 10,
    },
    {
      title: "Sharp Shooter",
      desc: "Reach 80% accuracy with 5+ answers",
      unlocked: a.attempted >= 5 && a.accuracy >= 80,
    },
    {
      title: "Well Rounded",
      desc: "Try all four modules",
      unlocked: MODULES.every((m) => (stats[m]?.attempted ?? 0) > 0),
    },
    {
      title: "On a Roll",
      desc: "Keep a 3-day learning streak",
      unlocked: streak >= 3,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {/* Welcome */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to NaomiLearn{name ? `, ${name}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Learn Python. Master AI. Build Your Future.
            </p>
          </div>
          <Link
            to="/tutor"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Open AI Tutor
          </Link>
        </div>

        {/* Daily goal */}
        <div className="mt-5 rounded-lg border border-border bg-secondary/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Target className="h-4 w-4 text-gold" />
              Daily goal: {DAILY_GOAL} questions
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {todayCount}/{DAILY_GOAL} today
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          {todayCount === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Answer a question in the AI Tutor to start today's progress.
            </p>
          )}
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Learning streak"
          value={streak > 0 ? `${streak} day${streak > 1 ? "s" : ""}` : "—"}
          hint={streak > 0 ? "Keep it going!" : "Learn today to start a streak"}
          tone="text-gold"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Questions attempted"
          value={String(a.attempted)}
          hint={hasActivity ? `${a.correct} correct` : "No questions yet"}
          tone="text-primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Quiz accuracy"
          value={hasActivity ? `${a.accuracy}%` : "—"}
          hint={hasActivity ? "Across all modules" : "Take a quiz to measure"}
          tone="text-success"
        />
        <StatCard
          icon={Clock}
          label="Study time"
          value="—"
          hint="Study time tracking is coming soon"
          tone="text-muted-foreground"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly activity */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Weekly activity</h2>
          {weekTotal === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No activity this week yet. Your daily answered questions will
              chart here once you start learning.
            </p>
          ) : (
            <div className="mt-4 flex h-32 items-end gap-2">
              {week.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/80"
                    style={{ height: `${Math.max(4, (d.count / weekMax) * 100)}%` }}
                    title={`${d.count} questions`}
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Module progress */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Module progress</h2>
          <div className="mt-4 space-y-3">
            {MODULES.map((m) => {
              const s = stats[m];
              const pct = s?.attempted
                ? Math.round((s.correct / s.attempted) * 100)
                : 0;
              return (
                <div key={m}>
                  <div className="flex justify-between text-xs">
                    <span>{m}</span>
                    <span className="font-mono text-muted-foreground">
                      {s?.attempted ? `${s.correct}/${s.attempted} · ${pct}%` : "not started"}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${s?.attempted ? "bg-primary" : ""}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Continue learning + recommended */}
        <section className="space-y-6">
          <div className="rounded-xl border border-primary/40 bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Compass className="h-4 w-4 text-primary" />
              Recommended next lesson
            </h2>
            <p className="mt-2 text-lg font-bold">{a.recommended}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {a.weak.includes(a.recommended)
                ? "This is your weakest area — a quick review will help."
                : "The next module you haven't explored yet."}
            </p>
            <Link
              to="/tutor"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Continue learning
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Recent quiz attempts */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Recent quiz attempts
            </h2>
            <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No quiz history yet. Your scores will appear here after your
              first quiz in the AI Tutor.
            </p>
          </div>
        </section>

        {/* Achievements */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Award className="h-4 w-4 text-gold" />
            Achievements
          </h2>
          <ul className="mt-4 space-y-3">
            {achievements.map((ach) => (
              <li
                key={ach.title}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  ach.unlocked
                    ? "border-gold/40 bg-gold/5"
                    : "border-border opacity-60"
                }`}
              >
                {ach.unlocked ? (
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                ) : (
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <div className="text-sm font-medium">{ach.title}</div>
                  <div className="text-xs text-muted-foreground">{ach.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Strengths / weaknesses */}
      {hasActivity && (
        <section className="grid gap-6 sm:grid-cols-2">
          <MiniList
            title="Strong areas"
            icon={TrendingUp}
            items={a.strong}
            tone="text-success"
            empty="Answer more questions to reveal strengths"
          />
          <MiniList
            title="Needs practice"
            icon={AlertTriangle}
            items={a.weak}
            tone="text-destructive"
            empty="Nothing flagged — nice work"
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
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`h-4 w-4 ${tone}`} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
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
    <div className="rounded-xl border border-border bg-card p-5">
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
