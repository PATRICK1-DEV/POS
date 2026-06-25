import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth-context";

const ODA_ORANGE = "#FF7A00";
const ODA_NAVY = "#0F172A";
const ODA_GRAY = "#64748B";
const ODA_BORDER = "#E5E7EB";

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"sw" | "en">("sw");

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
    <div className="min-h-dvh min-h-screen flex items-center justify-center bg-white px-5 py-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#FF7A00]/[0.03] blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="rounded-[20px] border-2 border-[#FF7A00]/20 bg-white shadow-xl shadow-black/5 px-6 py-6 md:px-8 md:py-7">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-5">
            <div className="w-[60px] h-[60px] rounded-[16px] bg-white shadow-[0_6px_20px_rgba(255,122,0,0.12)] flex items-center justify-center p-3">
              <img src="/logo2.jpeg" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="text-center space-y-0">
              <h1 className="text-[26px] leading-tight" style={{ fontWeight: 800, color: ODA_NAVY, letterSpacing: "-0.3px" }}>
                MANGi APP
              </h1>
              <p className="text-sm" style={{ color: ODA_GRAY }}>Point of Sale</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs" style={{ fontWeight: 600, color: ODA_NAVY }}>
                {lang === "sw" ? "Jina la mtumiaji au barua pepe" : "Username or email"}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={lang === "sw" ? "mfano123" : "e.g. john"}
                required
                style={{
                  width: "100%", height: "48px", padding: "0 14px", borderRadius: "14px",
                  backgroundColor: "#F8FAFC", border: `2px solid ${ODA_BORDER}`,
                  color: ODA_NAVY, fontSize: "14px", outline: "none", transition: "border-color 0.2s",
                }}
                className="focus:!border-[#FF7A00] placeholder:text-[#94A3B8]"
                onFocus={e => e.target.style.borderColor = ODA_ORANGE}
                onBlur={e => e.target.style.borderColor = ODA_BORDER}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs" style={{ fontWeight: 600, color: ODA_NAVY }}>
                {lang === "sw" ? "Nywila" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", height: "48px", padding: "0 40px 0 14px", borderRadius: "14px",
                    backgroundColor: "#F8FAFC", border: `2px solid ${ODA_BORDER}`,
                    color: ODA_NAVY, fontSize: "14px", outline: "none", transition: "border-color 0.2s",
                  }}
                  className="focus:!border-[#FF7A00] placeholder:text-[#94A3B8]"
                  onFocus={e => e.target.style.borderColor = ODA_ORANGE}
                  onBlur={e => e.target.style.borderColor = ODA_BORDER}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: ODA_GRAY }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                <span className="text-xs" style={{ color: "#DC2626" }}>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", height: "50px", borderRadius: "14px",
                background: `linear-gradient(135deg, ${ODA_ORANGE} 0%, #E06600 100%)`,
                color: "#FFFFFF", fontSize: "15px", fontWeight: 600,
                boxShadow: "0 4px 14px rgba(255,122,0,0.2)",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {lang === "sw" ? "Ingia" : "Sign In"}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1" style={{ height: "1px", backgroundColor: ODA_BORDER }} />
              <span className="text-[11px]" style={{ color: ODA_GRAY }}>{lang === "sw" ? "au" : "or"}</span>
              <div className="flex-1" style={{ height: "1px", backgroundColor: ODA_BORDER }} />
            </div>

            <button
              type="button" onClick={signInWithGoogle}
              style={{
                width: "100%", height: "48px", borderRadius: "14px",
                backgroundColor: "#FFFFFF", border: `2px solid ${ODA_BORDER}`,
                color: ODA_NAVY, fontSize: "14px", fontWeight: 600,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ODA_ORANGE; e.currentTarget.style.backgroundColor = "#FFF8F0"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ODA_BORDER; e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
            >
              <svg viewBox="0 0 24 24" width={18} height={18}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {lang === "sw" ? "Ingia kwa Google" : "Continue with Google"}
            </button>

            <div className="text-center pt-0.5">
              <Link to="/register"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "42px", padding: "0 20px", borderRadius: "14px",
                  border: `2px solid ${ODA_ORANGE}`, color: ODA_ORANGE,
                  fontSize: "13px", fontWeight: 600, textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FFF8F0"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {lang === "sw" ? "Sajili akaunti mpya" : "Register new account"}
              </Link>
            </div>
          </form>
        </div>

        <div className="flex justify-center mt-3">
          <button onClick={() => setLang(lang === "sw" ? "en" : "sw")}
            style={{
              padding: "4px 18px", borderRadius: "18px",
              backgroundColor: "#F8FAFC", border: `1px solid ${ODA_BORDER}`,
              color: ODA_GRAY, fontSize: "12px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s", letterSpacing: "1px",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ODA_ORANGE; e.currentTarget.style.color = ODA_ORANGE; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = ODA_BORDER; e.currentTarget.style.color = ODA_GRAY; }}
          >
            {lang === "sw" ? "SW" : "EN"}
          </button>
        </div>
      </div>
    </div>
  );
}
