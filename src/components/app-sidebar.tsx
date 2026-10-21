import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home,
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
  UserCheck,
} from "lucide-react";

import { NaomiLearnLogo } from "@/components/naomilearn-logo";
import { CURRICULUM_LESSONS } from "@/lib/curriculum";
import { useAuth } from "@/lib/auth";
import { loadCompletedLessons, getStreak, getTodayCount, loadDailyGoal } from "@/lib/tutor";
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

const learningItems = [
  { title: "Home", url: "/", icon: Home, exact: true },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Learn Python", url: "/learn", icon: BookOpen },
  { title: "Code Lab", url: "/practice", icon: Code2 },
  { title: "Quizzes", url: "/quizzes", icon: ClipboardCheck },
  { title: "AI Tutor", url: "/tutor", icon: Sparkles },
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
  const { displayName, email, signOut } = useAuth();

  const [completedCount, setCompletedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5);

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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2.5">
          <NaomiLearnLogo size="sm" showWordmark={!collapsed} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Academy Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learningItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <Link
                      to={item.url}
                      title={item.title}
                      className="flex items-center gap-2.5 whitespace-nowrap"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insights &amp; Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link
                      to={item.url}
                      title={item.title}
                      className="flex items-center gap-2.5 whitespace-nowrap"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="space-y-2.5">
            <div className="rounded-xl border border-border bg-card p-3 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-foreground">Course Progress</span>
                <span className="font-mono text-primary tabular-nums">
                  {completedCount}/{totalModules} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Flame className="h-3 w-3 text-gold" />
                  <span className="font-mono tabular-nums">{streak}d</span> streak
                </span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Target className="h-3 w-3 text-primary" />
                  {todayCount}/{dailyGoal} today
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
                  <UserCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">{displayName || "Google Student"}</span>
                </div>
                {email && <div className="truncate text-[11px] text-muted-foreground">{email}</div>}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                aria-label="Sign Out"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            aria-label="Sign Out"
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
