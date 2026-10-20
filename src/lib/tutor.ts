
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

// ---------- Student progress persistence (localStorage) ----------

const STATS_KEY = "pytutor_stats";
const DAYS_KEY = "naomilearn_days";
const DAILY_KEY = "naomilearn_daily";
const NAME_KEY = "student_name";

export const DAILY_GOAL = 5;

const today = () => new Date().toISOString().slice(0, 10);

export function loadStats(): Stats {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadName(): string {
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function saveName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}

/** Mark today as active and bump today's answered-question count. */
export function recordActivity() {
  const d = today();

  try {
    const days: string[] = JSON.parse(localStorage.getItem(DAYS_KEY) ?? "[]");
    if (!days.includes(d)) {
      localStorage.setItem(DAYS_KEY, JSON.stringify([...days, d]));
    }
  } catch {
    localStorage.setItem(DAYS_KEY, JSON.stringify([d]));
  }

  try {
    const daily: Record<string, number> = JSON.parse(
      localStorage.getItem(DAILY_KEY) ?? "{}",
    );
    daily[d] = (daily[d] ?? 0) + 1;
    localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  } catch {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ [d]: 1 }));
  }
}

/** Consecutive active days ending today (or yesterday if today is still fresh). */
export function getStreak(): number {
  let days: string[] = [];
  try {
    days = JSON.parse(localStorage.getItem(DAYS_KEY) ?? "[]");
  } catch {
    return 0;
  }
  const set = new Set(days);
  const cursor = new Date();
  if (!set.has(today())) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Questions answered per day for the last 7 days, oldest first. */
export function getWeeklyActivity(): { day: string; count: number }[] {
  let daily: Record<string, number> = {};
  try {
    daily = JSON.parse(localStorage.getItem(DAILY_KEY) ?? "{}");
  } catch {
    // Ignore invalid saved activity.
  }

  const out: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: daily[key] ?? 0,
    });
  }
  return out;
}

export function getTodayCount(): number {
  try {
    const daily: Record<string, number> = JSON.parse(
      localStorage.getItem(DAILY_KEY) ?? "{}",
    );
    return daily[today()] ?? 0;
  } catch {
    return 0;
  }
}
