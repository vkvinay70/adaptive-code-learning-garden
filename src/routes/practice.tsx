import { createFileRoute, Link } from "@tanstack/react-router";
import { Code2, ArrowRight, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Code Lab — NaomiLearn" },
      {
        name: "description",
        content:
          "Practice Python in the NaomiLearn Code Lab: solve challenges with hints from your AI tutor.",
      },
      { property: "og:title", content: "Code Lab — NaomiLearn" },
      {
        property: "og:description",
        content:
          "Solve Python challenges with step-by-step hints from the NaomiLearn AI tutor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Practice,
});

function Practice() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Code2 className="h-6 w-6 text-primary" />
        Code Lab
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Solve Python challenges. Your tutor gives hints first — never the
        answer right away.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Practice with the AI Tutor</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The Practice tab in the AI Tutor generates challenges for your
          chosen module and difficulty, evaluates your code, and guides you
          step by step when you get stuck.
        </p>
        <Link
          to="/tutor"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Open practice mode
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed border-border p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p className="text-xs text-muted-foreground">
          A dedicated in-browser Python runner with automated test cases is
          planned for a future phase. Code you write today is reviewed by the
          AI tutor, not executed on our servers.
        </p>
      </div>
    </div>
  );
}
