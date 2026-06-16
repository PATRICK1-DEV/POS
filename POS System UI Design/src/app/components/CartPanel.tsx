import { Trash2, Plus, Minus, ShoppingBag, Receipt } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}

interface Props {
  items: CartItem[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onClear: () => void;
}

function formatTZS(amount: number) {
  return "TZS " + amount.toLocaleString("en-TZ");
}

export function CartPanel({ items, onIncrement, onDecrement, onRemove, onCheckout, onClear }: Props) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-primary" />
          <span className="text-foreground" style={{ fontWeight: 600 }}>Kikapu</span>
          {count > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
              {count}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Futa Zote
          </button>
        )}
      </div>

      {/* items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "none" }}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-12">
            <ShoppingBag size={40} strokeWidth={1.2} />
            <p className="text-sm text-center">Kikapu ni tupu.<br />Scan bidhaa kuanza.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
              <span className="text-2xl leading-none">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate text-foreground" style={{ fontWeight: 500 }}>{item.name}</p>
                <p className="text-xs text-primary" style={{ fontWeight: 600 }}>{formatTZS(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDecrement(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted hover:bg-border transition-colors text-foreground"
                >
                  <Minus size={12} />
                </button>
                <span className="w-7 text-center text-sm text-foreground" style={{ fontWeight: 600 }}>{item.qty}</span>
                <button
                  onClick={() => onIncrement(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Plus size={12} />
                </button>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* totals */}
      {items.length > 0 && (
        <div className="px-4 py-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Jumla ndogo</span>
            <span>{formatTZS(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>VAT (18%)</span>
            <span>{formatTZS(tax)}</span>
          </div>
          <div className="flex justify-between text-foreground border-t border-border pt-2" style={{ fontWeight: 700 }}>
            <span>JUMLA KUU</span>
            <span className="text-primary">{formatTZS(total)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full mt-3 py-3.5 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ fontWeight: 700 }}
          >
            <Receipt size={18} />
            Malipo — {formatTZS(total)}
          </button>
        </div>
      )}
    </div>
  );
}
