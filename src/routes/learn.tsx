import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight } from "lucide-react";
import { MODULES } from "@/lib/tutor";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn Python — NaomiLearn" },
      {
        name: "description",
        content:
          "Learn Python step by step with NaomiLearn: variables, conditionals, loops and functions, taught with simple analogies.",
      },
      { property: "og:title", content: "Learn Python — NaomiLearn" },
      {
        property: "og:description",
        content:
          "Learn Python step by step with NaomiLearn's adaptive AI lessons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Learn,
});

function Learn() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <BookOpen className="h-6 w-6 text-primary" />
        Learn Python
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a module and learn it with your AI tutor — simple analogies,
        short code snippets, at your own pace.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {MODULES.map((m, i) => (
          <div
            key={m}
            className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/50"
          >
            <div className="font-mono text-xs text-gold">
              Module {i + 1}
            </div>
            <h2 className="mt-1 font-semibold">{m}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Interactive lesson with the AI tutor, adapted to your level.
            </p>
            <Link
              to="/tutor"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Start lesson
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        A structured lesson library with saved progress per lesson is planned
        for a future phase. For now, every module runs through the AI Tutor.
      </p>
    </div>
  );
}
