import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Pencil, Trash2, X, Loader2, Store } from "lucide-react";
import {
  getGlobalProducts,
  createGlobalProduct,
  updateGlobalProduct,
  deleteGlobalProduct,
} from "../lib/db";

interface Product {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
}

const CATEGORIES = ["Mboga", "Mkate", "Vitafunio", "Vinywaji", "Usafi", "General"];

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "", category: "General", price: 0 });

  async function load() {
    setLoading(true);
    const data = await getGlobalProducts();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", emoji: "📦", category: "General", price: 0 });
    setShowForm(true);
  }

  function openEdit(p: Product) {
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

  return (
    <div className="size-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-foreground leading-none" style={{ fontWeight: 700 }}>Simamia Bidhaa</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Admin — orodha kuu ya bidhaa</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus size={16} />
          Ongeza
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Store size={40} />
            <p>Hakuna bidhaa bado</p>
            <button onClick={openCreate} className="text-primary text-sm hover:underline" style={{ fontWeight: 600 }}>
              Ongeza bidhaa ya kwanza
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border"
              >
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <span className="text-sm text-primary" style={{ fontWeight: 700 }}>
                  TZS {p.price.toLocaleString()}
                </span>
                <button
                  onClick={() => openEdit(p)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-foreground" style={{ fontWeight: 700 }}>
                {editing ? "Hariri bidhaa" : "Bidhaa mpya"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
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
