import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";
import { hydrateFromSupabaseSession, saveName } from "./tutor";

const OAUTH_REDIRECT_STORAGE_KEY = "naomilearn_oauth_redirect";

export function consumePendingOAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(OAUTH_REDIRECT_STORAGE_KEY);
    if (saved) {
      window.localStorage.removeItem(OAUTH_REDIRECT_STORAGE_KEY);
      if (saved.startsWith("/") && !saved.startsWith("//")) {
        return saved;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  isAuthenticated: boolean;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const notifyOpenerIfPopup = (activeSession: Session | null) => {
      if (!activeSession || typeof window === "undefined") return;
      if (window.opener && window.opener !== window) {
        try {
          window.opener.postMessage({ type: "NAOMILEARN_OAUTH_SUCCESS" }, "*");
          window.close();
        } catch {
          // Ignore cross-origin opener errors
        }
      }
    };

    const refreshSession = () => {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (!mounted) return;
          const activeSession = data.session ?? null;
          setSession(activeSession);
          setUser(activeSession?.user ?? null);
          setLoading(false);
          if (activeSession?.user) {
            void hydrateFromSupabaseSession(activeSession.user);
            notifyOpenerIfPopup(activeSession);
          }
        })
        .catch(() => {
          if (!mounted) return;
          setLoading(false);
        });
    };

    refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      if (nextSession?.user) {
        void hydrateFromSupabaseSession(nextSession.user);
        notifyOpenerIfPopup(nextSession);
      }
    });

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        typeof event.data === "object" &&
        (event.data as { type?: string }).type === "NAOMILEARN_OAUTH_SUCCESS"
      ) {
        refreshSession();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key.includes("auth-token")) {
        refreshSession();
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const signInWithGoogle = useCallback(
    async (redirectPath = "/dashboard"): Promise<{ error: string | null }> => {
      if (!isSupabaseConfigured) {
        return {
          error:
            "Google Sign-In requires Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) to be configured.",
        };
      }

      try {
        const safePath =
          redirectPath.startsWith("/") && !redirectPath.startsWith("//")
            ? redirectPath
            : "/dashboard";

        try {
          window.localStorage.setItem(OAUTH_REDIRECT_STORAGE_KEY, safePath);
        } catch {
          // Ignore localStorage write errors
        }

        const redirectTo = `${window.location.origin}${safePath}`;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            queryParams: {
              prompt: "select_account",
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        if (!data?.url) {
          return {
            error: "Supabase did not return a Google OAuth authorization URL.",
          };
        }

        // Google OAuth serves X-Frame-Options: DENY and blocks embedded iframe flows.
        // When running inside an iframe (such as the AI Studio preview), open Google's
        // authorization flow in a top-level popup window, falling back to full-page navigation.
        const isEmbeddedIframe = (() => {
          try {
            return window.self !== window.top;
          } catch {
            return true;
          }
        })();

        if (isEmbeddedIframe) {
          const popup = window.open(
            data.url,
            "naomilearn_google_oauth",
            "width=540,height=680,menubar=no,toolbar=no,location=yes,status=no",
          );
          if (popup) {
            popup.focus();
            return { error: null };
          }
        }

        window.location.assign(data.url);
        return { error: null };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "Unable to initiate Google Sign-In. Verify your Supabase Google OAuth configuration.",
        };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "";
    const meta = user.user_metadata ?? {};
    const nameFromMeta =
      typeof meta["full_name"] === "string"
        ? meta["full_name"]
        : typeof meta["name"] === "string"
          ? meta["name"]
          : "";
    if (nameFromMeta) {
      saveName(nameFromMeta);
      return nameFromMeta;
    }
    return user.email ? (user.email.split("@")[0] ?? "Student") : "Student";
  }, [user]);

  const avatarUrl = useMemo(() => {
    if (!user) return null;
    const meta = user.user_metadata ?? {};
    if (typeof meta["avatar_url"] === "string" && meta["avatar_url"]) {
      return meta["avatar_url"];
    }
    if (typeof meta["picture"] === "string" && meta["picture"]) {
      return meta["picture"];
    }
    return null;
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      isAuthenticated: Boolean(session && user),
      displayName,
      avatarUrl,
      email: user?.email ?? null,
      signInWithGoogle,
      signOut,
    }),
    [session, user, loading, displayName, avatarUrl, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      session: null,
      user: null,
      loading: false,
      isConfigured: isSupabaseConfigured,
      isAuthenticated: false,
      displayName: "",
      avatarUrl: null,
      email: null,
      signInWithGoogle: async () => ({
        error: "AuthProvider is not mounted.",
      }),
      signOut: async () => {},
    };
  }
  return ctx;
}
