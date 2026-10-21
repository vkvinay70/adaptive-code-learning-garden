import type { User } from "@supabase/supabase-js";
import { CURRICULUM_LESSONS, type LearningLevel } from "./curriculum";
import { isSupabaseConfigured, supabase } from "./supabase";

export const MODULES = [
  "Setup & First Program",
  "Variables & Data Types",
  "Input/Output & Operators",
  "Conditionals (if/else)",
  "Loops",
  "Collections & Dictionaries",
  "Functions",
  "Debugging & Mini Project",
  "Strings & Collections",
  "Modules & *args/**kwargs",
  "File Handling & JSON",
  "Exceptions (try/except)",
  "Object-Oriented Programming",
  "Iterators & Comprehensions",
  "Standard Library",
  "Practical Project",
  "Decorators & Generators",
  "Advanced OOP Design",
  "Type Hints & Testing",
  "Algorithms & Data Structures",
  "Asynchronous Python",
  "Performance & Caching",
  "APIs & Architecture",
  "AI Pipeline Capstone",
] as const;

export const LEVELS: readonly LearningLevel[] = ["Beginner", "Intermediate", "Advanced"] as const;

export type Mode = "learn" | "practice" | "quiz";

export const SYSTEM_PROMPT = `You are Naomi, the AI Python Tutor at NaomiLearn — Python & AI Academy.
Your mission is to teach Python clearly, patiently, and interactively.
Rules:
1. Adapt your vocabulary, depth, and examples to the student's selected level (Beginner, Intermediate, or Advanced).
2. Prefer Socratic teaching and step-by-step reasoning over handing out complete solutions immediately.
3. Explain code line by line when requested, and accurately explain expected output.
4. Never pretend you executed code unless a tool result or student output was provided.
5. Keep conversations focused on Python, computer science, AI engineering, and safe programming practices.`;

export type Msg = {
  role: "user" | "model";
  text: string;
  toolsUsed?: string[];
};

export type Stats = Record<string, { attempted: number; correct: number }>;

export interface QuizAttemptRecord {
  id: string;
  date: string;
  module: string;
  level: LearningLevel;
  score: number;
  total: number;
}

export interface CompletedLessonRecord {
  lessonId: string;
  title: string;
  level: LearningLevel;
  completedAt: string;
}

export async function callGemini(opts: {
  system: string;
  messages: Msg[];
  json?: boolean;
  level?: string;
  module?: string;
  progressSummary?: {
    attempted: number;
    accuracy: number;
    completedCount: number;
    recommended: string;
  };
}): Promise<{ text: string; toolsUsed?: string[] }> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: opts.system,
      messages: opts.messages.map((m) => ({ role: m.role, text: m.text })),
      json: opts.json,
      level: opts.level,
      module: opts.module,
      progressSummary: opts.progressSummary,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `AI request failed (${res.status})`);
  }

  if (typeof data?.text !== "string" || !data.text) {
    throw new Error("AI returned an empty response.");
  }

  return {
    text: data.text,
    ...(Array.isArray(data.toolsUsed) ? { toolsUsed: data.toolsUsed } : {}),
  };
}

export function analyze(stats: Stats, completedLessons: CompletedLessonRecord[] = []) {
  const strong: string[] = [];
  const weak: string[] = [];
  let attempted = 0;
  let correct = 0;

  const allModuleNames = Array.from(new Set([...MODULES, ...Object.keys(stats)]));

  for (const m of allModuleNames) {
    const s = stats[m];
    if (!s || s.attempted === 0) continue;

    attempted += s.attempted;
    correct += s.correct;

    (s.correct / s.attempted >= 0.7 ? strong : weak).push(m);
  }

  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;

  const completedIds = new Set(completedLessons.map((c) => c.lessonId));
  const nextUnfinishedLesson = CURRICULUM_LESSONS.find((l) => !completedIds.has(l.id));

  let recommended: string = nextUnfinishedLesson?.shortTitle ?? MODULES[0];

  if (weak.length) {
    const acc = (m: string) => (stats[m]?.correct ?? 0) / (stats[m]?.attempted || 1);
    recommended = [...weak].sort((a, b) => acc(a) - acc(b))[0] ?? recommended;
  } else {
    const untried = MODULES.find((m) => !stats[m]?.attempted);
    if (untried && !nextUnfinishedLesson) {
      recommended = untried;
    }
  }

  return { strong, weak, attempted, correct, accuracy, recommended };
}

