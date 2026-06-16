import { useState, useCallback } from "react";
import {
  LayoutGrid, History, BarChart2, Settings, ChevronRight,
  AlertCircle, ShoppingCart, Store, Menu, X
} from "lucide-react";
import { products, categories, findByBarcode } from "./components/pos-data";
import type { Product } from "./components/pos-data";
import { ScannerInput } from "./components/ScannerInput";
import { CartPanel } from "./components/CartPanel";
import type { CartItem } from "./components/CartPanel";
import { CheckoutModal } from "./components/CheckoutModal";

{/* MARKER-MAKE-KIT-INVOKED */}

function formatTZS(n: number) {
  return "TZS " + n.toLocaleString("en-TZ");
}

const NAV_ITEMS = [
  { id: "pos", icon: LayoutGrid, label: "Duka" },
  { id: "history", icon: History, label: "Historia" },
  { id: "reports", icon: BarChart2, label: "Ripoti" },
  { id: "settings", icon: Settings, label: "Mipango" },
];

export default function App() {
  const [activeNav, setActiveNav] = useState("pos");
  const [selectedCat, setSelectedCat] = useState("Zote");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, emoji: product.emoji }];
    });
    showToast(`${product.emoji} ${product.name} imeongezwa`);
  }

  function handleScan(code: string) {
    const found = findByBarcode(code);
    if (found) {
      addToCart(found);
    } else {
      showToast(`Barcode "${code}" haikupatikana`, "err");
    }
  }

  function increment(id: string) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  }

  function decrement(id: string) {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      if (item.qty === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  }

  function remove(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function handleCheckoutComplete() {
    setCart([]);
    setShowCheckout(false);
    showToast("✅ Muamala umekamilika!");
  }

  const filtered = selectedCat === "Zote" ? products : products.filter(p => p.category === selectedCat);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="size-full flex bg-background overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed sm:relative z-40 sm:z-auto
          flex flex-col w-64 sm:w-20 h-full
          bg-sidebar text-sidebar-foreground
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Store size={18} className="text-primary-foreground" />
          </div>
          <div className="sm:hidden">
            <p className="text-sidebar-foreground leading-none" style={{ fontWeight: 700 }}>Duka Yangu</p>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Point of Sale</p>
          </div>
          <button
            className="ml-auto sm:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className={`
                flex items-center gap-3 sm:justify-center px-3 py-3 rounded-xl transition-colors
                ${activeNav === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }
              `}
            >
              <item.icon size={20} />
              <span className="sm:hidden text-sm" style={{ fontWeight: 600 }}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Cashier */}
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 sm:justify-center px-3 py-3 rounded-xl bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 text-sm" style={{ fontWeight: 700, color: "var(--sidebar-primary)" }}>
              AM
            </div>
            <div className="sm:hidden min-w-0">
              <p className="text-sidebar-foreground text-sm truncate" style={{ fontWeight: 600 }}>Amina Mwangi</p>
              <p className="text-xs text-sidebar-foreground/50">Cashier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <button
            className="sm:hidden p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-foreground leading-none" style={{ fontWeight: 700 }}>Uuzaji wa Bidhaa</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Juni 16, 2026 — Duka la Amina, Dar es Salaam</p>
          </div>
          {/* mobile cart button */}
          <button
            className="ml-auto lg:hidden relative p-2.5 rounded-xl bg-primary text-primary-foreground"
            onClick={() => setShowCheckout(cart.length > 0 ? true : false)}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center" style={{ fontWeight: 700 }}>
                {cartCount}
              </span>
            )}
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">

          {/* Products area */}
          <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 py-4 gap-4">

            {/* Scanner */}
            <ScannerInput onScan={handleScan} />

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all
                    ${selectedCat === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }
                  `}
                  style={{ fontWeight: 600 }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
                {filtered.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md active:scale-[0.97] transition-all"
                  >
                    <div className="text-3xl mb-3 leading-none">{product.emoji}</div>
                    <p className="text-sm text-foreground leading-snug mb-1 line-clamp-2" style={{ fontWeight: 600 }}>{product.name}</p>
                    <p className="text-primary" style={{ fontWeight: 700, fontSize: "0.8rem" }}>{formatTZS(product.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">Stoo: {product.stock}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground" style={{ fontWeight: 500 }}>
                        {product.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile checkout bar */}
            {cart.length > 0 && (
              <div className="lg:hidden pb-2">
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-between px-5 shadow-lg"
                  style={{ fontWeight: 700 }}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} />
                    <span>{cartCount} bidhaa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{formatTZS(cartTotal)}</span>
                    <ChevronRight size={18} />
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Cart — desktop */}
          <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 p-4">
            <CartPanel
              items={cart}
              onIncrement={increment}
              onDecrement={decrement}
              onRemove={remove}
              onCheckout={() => setShowCheckout(true)}
              onClear={() => setCart([])}
            />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm
            ${toast.type === "ok" ? "bg-foreground text-background" : "bg-destructive text-destructive-foreground"}
          `}
          style={{ fontWeight: 500 }}
        >
          {toast.type === "err" && <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && cart.length > 0 && (
        <CheckoutModal
          items={cart}
          onClose={() => setShowCheckout(false)}
          onComplete={handleCheckoutComplete}
        />
      )}
    </div>
  );
}
