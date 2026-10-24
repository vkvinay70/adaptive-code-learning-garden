import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useNavigate,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Code2, Loader2, Lock, Sparkles } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { FloatingAiAssistant } from "@/components/floating-ai-assistant";
import { NaomiLearnLogo } from "@/components/naomilearn-logo";
import { AuthProvider, consumePendingOAuthRedirect, useAuth } from "@/lib/auth";
import { addStudyMinutes } from "@/lib/tutor";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
        <div className="font-mono text-5xl font-bold text-primary tabular-nums">404</div>
        <h1 className="mt-3 text-xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent whitespace-nowrap"
          >
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 whitespace-nowrap"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          This page didn&apos;t load cleanly
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something unexpected occurred. You can retry loading this view or head back to the
          homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent whitespace-nowrap"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary whitespace-nowrap"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NaomiLearn — Python & AI Academy" },
      {
        name: "description",
        content:
          "NaomiLearn — Python & AI Academy. Learn Python. Build your future. Interactive Python lessons, in-browser Code Lab, adaptive quizzes, and your personal AI Tutor.",
      },
      { property: "og:title", content: "NaomiLearn — Python & AI Academy" },
      {
        property: "og:description",
        content: "Learn Python. Build your future. Learn Python with your personal AI tutor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const STANDALONE_PATHS = new Set(["/", "/login", "/signup", "/reset-password"]);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/learn",
  "/practice",
  "/quizzes",
  "/tutor",
  "/progress",
  "/settings",
];

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Student Dashboard",
  "/learn": "Learn Python Curriculum",
  "/practice": "Interactive Python Code Lab",
  "/quizzes": "Adaptive Topic Quizzes",
  "/tutor": "Personal AI Tutor Agent",
  "/progress": "Learning Analytics & Progress",
  "/settings": "Account & Learning Settings",
};

function ProtectedWorkspaceShell({ normalizedPath }: { normalizedPath: string }) {
  const navigate = useNavigate();
  const locationHref = useRouterState({
    select: (state) => `${state.location.pathname}${state.location.searchStr ?? ""}`,
  });
  const { isAuthenticated, loading } = useAuth();

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

  useEffect(() => {
    if (!isProtected || loading) return;
    if (!isAuthenticated) {
      void navigate({
        to: "/login",
        search: { redirect: locationHref || normalizedPath },
        replace: true,
      });
    }
  }, [isProtected, loading, isAuthenticated, locationHref, normalizedPath, navigate]);

  // Track real active study minutes while authenticated student is engaged in workspace pages
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        addStudyMinutes(1);
      }
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated]);

  if (isProtected && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-semibold text-foreground shadow-xs">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Verifying your Google student session…</span>
        </div>
      </div>
    );
  }

  if (isProtected && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero-python px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
          <div className="flex justify-center">
            <NaomiLearnLogo size="md" />
          </div>
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">Authentication Required</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your Google account to access NaomiLearn lessons, the Code Lab, quizzes,
            and your personal AI Tutor.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              search={{ redirect: normalizedPath }}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent"
            >
              Get Started with Google
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentSectionLabel = ROUTE_LABELS[normalizedPath] ?? "Workspace";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 sm:px-6 backdrop-blur">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger aria-label="Toggle navigation sidebar" />
              <div className="flex items-center gap-2 text-sm min-w-0">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/"}
                  className="inline-flex items-center shrink-0 md:hidden"
                  aria-label={isAuthenticated ? "Open Dashboard" : "NaomiLearn AI Academy"}
                >
                  <NaomiLearnLogo size="sm" />
                </Link>
                <Link
                  to={isAuthenticated ? "/dashboard" : "/"}
                  className="hidden md:inline font-semibold text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap shrink-0"
                >
                  NaomiLearn AI Academy
                </Link>
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
                <span className="font-bold text-foreground truncate">{currentSectionLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {normalizedPath !== "/practice" && (
                <Link
                  to="/practice"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/70 px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary whitespace-nowrap shrink-0"
                >
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  Code Lab
                </Link>
              )}
              {normalizedPath !== "/tutor" && (
                <Link
                  to="/tutor"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent whitespace-nowrap shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask AI Tutor
                </Link>
              )}
            </div>
          </header>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function PostOAuthRedirectHandler({ normalizedPath }: { normalizedPath: string }) {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    const pendingDestination = consumePendingOAuthRedirect();
    const target = pendingDestination || (normalizedPath === "/" ? "/dashboard" : null);
    if (target && target !== normalizedPath) {
      void navigate({ to: target, replace: true });
    }
  }, [loading, isAuthenticated, normalizedPath, navigate]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const isStandalone = STANDALONE_PATHS.has(normalizedPath);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PostOAuthRedirectHandler normalizedPath={normalizedPath} />
        {isStandalone ? (
          <div className="min-h-screen w-full bg-background text-foreground">
            <Outlet />
          </div>
        ) : (
          <ProtectedWorkspaceShell normalizedPath={normalizedPath} />
        )}
        <FloatingAiAssistant />
      </AuthProvider>
    </QueryClientProvider>
  );
}