// ---------- Student progress persistence (localStorage + Supabase PostgreSQL sync) ----------

const STATS_KEY = "pytutor_stats";
const DAYS_KEY = "naomilearn_days";
const DAILY_KEY = "naomilearn_daily";
const NAME_KEY = "student_name";
const LEVEL_KEY = "naomilearn_preferred_level";
const GOAL_KEY = "naomilearn_daily_goal";
const COMPLETED_LESSONS_KEY = "naomilearn_completed_lessons";
const COMPLETED_EXERCISES_KEY = "naomilearn_completed_exercises";
const QUIZ_HISTORY_KEY = "naomilearn_quiz_history";
const STUDY_MINUTES_KEY = "naomilearn_study_minutes";

export const DAILY_GOAL = 5;

const today = () => new Date().toISOString().slice(0, 10);

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadStats(): Stats {
  if (!isBrowser()) return {};
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveStats(stats: Stats) {
  if (!isBrowser()) return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordModuleAttempt(moduleName: string, correct: boolean): Stats {
  recordActivity();
  const current = loadStats();
  const prev = current[moduleName] ?? { attempted: 0, correct: 0 };
  const next: Stats = {
    ...current,
    [moduleName]: {
      attempted: prev.attempted + 1,
      correct: prev.correct + (correct ? 1 : 0),
    },
  };
  saveStats(next);
  return next;
}

export function loadName(): string {
  if (!isBrowser()) return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function saveName(name: string) {
  if (!isBrowser()) return;
  localStorage.setItem(NAME_KEY, name);
}

export function loadPreferredLevel(): LearningLevel {
  if (!isBrowser()) return "Beginner";
  const val = localStorage.getItem(LEVEL_KEY);
  if (val === "Beginner" || val === "Intermediate" || val === "Advanced") {
    return val;
  }
  return "Beginner";
}

export function savePreferredLevel(level: LearningLevel) {
  if (!isBrowser()) return;
  localStorage.setItem(LEVEL_KEY, level);
}

export function loadDailyGoal(): number {
  if (!isBrowser()) return DAILY_GOAL;
  const val = Number(localStorage.getItem(GOAL_KEY));
  return Number.isInteger(val) && val >= 1 && val <= 50 ? val : DAILY_GOAL;
}

export function saveDailyGoal(goal: number) {
  if (!isBrowser()) return;
  localStorage.setItem(GOAL_KEY, String(Math.max(1, Math.min(50, goal))));
}

export function loadCompletedLessons(): CompletedLessonRecord[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_LESSONS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markLessonCompleted(lesson: {
  id: string;
  title: string;
  level: LearningLevel;
}): CompletedLessonRecord[] {
  if (!isBrowser()) return [];
  const existing = loadCompletedLessons();
  if (existing.some((c) => c.lessonId === lesson.id)) {
    return existing;
  }
  recordActivity();
  addStudyMinutes(5);
  const completedAt = new Date().toISOString();
  const updated: CompletedLessonRecord[] = [
    ...existing,
    {
      lessonId: lesson.id,
      title: lesson.title,
      level: lesson.level,
      completedAt,
    },
  ];
  localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(updated));

  // Persist to Supabase learning_progress table when authenticated
  if (isSupabaseConfigured) {
    void supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) return;
      void supabase.from("learning_progress").upsert(
        {
          user_id: uid,
          module_id: lesson.id,
          module_title: lesson.title,
          level: lesson.level,
          completed: true,
          completed_at: completedAt,
        },
        { onConflict: "user_id,module_id" },
      );
    });
  }

  return updated;
}

