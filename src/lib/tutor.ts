export const MODULES = ["Variables & Data Types", "Conditionals (if/else)", "Loops", "Functions"] as const;
export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type Mode = "learn" | "practice" | "quiz";

export const SYSTEM_PROMPT =
  "You are PyTutor, a patient, adaptive AI programming tutor for beginners. In Learn Mode, teach concepts simply with analogies and short code snippets. In Practice Mode, provide challenges and offer helpful hints when errors occur before revealing answers. In Quiz Mode, assess answers and deliver constructive feedback.";

export type Msg = { role: "user" | "model"; text: string };

export type Stats = Record<string, { attempted: number; correct: number }>;

export async function callGemini(opts: {
  apiKey: string;
  system: string;
  messages: Msg[];
  json?: boolean;
}): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(opts.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: opts.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: opts.json ? { responseMimeType: "application/json" } : undefined,
      }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Gemini error ${res.status}`);
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
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
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  let recommended: string = MODULES[0];
  if (weak.length) {
    const acc = (m: string) => (stats[m]?.correct ?? 0) / (stats[m]?.attempted || 1);
    recommended = [...weak].sort((a, b) => acc(a) - acc(b))[0] ?? MODULES[0];
  } else {
    recommended = MODULES.find((m) => !stats[m]?.attempted) ?? MODULES[3];
  }
  return { strong, weak, attempted, correct, accuracy, recommended };
}
