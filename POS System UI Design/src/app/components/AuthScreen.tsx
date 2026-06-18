import { useState } from "react";
import { Store, User, Lock, UserPlus, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { login, register } from "./auth";
import type { Session } from "./auth";

interface Props {
  onAuthenticated: (session: Session) => void;
}

type Mode = "login" | "register";

export function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const session = mode === "login"
        ? await login(username, password)
        : await register(name, username, password);
      onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hitilafu imetokea.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="size-full flex items-center justify-center bg-background px-4" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <Store size={26} className="text-primary-foreground" />
          </div>
          <h1 className="text-foreground" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Duka Yangu</h1>
          <p className="text-sm text-muted-foreground">{mode === "login" ? "Ingia kwenye akaunti yako" : "Fungua akaunti mpya"}</p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-secondary mb-5">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 rounded-lg text-sm transition-colors ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            style={{ fontWeight: 600 }}
          >
            Ingia
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 rounded-lg text-sm transition-colors ${mode === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            style={{ fontWeight: 600 }}
          >
            Jisajili
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <Field icon={User} placeholder="Jina kamili" value={name} onChange={setName} autoComplete="name" />
          )}
          <Field icon={User} placeholder="Jina la mtumiaji" value={username} onChange={setUsername} autoComplete="username" />
          <Field icon={Lock} placeholder="Nenosiri" value={password} onChange={setPassword} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
            style={{ fontWeight: 700 }}
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : (mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />)}
            {mode === "login" ? "Ingia" : "Jisajili"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-5">
          {mode === "login" ? "Huna akaunti? " : "Una akaunti tayari? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="text-primary"
            style={{ fontWeight: 600 }}
          >
            {mode === "login" ? "Jisajili hapa" : "Ingia hapa"}
          </button>
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  icon: typeof User;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}

function Field({ icon: Icon, placeholder, value, onChange, type = "text", autoComplete }: FieldProps) {
  return (
    <div className="flex items-center gap-2 px-3 rounded-xl bg-card border border-border focus-within:border-primary/50 transition-colors">
      <Icon size={17} className="text-muted-foreground flex-shrink-0" />
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
