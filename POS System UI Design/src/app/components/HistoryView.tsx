import { History, Receipt } from "lucide-react";
import { formatTZS, PAYMENT_LABELS } from "./pos-data";
import type { Sale } from "./pos-data";

interface Props {
  sales: Sale[];
}

function formatTime(at: number): string {
  return new Date(at).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryView({ sales }: Props) {
  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-12">
        <History size={40} strokeWidth={1.2} />
        <p className="text-sm text-center">Hakuna manunuzi bado.<br />Muamala ukikamilika utaonekana hapa.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="space-y-3 pb-4">
        {sales.map(sale => (
          <div key={sale.id} className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-primary" />
                <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{formatTime(sale.at)}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground" style={{ fontWeight: 500 }}>
                {PAYMENT_LABELS[sale.method] ?? sale.method}
              </span>
            </div>
            <div className="space-y-1">
              {sale.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                  <span>{item.emoji} {item.name} ×{item.qty}</span>
                  <span>{formatTZS(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-border pt-2 mt-2 text-foreground" style={{ fontWeight: 700 }}>
              <span>Jumla Kuu</span>
              <span className="text-primary">{formatTZS(sale.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
