import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck, ArrowRight } from "lucide-react";
import { MODULES, LEVELS } from "@/lib/tutor";

export const Route = createFileRoute("/quizzes")({
  head: () => ({
    meta: [
      { title: "Quizzes — NaomiLearn" },
      {
        name: "description",
        content:
          "Test your Python knowledge with adaptive NaomiLearn quizzes across every module and difficulty level.",
      },
      { property: "og:title", content: "Quizzes — NaomiLearn" },
      {
        property: "og:description",
        content:
          "Adaptive Python quizzes with instant feedback and score tracking on NaomiLearn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quizzes,
});

function Quizzes() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <ClipboardCheck className="h-6 w-6 text-primary" />
        Quizzes
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        3-question adaptive quizzes, generated fresh every time, with instant
        feedback and explanations.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <div key={m} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">{m}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {l}
                </span>
              ))}
            </div>
            <Link
              to="/tutor"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Take a quiz
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        Timed quizzes, leaderboards and saved quiz history are planned for a
        future phase. Scores already count toward your dashboard accuracy.
      </p>
    </div>
  );
}
