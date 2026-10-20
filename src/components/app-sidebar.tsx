import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  Settings,
} from "lucide-react";

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

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, exact: true },
  { title: "Learn Python", url: "/learn", icon: BookOpen },
  { title: "Code Lab", url: "/practice", icon: Code2 },
  { title: "Quizzes", url: "/quizzes", icon: ClipboardCheck },
  { title: "AI Tutor", url: "/tutor", icon: Sparkles },
  { title: "Progress", url: "/progress", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string, exact?: boolean) =>
    exact ? currentPath === path : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <img
            src="/favicon.png"
            alt="NaomiLearn logo"
            className="h-8 w-8 shrink-0 rounded-lg"
          />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">NaomiLearn</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                Python &amp; AI Academy
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup defaultOpen>
          <SidebarGroupLabel>Academy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url, item.exact)}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
            Learn Python. Master AI.
            <br />
            Build Your Future.
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
