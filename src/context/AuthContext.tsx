"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  role: "admin" | "customer" | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
});

// Sentinel returned by fetchRole when the request errored (network / RLS blip).
// Distinct from `null`, which means "row exists but role is null / no row".
type RoleResult = "admin" | "customer" | null | "__error__";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isLoading: true,
  });

  // Set during signOut so visibilitychange / onAuthStateChange races don't
  // restore the session before the sign-out completes.
  const signingOutRef = useRef(false);
  // Latest known role — used to preserve admin status across transient
  // profiles fetch failures (network blip, RLS hiccup) instead of nulling it.
  const lastRoleRef = useRef<"admin" | "customer" | null>(null);

  const fetchRole = useCallback(
    async (userId: string): Promise<RoleResult> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) return "__error__";
        if (!data) return null;
        return data.role as "admin" | "customer";
      } catch {
        return "__error__";
      }
    },
    []
  );

  // Apply a fetched role, preserving the previous role on transient errors.
  const applyRole = useCallback(
    (user: User, fetched: RoleResult) => {
      const role =
        fetched === "__error__" ? lastRoleRef.current : fetched;
      lastRoleRef.current = role;
      setState({ user, role, isLoading: false });
    },
    []
  );

  useEffect(() => {
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const role = await fetchRole(session.user.id);
          applyRole(session.user, role);
        } else {
          lastRoleRef.current = null;
          setState({ user: null, role: null, isLoading: false });
        }
      } catch {
        setState({ user: null, role: null, isLoading: false });
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        lastRoleRef.current = null;
        setState({ user: null, role: null, isLoading: false });
      } else if (session?.user) {
        if (signingOutRef.current) return;
        const role = await fetchRole(session.user.id);
        applyRole(session.user, role);
      }
    });

    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;
      if (signingOutRef.current) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const role = await fetchRole(session.user.id);
        applyRole(session.user, role);
      } else {
        lastRoleRef.current = null;
        setState({ user: null, role: null, isLoading: false });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchRole, applyRole]);

  const signOut = useCallback(async () => {
    signingOutRef.current = true;
    try {
      await supabase.auth.signOut();
    } finally {
      lastRoleRef.current = null;
      setState({ user: null, role: null, isLoading: false });
      router.push("/");
      // Release the guard after navigation so subsequent sign-ins are not blocked.
      setTimeout(() => {
        signingOutRef.current = false;
      }, 1500);
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
