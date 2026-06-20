import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Store, Package, ShoppingCart,
  Shield, Loader2, Search, LogOut, Pencil, Trash2, X, Plus, Menu,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";
import {
  getAllProfiles,
  getAllShops,
  getAllOrders,
  updateUserRole,
  updateUserProfile,
  deleteUserProfile,
  deleteUserCascade,
  getGlobalProducts,
  createGlobalProduct,
  updateGlobalProduct,
  deleteGlobalProduct,
} from "../lib/db";

type Tab = "overview" | "users" | "shops" | "products";

const CATEGORIES = ["Mboga", "Mkate", "Vitafunio", "Vinywaji", "Usafi", "General"];

const NAV_ITEMS = [
  { id: "overview" as Tab, icon: LayoutDashboard, label: "Muhtasari" },
  { id: "users" as Tab, icon: Users, label: "Watumiaji" },
  { id: "shops" as Tab, icon: Store, label: "Maduka" },
  { id: "products" as Tab, icon: Package, label: "Bidhaa" },
];

export default function AdminDashboardPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function load() {
    setLoading(true);
    const [p, s, o, pr] = await Promise.all([
      getAllProfiles(),
      getAllShops(),
      getAllOrders(),
      getGlobalProducts(),
    ]);
    setProfiles(p);
    setShops(s);
    setOrders(o);
    setProducts(pr);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filteredProfiles = searchUser
    ? profiles.filter((p) =>
        p.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchUser.toLowerCase())
      )
    : profiles;

  const stats = [
    { icon: Users, label: "Watumiaji", value: profiles.length, color: "text-blue-500" },
    { icon: Store, label: "Maduka", value: shops.filter(s => profiles.find(p => p.user_id === s.owner_id)).length, color: "text-emerald-500" },
    { icon: Package, label: "Bidhaa", value: products.length, color: "text-amber-500" },
    { icon: ShoppingCart, label: "Mauzo", value: orders.length, color: "text-violet-500" },
  ];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "📦", category: "General", price: 0 });

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({ username: "", phone: "", email: "" });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", emoji: "📦", category: "General", price: 0 });
    setShowForm(true);
  }

  function openEdit(p: any) {
    setEditing(p);
    setForm({ name: p.name, emoji: p.emoji, category: p.category, price: p.price });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || form.price <= 0) return;
    if (editing) {
      await updateGlobalProduct(editing.id, form);
    } else {
      await createGlobalProduct(form);
    }
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    await deleteGlobalProduct(id);
    load();
  }

  function openEditUser(p: any) {
    setEditingUser(p);
    setUserForm({ username: p.username ?? "", phone: p.phone ?? "", email: p.email ?? "" });
    setShowUserForm(true);
  }

  async function handleSaveUser() {
    if (!editingUser) return;
    await updateUserProfile(editingUser.user_id, userForm);
    setShowUserForm(false);
    setEditingUser(null);
    load();
  }

  async function handleDeleteUser(userId: string, username: string) {
    if (!confirm(`Una uhakika unataka kumfuta "${username}"?`)) return;
    await deleteUserCascade(userId);
    load();
  }

  async function handleDemoteAdmin(userId: string) {
    await updateUserRole(userId, "user");
    load();
  }

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="size-full flex bg-background overflow-hidden">
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
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Admin</p>
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
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`
                flex items-center gap-3 sm:justify-center px-3 py-3 rounded-xl transition-colors
                ${tab === item.id
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
          <button
            onClick={() => { navigate("/"); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 sm:justify-center px-3 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LayoutDashboard size={20} />
            <span className="sm:hidden text-sm" style={{ fontWeight: 600 }}>MANGi APP</span>
          </button>
          <div className="flex items-center gap-3 sm:justify-center px-3 py-3 rounded-xl bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 text-sm" style={{ fontWeight: 700, color: "var(--sidebar-primary)" }}>
              {profile?.username?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="sm:hidden min-w-0">
              <p className="text-sidebar-foreground text-sm truncate" style={{ fontWeight: 600 }}>{profile?.username ?? user?.email ?? "Admin"}</p>
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
              {tab === "overview" ? "Muhtasari" : tab === "users" ? "Watumiaji" : tab === "shops" ? "Maduka" : "Bidhaa"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tab === "overview" ? "Admin dashboard" : tab === "users" ? `${profiles.length} watumiaji` : tab === "shops" ? `${(shops.filter(s => profiles.find(p => p.user_id === s.owner_id))).length} maduka` : `${products.length} bidhaa`}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {/* Overview */}
          {tab === "overview" && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
                    <s.icon size={22} className={s.color} />
                    <p className="text-2xl text-foreground mt-2" style={{ fontWeight: 700 }}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-2xl p-4">
                <h2 className="text-foreground text-sm mb-3" style={{ fontWeight: 600 }}>Mauzo ya Hivi Karibuni</h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Hakuna mauzo bado</p>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-foreground">Mauzo</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {new Date(o.created_at).toLocaleDateString("sw-TZ")}
                          </span>
                        </div>
                        <span className="text-primary" style={{ fontWeight: 600 }}>
                          TZS {(o.total ?? 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Tafuta mtumiaji kwa jina au barua pepe..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((p) => (
                  <div key={p.id} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        p.role === "admin"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {p.username?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>
                          {p.username ?? "—"}
                          {p.role === "admin" && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs" style={{ fontWeight: 600 }}>
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                        {p.phone && <p className="text-xs text-muted-foreground">{p.phone}</p>}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{new Date(p.created_at).toLocaleDateString("sw-TZ")}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {p.role === "admin" && p.user_id !== user?.id && (
                          <button
                            onClick={() => handleDemoteAdmin(p.user_id)}
                            className="px-2.5 py-1.5 rounded-xl text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                            style={{ fontWeight: 600 }}
                          >
                            Ondoa Admin
                          </button>
                        )}
                        <button
                          onClick={() => openEditUser(p)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(p.user_id, p.username ?? "mtumiaji")}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Users size={32} />
                  <p className="text-sm">
                    {searchUser ? "Hakuna mtumiaji anayelingana na tafuta yako" : "Hakuna watumiaji bado"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Shops */}
          {tab === "shops" && (
            <div className="max-w-3xl mx-auto space-y-3">
              {(() => {
                const validShops = shops.filter(s => profiles.find(p => p.user_id === s.owner_id));
                return validShops.length > 0 ? (
                validShops.map((s) => (
                  <div key={s.id} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Store size={18} className="text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.owner_id
                          ? `Mmiliki: ${profiles.find(p => p.user_id === s.owner_id)?.username ?? profiles.find(p => p.user_id === s.owner_id)?.email ?? "akaunti"}`
                          : "—"}
                      </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{new Date(s.created_at).toLocaleDateString("sw-TZ")}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Store size={32} />
                  <p className="text-sm">Hakuna maduka bado</p>
                </div>
              )}})()}
            </div>
          )}

          {/* Products */}
          {tab === "products" && (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
                  style={{ fontWeight: 600 }}
                >
                  <Plus size={16} />
                  Ongeza bidhaa
                </button>
              </div>
              {products.length > 0 ? (
                products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border">
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="text-sm text-primary" style={{ fontWeight: 700 }}>
                      TZS {p.price.toLocaleString()}
                    </span>
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Package size={32} />
                  <p className="text-sm">Hakuna bidhaa bado</p>
                  <button onClick={openCreate} className="text-primary text-sm hover:underline" style={{ fontWeight: 600 }}>
                    Ongeza bidhaa ya kwanza
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User edit modal */}
      {showUserForm && editingUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-foreground" style={{ fontWeight: 700 }}>
                Hariri mtumiaji
              </h2>
              <button onClick={() => setShowUserForm(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Jina la mtumiaji</label>
                <input
                  value={userForm.username}
                  onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Barua pepe</label>
                <input
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Namba ya simu</label>
                <input
                  value={userForm.phone}
                  onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                />
              </div>
              <button
                onClick={handleSaveUser}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ fontWeight: 700 }}
              >
                Hifadhi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-foreground" style={{ fontWeight: 700 }}>
                {editing ? "Hariri bidhaa" : "Bidhaa mpya"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Emoji</label>
                <input
                  value={form.emoji}
                  onChange={e => setForm({ ...form, emoji: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                  placeholder="📦"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Jina</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                  placeholder="Jina la bidhaa"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Aina</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Bei (TZS)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                  placeholder="0"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!form.name || form.price <= 0}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontWeight: 700 }}
              >
                {editing ? "Hifadhi" : "Ongeza"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
