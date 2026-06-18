export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  barcode: string;
  stock: number;
  emoji: string;
}

export const products: Product[] = [
  { id: "p001", name: "Unga wa Mahindi 2kg", price: 3500, category: "Chakula", barcode: "6001234500001", stock: 48, emoji: "🌽" },
  { id: "p002", name: "Mchele Basmati 1kg", price: 4200, category: "Chakula", barcode: "6001234500002", stock: 32, emoji: "🍚" },
  { id: "p003", name: "Mafuta ya Kupikia 1L", price: 6800, category: "Chakula", barcode: "6001234500003", stock: 24, emoji: "🫙" },
  { id: "p004", name: "Sukari 1kg", price: 2800, category: "Chakula", barcode: "6001234500004", stock: 60, emoji: "🍬" },
  { id: "p005", name: "Chumvi 500g", price: 800, category: "Chakula", barcode: "6001234500005", stock: 80, emoji: "🧂" },
  { id: "p006", name: "Sabuni ya Unga 500g", price: 2200, category: "Usafi", barcode: "6001234500006", stock: 36, emoji: "🧼" },
  { id: "p007", name: "Dettol 250ml", price: 4500, category: "Usafi", barcode: "6001234500007", stock: 18, emoji: "🧴" },
  { id: "p008", name: "Colgate Toothpaste", price: 2500, category: "Usafi", barcode: "6001234500008", stock: 22, emoji: "🪥" },
  { id: "p009", name: "Pepsi 500ml", price: 1200, category: "Vinywaji", barcode: "6001234500009", stock: 72, emoji: "🥤" },
  { id: "p010", name: "Maji ya Kunywa 1.5L", price: 1000, category: "Vinywaji", barcode: "6001234500010", stock: 90, emoji: "💧" },
  { id: "p011", name: "Chai Ketepa 50g", price: 1800, category: "Vinywaji", barcode: "6001234500011", stock: 45, emoji: "🍵" },
  { id: "p012", name: "Simu Charger Cable", price: 8500, category: "Elektroniki", barcode: "6001234500012", stock: 15, emoji: "🔌" },
  { id: "p013", name: "Betri AA 4pcs", price: 3200, category: "Elektroniki", barcode: "6001234500013", stock: 28, emoji: "🔋" },
  { id: "p014", name: "Kalamu Bluu 10pcs", price: 1500, category: "Shule", barcode: "6001234500014", stock: 55, emoji: "✏️" },
  { id: "p015", name: "Daftari A4 80 pages", price: 2000, category: "Shule", barcode: "6001234500015", stock: 40, emoji: "📓" },
  { id: "p016", name: "Biscuit Marie 200g", price: 1600, category: "Chakula", barcode: "6001234500016", stock: 66, emoji: "🍪" },
];

export const categories = ["Zote", "Chakula", "Usafi", "Vinywaji", "Elektroniki", "Shule"];

export function findByBarcode(code: string): Product | undefined {
  return products.find(p => p.barcode === code || p.id === code);
}

export const VAT_RATE = 0.18;

export function formatTZS(amount: number): string {
  return "TZS " + amount.toLocaleString("en-TZ");
}

export interface Totals {
  subtotal: number;
  tax: number;
  total: number;
}

export function computeTotals(items: { price: number; qty: number }[]): Totals {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * VAT_RATE);
  return { subtotal, tax, total: subtotal + tax };
}

export interface SaleLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}

export interface Sale {
  id: string;
  at: number;
  items: SaleLine[];
  subtotal: number;
  tax: number;
  total: number;
  method: string;
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Pesa Taslimu",
  mpesa: "M-Pesa",
  tigopesa: "Tigo Pesa",
  card: "Kadi ya Benki",
};
