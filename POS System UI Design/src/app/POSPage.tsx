import { useState, useEffect, useCallback } from "react";
import {
  LayoutGrid, History, BarChart2, Settings, ChevronRight,
  AlertCircle, ShoppingCart, Menu, X, Package, Loader2, Shield
} from "lucide-react";
import { useNavigate } from "react-router";
import { products as fallbackProducts, categories as fallbackCategories } from "./components/pos-data";
import { SearchInput } from "./components/ScannerInput";
import { CartPanel } from "./components/CartPanel";
import type { CartItem } from "./components/CartPanel";
import { CheckoutModal } from "./components/CheckoutModal";
import { useAuth } from "../lib/auth-context";
import {
  getUserShop,
  getShopProducts,
  createOrder,
  createShop,
  getShopOrders,
  getOrdersByDateRange,
} from "../lib/db";

function formatTZS(n: number) {
  return "TZS " + n.toLocaleString("en-TZ");
}

const NAV_ITEMS = [
  { id: "pos", icon: LayoutGrid, label: "Duka" },
  { id: "history", icon: History, label: "Historia" },
  { id: "reports", icon: BarChart2, label: "Ripoti" },
  { id: "settings", icon: Settings, label: "Mipango" },
];

interface ShopProductItem {
  product_id: string;
  product: { id: string; name: string; emoji: string; category: string; price: number; };
  price: number;
  stock: number;
}

interface Shop {
  id: string;
  name: string;
}

