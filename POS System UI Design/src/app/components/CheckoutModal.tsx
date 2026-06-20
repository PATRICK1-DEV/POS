import { useState } from "react";
import { X, Banknote, Smartphone, CreditCard, CheckCircle2 } from "lucide-react";
import { CartItem } from "./CartPanel";

interface Props {
  items: CartItem[];
  onClose: () => void;
  onComplete: () => void;
}

function formatTZS(n: number) {
  return "TZS " + n.toLocaleString("en-TZ");
}

const PAYMENT_METHODS = [
  { id: "cash", label: "Pesa Taslimu", icon: Banknote, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "mpesa", label: "M-Pesa", icon: Smartphone, color: "bg-green-50 text-green-700 border-green-200" },
  { id: "tigopesa", label: "Tigo Pesa", icon: Smartphone, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "card", label: "Kadi ya Benki", icon: CreditCard, color: "bg-purple-50 text-purple-700 border-purple-200" },
];

export function CheckoutModal({ items, onClose, onComplete }: Props) {
  const [method, setMethod] = useState("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [done, setDone] = useState(false);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const change = method === "cash" && cashGiven ? Math.max(0, Number(cashGiven) - total) : 0;

  function handlePay() {
    setDone(true);
    setTimeout(() => {
      onComplete();
    }, 2200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {done ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center">
              <CheckCircle2 size={44} className="text-accent" />
            </div>
            <h2 className="text-foreground" style={{ fontWeight: 700 }}>Malipo Yamefanikiwa!</h2>
            <p className="text-muted-foreground text-sm">Asante kwa kununua. Karibuni tena!</p>
            <p className="text-primary" style={{ fontWeight: 700 }}>{formatTZS(total)}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-foreground" style={{ fontWeight: 700 }}>Malipo</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* order summary */}
              <div className="bg-secondary/60 rounded-xl p-4 space-y-1.5">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.emoji} {item.name} ×{item.qty}</span>
                    <span className="text-foreground" style={{ fontWeight: 500 }}>{formatTZS(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="text-foreground" style={{ fontWeight: 700 }}>Jumla Kuu</span>
                  <span className="text-primary" style={{ fontWeight: 700 }}>{formatTZS(total)}</span>
                </div>
              </div>

              {/* payment method */}
              <div>
                <p className="text-sm text-muted-foreground mb-3" style={{ fontWeight: 500 }}>Njia ya Malipo</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setMethod(pm.id)}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 transition-all ${
                        method === pm.id
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <pm.icon size={16} />
                      <span className="text-sm" style={{ fontWeight: 600 }}>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* cash tendered */}
              {method === "cash" && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>Pesa Aliyolipa</label>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={e => setCashGiven(e.target.value)}
                    placeholder={`Angalau ${total.toLocaleString()}`}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                  {cashGiven && Number(cashGiven) >= total && (
                    <div className="flex justify-between px-3 py-2.5 rounded-xl bg-accent/10 text-accent text-sm" style={{ fontWeight: 600 }}>
                      <span>Chenji:</span>
                      <span>{formatTZS(change)}</span>
                    </div>
                  )}
                  {cashGiven && Number(cashGiven) < total && (
                    <p className="text-destructive text-xs px-1">Pesa haitoshi — inabidi TZS {formatTZS(total - Number(cashGiven))} zaidi.</p>
                  )}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={method === "cash" && cashGiven !== "" && Number(cashGiven) < total}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontWeight: 700 }}
              >
                Kamilisha Malipo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
