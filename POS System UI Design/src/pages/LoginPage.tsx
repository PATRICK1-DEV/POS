import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, AlertCircle, Loader2, User } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signIn(username, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="size-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 flex items-center justify-center p-3">
            <img src="/logo2.jpeg" alt="" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div className="text-center">
            <h1 className="text-foreground text-2xl tracking-tight" style={{ fontWeight: 800 }}>MANGi APP</h1>
            <p className="text-muted-foreground text-sm mt-1">Point of Sale</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border/60 shadow-xl shadow-black/5 rounded-2xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm text-foreground" style={{ fontWeight: 600 }}>
              Jina la mtumiaji au barua pepe
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="mfano123"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/40 text-foreground placeholder:text-muted-foreground text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm text-foreground" style={{ fontWeight: 600 }}>
              Nywila
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/40 text-foreground placeholder:text-muted-foreground text-sm pr-10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            style={{ fontWeight: 700 }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Ingia
          </button>

          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">au</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-3 rounded-xl bg-card border border-border text-foreground hover:bg-muted/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-sm"
            style={{ fontWeight: 600 }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Ingia kwa Google
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Huna akaunti?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sajili
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