export function loadCompletedExercises(): string[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_EXERCISES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markExerciseCompleted(lessonId: string, codeSubmitted?: string): string[] {
  if (!isBrowser()) return [];
  const existing = loadCompletedExercises();
  const updated = existing.includes(lessonId) ? existing : [...existing, lessonId];
  if (!existing.includes(lessonId)) {
    localStorage.setItem(COMPLETED_EXERCISES_KEY, JSON.stringify(updated));
    addStudyMinutes(3);
  }

  if (isSupabaseConfigured) {
    const lessonMeta = CURRICULUM_LESSONS.find((l) => l.id === lessonId);
    void supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid || !lessonMeta) return;
      void supabase.from("learning_progress").upsert(
        {
          user_id: uid,
          module_id: lessonMeta.id,
          module_title: lessonMeta.title,
          level: lessonMeta.level,
          exercise_completed: true,
          ...(codeSubmitted ? { code_submitted: codeSubmitted } : {}),
        },
        { onConflict: "user_id,module_id" },
      );
    });
  }

  return updated;
}

export function loadQuizHistory(): QuizAttemptRecord[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveQuizAttempt(
  attempt: Omit<QuizAttemptRecord, "id" | "date">,
): QuizAttemptRecord[] {
  if (!isBrowser()) return [];
  const existing = loadQuizHistory();
  const attemptedAt = new Date().toISOString();
  const record: QuizAttemptRecord = {
    ...attempt,
    id: `quiz-${Date.now()}`,
    date: attemptedAt,
  };
  const updated = [record, ...existing].slice(0, 50);
  localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
  addStudyMinutes(2);

  if (isSupabaseConfigured) {
    void supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) return;
      void supabase.from("quiz_attempts").insert({
        user_id: uid,
        module_id: attempt.module,
        level: attempt.level,
        score: attempt.score,
        total_questions: attempt.total,
        attempted_at: attemptedAt,
      });
    });
  }

  return updated;
}

export function getStudyMinutes(): number {
  if (!isBrowser()) return 0;
  try {
    const val = Number(localStorage.getItem(STUDY_MINUTES_KEY) ?? "0");
    return Number.isFinite(val) && val >= 0 ? val : 0;
  } catch {
    return 0;
  }
}

export function addStudyMinutes(mins: number) {
  if (!isBrowser()) return;
  const cur = getStudyMinutes();
  localStorage.setItem(STUDY_MINUTES_KEY, String(cur + Math.max(0, mins)));
}

/** Mark today as active and bump today's answered-question count. */
export function recordActivity() {
  if (!isBrowser()) return;
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
    const daily: Record<string, number> = JSON.parse(localStorage.getItem(DAILY_KEY) ?? "{}");
    daily[d] = (daily[d] ?? 0) + 1;
    localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  } catch {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ [d]: 1 }));
  }
}

/** Consecutive active days ending today (or yesterday if today is still fresh). */
export function getStreak(): number {
  if (!isBrowser()) return 0;
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
  if (isBrowser()) {
    try {
      daily = JSON.parse(localStorage.getItem(DAILY_KEY) ?? "{}");
    } catch {
      // Ignore invalid saved activity.
    }
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
  if (!isBrowser()) return 0;
  try {
    const daily: Record<string, number> = JSON.parse(localStorage.getItem(DAILY_KEY) ?? "{}");
    return daily[today()] ?? 0;
  } catch {
    return 0;
  }
}

export function resetAllStudentProgress() {
  if (!isBrowser()) return;
  [
    STATS_KEY,
    DAYS_KEY,
    DAILY_KEY,
    COMPLETED_LESSONS_KEY,
    COMPLETED_EXERCISES_KEY,
    QUIZ_HISTORY_KEY,
    STUDY_MINUTES_KEY,
  ].forEach((k) => localStorage.removeItem(k));
}

export async function hydrateFromSupabaseSession(user: User): Promise<void> {
  if (!isBrowser() || !isSupabaseConfigured) return;

  try {
    const meta = user.user_metadata ?? {};
    const metaName =
      typeof meta["full_name"] === "string"
        ? meta["full_name"]
        : typeof meta["name"] === "string"
          ? meta["name"]
          : "";
    if (metaName && !loadName()) {
      saveName(metaName);
    }

    // Fetch profile if available
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("full_name, preferred_level, daily_goal, study_minutes")
      .eq("id", user.id)
      .maybeSingle();

    if (profileRow) {
      if (profileRow.full_name && !loadName()) {
        saveName(profileRow.full_name);
      }
      if (
        profileRow.preferred_level === "Beginner" ||
        profileRow.preferred_level === "Intermediate" ||
        profileRow.preferred_level === "Advanced"
      ) {
        savePreferredLevel(profileRow.preferred_level);
      }
      if (typeof profileRow.daily_goal === "number") {
        saveDailyGoal(profileRow.daily_goal);
      }
      if (
        typeof profileRow.study_minutes === "number" &&
        profileRow.study_minutes > getStudyMinutes()
      ) {
        localStorage.setItem(STUDY_MINUTES_KEY, String(profileRow.study_minutes));
      }
    }

    // Merge remote learning_progress rows into local completed lessons
    const { data: progressRows } = await supabase
      .from("learning_progress")
      .select("module_id, module_title, level, completed, exercise_completed, completed_at")
      .eq("user_id", user.id);

    if (Array.isArray(progressRows) && progressRows.length > 0) {
      const localCompleted = loadCompletedLessons();
      const seen = new Set(localCompleted.map((c) => c.lessonId));
      const merged = [...localCompleted];
      const exercises = new Set(loadCompletedExercises());

      for (const row of progressRows) {
        if (row.completed && row.module_id && !seen.has(row.module_id)) {
          seen.add(row.module_id);
          merged.push({
            lessonId: row.module_id,
            title: row.module_title || row.module_id,
            level:
              row.level === "Intermediate" || row.level === "Advanced" ? row.level : "Beginner",
            completedAt: row.completed_at || new Date().toISOString(),
          });
        }
        if (row.exercise_completed && row.module_id) {
          exercises.add(row.module_id);
        }
      }

      localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(merged));
      localStorage.setItem(COMPLETED_EXERCISES_KEY, JSON.stringify(Array.from(exercises)));
    }
  } catch {
    // Gracefully ignore if tables are not yet initialized on the user's Supabase project
  }
}

