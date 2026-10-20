
export const MODULES = [
  "Variables & Data Types",
  "Conditionals (if/else)",
  "Loops",
  "Functions",
] as const;

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type Mode = "learn" | "practice" | "quiz";

export const SYSTEM_PROMPT =
  "You are PyTutor, a patient, adaptive AI programming tutor for beginners. In Learn Mode, teach concepts simply with analogies and short code snippets. In Practice Mode, provide challenges and offer helpful hints when errors occur before revealing answers. In Quiz Mode, assess answers and deliver constructive feedback.";

export type Msg = { role: "user" | "model"; text: string };

export type Stats = Record<string, { attempted: number; correct: number }>;

export async function callGemini(opts: {
  system: string;
  messages: Msg[];
  json?: boolean;
}): Promise<string> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: opts.system,
      messages: opts.messages,
      json: opts.json,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `AI request failed (${res.status})`);
  }

  if (typeof data?.text !== "string" || !data.text) {
    throw new Error("AI returned an empty response.");
  }

  return data.text;
}

export function analyze(stats: Stats) {
  const strong: string[] = [];
  const weak: string[] = [];
  let attempted = 0;
  let correct = 0;

  for (const m of MODULES) {
    const s = stats[m];

    if (!s || s.attempted === 0) continue;

    attempted += s.attempted;
    correct += s.correct;

    (s.correct / s.attempted >= 0.7 ? strong : weak).push(m);
  }

  const accuracy = attempted
    ? Math.round((correct / attempted) * 100)
    : 0;

  let recommended: string = MODULES[0];

  if (weak.length) {
    const acc = (m: string) =>
      (stats[m]?.correct ?? 0) / (stats[m]?.attempted || 1);

    recommended =
      [...weak].sort((a, b) => acc(a) - acc(b))[0] ?? MODULES[0];
  } else {
    recommended = MODULES.find((m) => !stats[m]?.attempted) ?? MODULES[3];
  }

  return { strong, weak, attempted, correct, accuracy, recommended };
}
