import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Phone, User } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Weka jina la mtumiaji");
      return;
    }
    if (!phone.trim()) {
      setError("Weka namba ya simu");
      return;
    }
    if (password !== confirm) {
      setError("Nywila hazilingani");
      return;
    }
    if (password.length < 6) {
      setError("Nywila lazima iwe angalau herufi 6");
      return;
    }

    setLoading(true);
    const err = await signUp(username.trim(), phone.trim(), password);
    setLoading(false);
    if (err) {
      if (err.toLowerCase().includes("rate limit")) {
        setError("Umejaribu mara nyingi sana. Subiri dakika chache kisha ujaribu tena.");
      } else {
        setError(err);
      }
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    }
  }

  if (success) {
    return (
      <div className="size-full flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} className="text-accent" />
          </div>
          <h2 className="text-foreground text-lg" style={{ fontWeight: 700 }}>Akaunti Imeundwa!</h2>
          <p className="text-muted-foreground text-sm">
            Angalia barua pepe yako ili kuthibitisha akaunti yako.
          </p>
          <p className="text-xs text-muted-foreground">Utaelekezwa kwenye ukurasa wa kuingia...</p>
        </div>
      </div>
    );
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
            <p className="text-muted-foreground text-sm mt-1">Unda akaunti mpya</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border/60 shadow-xl shadow-black/5 rounded-2xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm text-foreground" style={{ fontWeight: 600 }}>
              Jina la mtumiaji
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
              Namba ya simu
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+255 7XX XXX XXX"
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
                placeholder="Angalau herufi 6"
                required
                minLength={6}
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

          <div className="space-y-1.5">
            <label className="block text-sm text-foreground" style={{ fontWeight: 600 }}>
              Rudia nywila
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Andika nywila tena"
              required
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary/40 text-foreground placeholder:text-muted-foreground text-sm transition-all"
            />
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
            Sajili
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Una akaunti tayari?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Ingia
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