export default function POSPage() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("pos");
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopProducts, setShopProducts] = useState<ShopProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("Zote");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [shopName, setShopName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    async function init() {
      const s = await getUserShop();
      if (s) {
        setShop(s);
        const sp = await getShopProducts(s.id);
        setShopProducts(sp);
        if (sp.length === 0) {
          navigate("/shop/products", { replace: true });
          return;
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  const [orders, setOrders] = useState<any[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (activeNav === "history" && shop && orders === null) {
      setOrdersLoading(true);
      getShopOrders(shop.id).then((data) => {
        setOrders(data);
        setOrdersLoading(false);
      });
    }
    if (activeNav === "reports" && shop && orders === null) {
      setOrdersLoading(true);
      getShopOrders(shop.id).then((data) => {
        setOrders(data);
        setOrdersLoading(false);
      });
    }
  }, [activeNav, shop]);

  async function createUserShop() {
    if (!shopName.trim()) return;
    const s = await createShop(shopName.trim());
    if (s) {
      navigate("/shop/products", { replace: true });
    }
  }

  const displayProducts = shop
    ? shopProducts
        .filter((sp) => sp.stock > 0)
        .map((sp) => ({
          id: sp.product_id,
          name: sp.product.name,
          price: sp.price,
          emoji: sp.product.emoji,
          stock: sp.stock,
          category: sp.product.category,
        }))
    : fallbackProducts;

  const categories = shop
    ? ["Zote", ...new Set(displayProducts.map((p) => p.category))]
    : fallbackCategories;

  const searched = searchQuery
    ? displayProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayProducts;

  const filtered = selectedCat === "Zote"
    ? searched
    : searched.filter((p) => p.category === selectedCat);

  function addToCart(product: (typeof displayProducts)[number]) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          showToast("Stoo haitoshi!", "err");
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      if (product.stock < 1) {
        showToast("Bidhaa imeisha!", "err");
        return prev;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          emoji: product.emoji,
        },
      ];
    });
    showToast(`${product.emoji} ${product.name} imeongezwa`);
  }

  function increment(id: string) {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      const sp = shopProducts.find((p) => p.product_id === id);
      if (item && sp && item.qty >= sp.stock) {
        showToast("Stoo haitoshi!", "err");
        return prev;
      }
      return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
    });
  }

  function decrement(id: string) {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      if (item.qty === 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
    });
  }

  function remove(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleCheckoutComplete() {
    if (shop) {
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      await createOrder({
        shop_id: shop.id,
        total,
        payment_method: "cash",
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.qty,
          price: i.price,
        })),
      });
    }
    setCart([]);
    setShowCheckout(false);
    showToast("✅ Muamala umekamilika!");
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="size-full flex bg-background overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
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
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <img src="/logo2.jpeg" alt="MANGi" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
          <div className="sm:hidden">
            <p className="text-sidebar-foreground leading-none" style={{ fontWeight: 700 }}>MANGi APP</p>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Point of Sale</p>
          </div>
          <button
            className="ml-auto sm:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {NAV_ITEMS.map((item) => (
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

        <div className="px-3 pb-4 space-y-1">
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 sm:justify-center px-3 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <Shield size={20} />
              <span className="sm:hidden text-sm" style={{ fontWeight: 600 }}>Admin</span>
            </button>
          )}
          <div className="flex items-center gap-3 sm:justify-center px-3 py-3 rounded-xl bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 text-sm" style={{ fontWeight: 700, color: "var(--sidebar-primary)" }}>
              {profile?.username?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="sm:hidden min-w-0">
              <p className="text-sidebar-foreground text-sm truncate" style={{ fontWeight: 600 }}>{profile?.username ?? user?.email ?? "User"}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 sm:justify-center px-3 py-2 rounded-xl text-sidebar-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors text-xs"
            style={{ fontWeight: 500 }}
          >
            Toka
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <button
            className="sm:hidden p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground leading-none" style={{ fontWeight: 700 }}>
              {activeNav === "pos" ? (shop ? shop.name : "Uuzaji wa Bidhaa")
                : activeNav === "history" ? "Historia"
                : activeNav === "reports" ? "Ripoti"
                : "Mipango"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeNav === "pos" && shop ? `${shopProducts.length} bidhaa stookini`
                : activeNav === "pos" ? "Mode ya majaribio"
                : activeNav === "history" ? "Mauzo yaliyopita"
                : activeNav === "reports" ? "Muhtasari wa mauzo"
                : "Mipango ya akaunti"}
            </p>
          </div>
          {shop && (
            <button
              onClick={() => navigate("/shop/products")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground hover:border-primary/40 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Package size={15} />
              Bidhaa zangu
            </button>
          )}
          <button
            className="lg:hidden relative p-2.5 rounded-xl bg-primary text-primary-foreground"
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

        <div className="flex-1 flex overflow-hidden">
          {activeNav === "pos" ? (
            <>
              <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 py-4 gap-4">
                {!shop && (
                  <div className="bg-accent/10 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>Bado huna duka</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Unda duka lako ili kuanza kuuza</p>
                    </div>
                    <button
                      onClick={() => setShowShopForm(true)}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      Unda duka
                    </button>
                  </div>
                )}

                {shop && shopProducts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <Package size={36} />
                    <p className="text-sm">Bado hujajaza bidhaa</p>
                    <button
                      onClick={() => navigate("/shop/products")}
                      className="text-primary text-sm hover:underline"
                      style={{ fontWeight: 600 }}
                    >
                      Ongeza bidhaa zako
                    </button>
                  </div>
                )}

                {(!shop || shopProducts.length > 0) && (
                  <>
                    <SearchInput value={searchQuery} onChange={setSearchQuery} />

                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                      {categories.map((cat) => (
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

                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
                        {filtered.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="group text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md active:scale-[0.97] transition-all"
                          >
                            <div className="text-3xl mb-3 leading-none">{product.emoji}</div>
                            <p className="text-sm text-foreground leading-snug mb-1 line-clamp-2" style={{ fontWeight: 600 }}>{product.name}</p>
                            <p className="text-primary" style={{ fontWeight: 700, fontSize: "0.8rem" }}>{formatTZS(product.price)}</p>
                            {shop && (
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">Stoo: {product.stock}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground" style={{ fontWeight: 500 }}>
                                  {product.category}
                                </span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

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
            </>
          ) : activeNav === "history" ? (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <h2 className="text-foreground text-lg mb-4" style={{ fontWeight: 700 }}>Historia ya Mauzo</h2>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <History size={36} />
                  <p className="text-sm">Hakuna mauzo bado</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-card border border-border rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("sw-TZ", {
                              day: "numeric", month: "long", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span className="text-sm text-primary" style={{ fontWeight: 700 }}>
                          {formatTZS(order.total)}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <span className="text-lg">{item.product?.emoji ?? "📦"}</span>
                            <span className="flex-1 text-foreground">{item.product?.name ?? "Bidhaa"}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                            <span className="text-foreground" style={{ fontWeight: 600 }}>
                              {formatTZS(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                        {order.payment_method === "cash" ? "Lipa kwa fedha" : order.payment_method}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeNav === "reports" ? (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <h2 className="text-foreground text-lg mb-4" style={{ fontWeight: 700 }}>Ripoti za Mauzo</h2>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <BarChart2 size={36} />
                  <p className="text-sm">Hakuna data za mauzo bado</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground">Jumla ya Mauzo</p>
                      <p className="text-xl text-primary" style={{ fontWeight: 700 }}>
                        {formatTZS(orders.reduce((s: number, o: any) => s + o.total, 0))}
                      </p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground">Idadi ya Mauzo</p>
                      <p className="text-xl text-foreground" style={{ fontWeight: 700 }}>
                        {orders.length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <h3 className="text-sm text-foreground mb-3" style={{ fontWeight: 600 }}>Bidhaa Zilizouzwa Sana</h3>
                    {(() => {
                      const productCounts: Record<string, { name: string; emoji: string; qty: number; total: number }> = {};
                      for (const order of orders) {
                        for (const item of order.items ?? []) {
                          const key = item.product_id;
                          if (!productCounts[key]) {
                            productCounts[key] = {
                              name: item.product?.name ?? "Bidhaa",
                              emoji: item.product?.emoji ?? "📦",
                              qty: 0, total: 0,
                            };
                          }
                          productCounts[key].qty += item.quantity;
                          productCounts[key].total += item.price * item.quantity;
                        }
                      }
                      const sorted = Object.entries(productCounts).sort((a, b) => b[1].qty - a[1].qty);
                      return (
                        <div className="space-y-2">
                          {sorted.map(([id, info]) => (
                            <div key={id} className="flex items-center gap-2 text-sm">
                              <span className="text-lg">{info.emoji}</span>
                              <span className="flex-1 text-foreground">{info.name}</span>
                              <span className="text-muted-foreground">x{info.qty}</span>
                              <span className="text-foreground" style={{ fontWeight: 600 }}>
                                {formatTZS(info.total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <h2 className="text-foreground text-lg mb-4" style={{ fontWeight: 700 }}>Mipango</h2>
              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Jina la mtumiaji</p>
                    <p className="text-foreground" style={{ fontWeight: 600 }}>{profile?.username ?? user?.email}</p>
                  </div>
                  {shop && (
                    <div>
                      <p className="text-xs text-muted-foreground">Jina la duka</p>
                      <p className="text-foreground" style={{ fontWeight: 600 }}>{shop.name}</p>
                    </div>
                  )}
                  <hr className="border-border" />
                  <button
                    onClick={() => navigate("/shop/products")}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-foreground hover:border-primary/40 transition-colors text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    <Package size={16} />
                    Bidhaa zangu
                  </button>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    Toka
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {showCheckout && cart.length > 0 && (
        <CheckoutModal
          items={cart}
          onClose={() => setShowCheckout(false)}
          onComplete={handleCheckoutComplete}
        />
      )}

      {/* Create shop modal */}
      {showShopForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-foreground" style={{ fontWeight: 700 }}>Unda duka lako</h2>
              <button onClick={() => setShowShopForm(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Jina la duka</label>
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Mf. Duka la Amina"
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>
              <button
                onClick={createUserShop}
                disabled={!shopName.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontWeight: 700 }}
              >
                Unda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
