import { BarChart2, ShoppingCart, Coins, Receipt, AlertTriangle } from "lucide-react";
import { formatTZS } from "./pos-data";
import type { Sale, Product } from "./pos-data";

interface Props {
  sales: Sale[];
  products: Product[];
}

const LOW_STOCK_THRESHOLD = 20;

export function ReportsView({ sales, products }: Props) {
  const revenue = sales.reduce((s, sale) => s + sale.total, 0);
  const tax = sales.reduce((s, sale) => s + sale.tax, 0);
  const itemsSold = sales.reduce((s, sale) => s + sale.items.reduce((n, i) => n + i.qty, 0), 0);

  const soldByProduct = new Map<string, { name: string; emoji: string; qty: number; revenue: number }>();
  for (const sale of sales) {
    for (const line of sale.items) {
      const prev = soldByProduct.get(line.id);
      soldByProduct.set(line.id, {
        name: line.name,
        emoji: line.emoji,
        qty: (prev?.qty ?? 0) + line.qty,
        revenue: (prev?.revenue ?? 0) + line.price * line.qty,
      });
    }
  }
  const topProducts = [...soldByProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const lowStock = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD).sort((a, b) => a.stock - b.stock);

  const stats = [
    { label: "Mauzo", value: String(sales.length), icon: Receipt },
    { label: "Bidhaa Zilizouzwa", value: String(itemsSold), icon: ShoppingCart },
    { label: "Mapato", value: formatTZS(revenue), icon: Coins },
    { label: "VAT Iliyokusanywa", value: formatTZS(tax), icon: BarChart2 },
  ];

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="space-y-4 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(stat => (
            <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border">
              <stat.icon size={18} className="text-primary mb-2" />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-foreground mt-0.5" style={{ fontWeight: 700 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-foreground mb-3" style={{ fontWeight: 600 }}>Bidhaa Zinazouzwa Zaidi</p>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Hakuna mauzo bado.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map(p => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{p.emoji} {p.name}</span>
                  <span className="text-muted-foreground">×{p.qty} · {formatTZS(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-accent" />
            <p className="text-foreground" style={{ fontWeight: 600 }}>Stoo Inayopungua (≤ {LOW_STOCK_THRESHOLD})</p>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Stoo zote ziko sawa.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{p.emoji} {p.name}</span>
                  <span className="text-destructive" style={{ fontWeight: 600 }}>Stoo: {p.stock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
