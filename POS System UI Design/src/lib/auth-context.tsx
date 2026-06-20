import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";
import { getEmailByUsername, getProfile } from "./db";

interface ProfileData {
  id: string;
  user_id: string;
  username: string | null;
  phone: string | null;
  email: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (usernameOrEmail: string, password: string) => Promise<string | null>;
  signUp: (username: string, phone: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(u: User | null) {
    if (!u) {
      setProfile(null);
      return;
    }
    const p = await getProfile(u.id);
    setProfile(p);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      return loadProfile(u);
    }).finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      loadProfile(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(usernameOrEmail: string, password: string) {
    const email = usernameOrEmail.includes("@")
      ? usernameOrEmail
      : await getEmailByUsername(usernameOrEmail);

    if (!email) return "Jina la mtumiaji halipo";

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message ?? null;
  }

  async function signUp(username: string, phone: string, password: string) {
    const phoneClean = phone.replace(/\D/g, "");
    const email = `${username}_${phoneClean}@duka.app`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, phone },
      },
    });
    return error?.message ?? null;
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (user) await loadProfile(user);
  }

  const isAdmin = profile?.role === "admin" || user?.email === "kasembepatrick100@gmail.com";

  return (
    <AuthContext.Provider
      value={{
        user, profile, isAdmin, loading,
        signIn, signUp, signInWithGoogle, signOut, refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