export async function persistTutorExchangeToSupabase(opts: {
  module: string;
  level: LearningLevel;
  userPrompt: string;
  modelReply: string;
  toolsUsed?: string[];
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) return;

    const { data: conv } = await supabase
      .from("tutor_conversations")
      .insert({
        user_id: uid,
        title: `${opts.module} (${opts.level})`,
        module_context: opts.module,
        level_context: opts.level,
      })
      .select("id")
      .maybeSingle();

    if (conv?.id) {
      await supabase.from("tutor_messages").insert([
        {
          conversation_id: conv.id,
          user_id: uid,
          role: "user",
          content: opts.userPrompt,
        },
        {
          conversation_id: conv.id,
          user_id: uid,
          role: "model",
          content: opts.modelReply,
          tools_used: opts.toolsUsed ?? [],
        },
      ]);
    }
  } catch {
    // Non-blocking cloud persistence
  }
}

export async function syncProgressToSupabase(): Promise<{
  synced: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      synced: false,
      message: "Supabase environment variables are not configured.",
    };
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      return {
        synced: false,
        message: "Sign in with Google to sync your progress to your cloud account.",
      };
    }

    const fullName = loadName() || user.user_metadata?.["full_name"] || "Student";
    const preferredLevel = loadPreferredLevel();
    const dailyGoal = loadDailyGoal();
    const studyMinutes = getStudyMinutes();
    const streakDays = getStreak();

    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        preferred_level: preferredLevel,
        daily_goal: dailyGoal,
        naomilearn_stats: loadStats(),
        completed_lessons: loadCompletedLessons().map((l) => l.lessonId),
        study_minutes: studyMinutes,
        updated_at: new Date().toISOString(),
      },
    });

    // Also upsert into public.profiles and public.user_learning_goals
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: fullName,
        preferred_level: preferredLevel,
        daily_goal: dailyGoal,
        study_minutes: studyMinutes,
        streak_days: streakDays,
        last_active_date: today(),
      },
      { onConflict: "id" },
    );

    await supabase.from("user_learning_goals").upsert(
      {
        user_id: user.id,
        daily_activity_target: dailyGoal,
        current_track: preferredLevel,
      },
      { onConflict: "user_id" },
    );

    return { synced: true, message: "Progress synced to your NaomiLearn Google cloud profile." };
  } catch (err) {
    return {
      synced: false,
      message: err instanceof Error ? err.message : "Unable to sync to cloud.",
    };
  }
}
