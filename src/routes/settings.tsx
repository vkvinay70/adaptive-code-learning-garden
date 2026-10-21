import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Target,
  Cloud,
  RotateCcw,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import {
  loadName,
  saveName,
  loadPreferredLevel,
  savePreferredLevel,
  loadDailyGoal,
  saveDailyGoal,
  resetAllStudentProgress,
  syncProgressToSupabase,
} from "@/lib/tutor";
import type { LearningLevel } from "@/lib/curriculum";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account & Learning Settings — NaomiLearn" },
      {
        name: "description",
        content:
          "Configure your NaomiLearn student display name, preferred Python track, daily learning goal, and Google cloud sync.",
      },
      { property: "og:title", content: "Account & Settings — NaomiLearn" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { email: userEmail, displayName, signOut } = useAuth();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LearningLevel>("Beginner");
  const [dailyGoal, setDailyGoal] = useState(5);
  const [savedBanner, setSavedBanner] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setName(loadName() || displayName);
    setLevel(loadPreferredLevel());
    setDailyGoal(loadDailyGoal());
  }, [displayName]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    saveName(name.trim());
    savePreferredLevel(level);
    saveDailyGoal(dailyGoal);
    setSavedBanner("Your learning preferences have been saved.");

    const res = await syncProgressToSupabase();
    setSyncStatus(res.message);
  };

  const handleCloudSync = async () => {
    const res = await syncProgressToSupabase();
    setSyncStatus(res.message);
  };

  const handleSignOut = async () => {
    await signOut();
    await navigate({ to: "/" });
  };

  const handleResetProgress = () => {
    resetAllStudentProgress();
    setConfirmReset(false);
    setSavedBanner("All local learning statistics and history have been reset.");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-foreground">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Account &amp; Learning Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize your student profile, default Python track, daily activity goal, and Google
          cloud sync.
        </p>
      </div>

      {savedBanner && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm font-medium text-foreground"
        >
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Profile & Learning Preferences Form */}
      <form
        onSubmit={handleSavePreferences}
        className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-2xs"
      >
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <User className="h-4 w-4 text-primary" />
          Student Profile &amp; Study Goals
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="student-display-name"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Display Name
            </label>
            <input
              id="student-display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Naomi"
              maxLength={80}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Used by your Dashboard and AI Tutor to personalize greetings.
            </p>
          </div>

          <div>
            <label
              htmlFor="preferred-level"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Active Python Track
            </label>
            <select
              id="preferred-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as LearningLevel)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Beginner">Beginner Track (Modules 1–8)</option>
              <option value="Intermediate">Intermediate Track (Modules 9–16)</option>
              <option value="Advanced">Advanced Track (Modules 17–24)</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="daily-goal-input"
            className="mb-1.5 flex items-center justify-between text-xs font-semibold text-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-gold" />
              Daily Activity Goal
            </span>
            <span className="font-mono text-primary tabular-nums">
              {dailyGoal} activities / day
            </span>
          </label>
          <input
            id="daily-goal-input"
            type="range"
            min={1}
            max={20}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground tabular-nums">
            <span>1 (Casual)</span>
            <span>5 (Recommended)</span>
            <span>10 (Intensive)</span>
            <span>20 (Immersion)</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground transition-colors hover:bg-accent whitespace-nowrap"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Google Cloud Account & Supabase Sync Section */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xs">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Cloud className="h-4 w-4 text-primary" />
          Google Account &amp; Cloud Sync
        </h2>

        <div className="space-y-3">
          <p className="text-sm text-foreground">
            Authenticated via Google OAuth as{" "}
            <strong className="font-mono text-primary">{userEmail || displayName}</strong>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCloudSync}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
            >
              <Cloud className="h-4 w-4" />
              Sync Progress to Cloud Now
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {syncStatus && <p className="text-xs font-medium text-primary">{syncStatus}</p>}
      </section>

      {/* Reset Local Progress */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-2xs">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <RotateCcw className="h-4 w-4 text-destructive" />
          Reset Learning History
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Clear your local quiz statistics, completed lesson checkpoints, and streak counters on
          this device.
        </p>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive hover:text-white transition-colors whitespace-nowrap"
          >
            Reset Local Progress
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleResetProgress}
              className="rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-white hover:bg-destructive/90 whitespace-nowrap"
            >
              Confirm Full Reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
