import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  Target,
  GraduationCap,
} from "lucide-react";

import { NaomiLearnLogo } from "@/components/naomilearn-logo";
import { CURRICULUM_LESSONS } from "@/lib/curriculum";
import { useAuth } from "@/lib/auth";
import { loadCompletedLessons, getStreak, getTodayCount, loadDailyGoal } from "@/lib/tutor";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export interface LearningItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string;
  isAi?: boolean;
}

export const learningItems: LearningItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Learn Python", url: "/learn", icon: BookOpen },
  { title: "Code Lab", url: "/practice", icon: Code2 },
  { title: "Quizzes", url: "/quizzes", icon: ClipboardCheck },
  { title: "AI Tutor", url: "/tutor", icon: Sparkles, badge: "Gemini", isAi: true },
];

const accountItems = [
  { title: "Progress & Analytics", url: "/progress", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });
  const { displayName, email, avatarUrl, isAuthenticated, signOut } = useAuth();

  const [completedCount, setCompletedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setCompletedCount(loadCompletedLessons().length);
      setStreak(getStreak());
      setTodayCount(getTodayCount());
      setDailyGoal(loadDailyGoal());
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [currentPath]);

  const totalModules = CURRICULUM_LESSONS.length;
  const pct = Math.min(100, Math.round((completedCount / totalModules) * 100));

  const isActive = (path: string, exact?: boolean) =>
    exact ? currentPath === path : currentPath.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    await navigate({ to: "/" });
  };

  const studentName = displayName || (email ? email.split("@")[0] : "Student");
  const monogram = (studentName || "S")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* 1. Premium Brand Header */}
      <SidebarHeader className="border-b border-sidebar-border/80 px-3.5 py-3.5">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className={cn(
            "group flex items-center rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary",
            collapsed ? "justify-center p-1" : "gap-3 px-1.5 py-1 hover:bg-sidebar-accent/50",
          )}
          aria-label={isAuthenticated ? "Open Dashboard" : "NaomiLearn AI Academy Home"}
        >
          <NaomiLearnLogo size="sm" showWordmark={!collapsed} />
        </Link>
      </SidebarHeader>

      {/* 2. Navigation Sections */}
      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Workspace Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2.5 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/80">
            Academy Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="space-y-1">
              {learningItems.map((item) => {
                const active = isActive(item.url, item.exact);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Link
                        to={item.url}
                        title={item.title}
                        className="flex w-full items-center gap-3 whitespace-nowrap"
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active
                              ? "text-primary"
                              : item.isAi
                                ? "text-amber-500 group-hover:text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && !collapsed && (
                          <span
                            className={cn(
                              "ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-tight uppercase border transition-colors",
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:border-amber-500/40",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Insights & Preferences */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2.5 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/80">
            Insights &amp; Preferences
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="space-y-1">
              {accountItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Link
                        to={item.url}
                        title={item.title}
                        className="flex w-full items-center gap-3 whitespace-nowrap"
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        <span className="truncate flex-1">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Sidebar Footer: Progress Card & Student Profile */}
      <SidebarFooter className="border-t border-sidebar-border/80 p-3">
        {!collapsed ? (
          <div className="space-y-2.5">
            {/* SaaS-Quality Course Progress Card */}
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span>Curriculum</span>
                </span>
                <span className="font-mono text-xs font-bold text-primary tabular-nums">
                  {pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Module Count & Status */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  <strong className="font-mono text-foreground">{completedCount}</strong> of{" "}
                  {totalModules} modules
                </span>
                {completedCount >= totalModules ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Mastered
                  </span>
                ) : (
                  <span>{totalModules - completedCount} left</span>
                )}
              </div>

              {/* Streak and Daily Activity Indicators */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-sidebar-border text-[11px]">
                <div
                  className="flex items-center gap-1 text-foreground"
                  title={`${streak} day study streak`}
                >
                  <Flame
                    className={cn(
                      "h-3.5 w-3.5",
                      streak > 0 ? "text-amber-500 fill-amber-500/20" : "text-muted-foreground",
                    )}
                  />
                  <span className="font-mono font-semibold tabular-nums">{streak}d</span>
                  <span className="text-muted-foreground text-[10px]">streak</span>
                </div>
                <div
                  className="flex items-center gap-1 font-mono tabular-nums text-foreground"
                  title={`${todayCount} of ${dailyGoal} lessons completed today`}
                >
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold">
                    {todayCount}/{dailyGoal}
                  </span>
                  <span className="text-muted-foreground text-[10px]">today</span>
                </div>
              </div>
            </div>

            {/* Signed-In Student Profile Block */}
            <div className="flex items-center justify-between gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar or Monogram */}
                {avatarUrl && !imgError ? (
                  <img
                    src={avatarUrl}
                    alt={studentName}
                    onError={() => setImgError(true)}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-border shrink-0"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20"
                    aria-hidden="true"
                  >
                    {monogram}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-xs font-bold text-foreground leading-tight"
                    title={studentName}
                  >
                    {studentName}
                  </div>
                  {email && (
                    <div
                      className="truncate text-[10.5px] text-muted-foreground leading-tight mt-0.5"
                      title={email}
                    >
                      {email}
                    </div>
                  )}
                </div>
              </div>

              {/* Accessible Sign-Out Control */}
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out of NaomiLearn"
                aria-label="Sign out of NaomiLearn"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            {/* Collapsed Avatar/Monogram */}
            {avatarUrl && !imgError ? (
              <img
                src={avatarUrl}
                alt={studentName}
                onError={() => setImgError(true)}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                title={studentName}
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20"
                title={studentName}
              >
                {monogram}
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
