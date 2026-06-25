import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Package, X, Loader2, Check, Minus, ImageIcon } from "lucide-react";
import {
  getGlobalProducts,
  getShopProducts,
  addShopProduct,
  deleteShopProduct,
  updateShopProduct,
  createAndAddShopProduct,
  uploadProductImage,
} from "../lib/db";

interface Shop {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

interface Props {
  shop: Shop;
}

interface GlobalProduct {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
  image_url?: string;
}

interface ShopProductItem {
  id: string;
  product_id: string;
  price: number;
  selling_price: number;
  buying_price: number;
  stock: number;
  product: GlobalProduct;
}

const CATEGORIES = ["General", "Mboga", "Mkate", "Vitafunio", "Vinywaji", "Usafi", "Chakula", "Elektroniki", "Shule"];

export default function ShopProductsPage({ shop }: Props) {
  const navigate = useNavigate();
  const [globalProducts, setGlobalProducts] = useState<GlobalProduct[]>([]);
  const [shopProducts, setShopProducts] = useState<ShopProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", emoji: "📦", category: "General",
    selling_price: "", buying_price: "", stock: "", image_url: "",
  });

  async function load() {
    setLoading(true);
    const [globals, shopItems] = await Promise.all([
      getGlobalProducts(),
      getShopProducts(shop.id),
    ]);
    setGlobalProducts(globals);
    setShopProducts(shopItems);
    setLoading(false);
  }

  useEffect(() => { load(); }, [shop.id]);

  const addedProductIds = new Set(shopProducts.map((sp) => sp.product_id));
  const availableProducts = globalProducts.filter(
    (p) => !addedProductIds.has(p.id)
  );

  async function handleAdd(productId: string, price: number) {
    await addShopProduct(shop.id, productId, price, 0, 0);
    await load();
    setShowAddModal(false);
  }

  async function handleRemove(id: string) {
    await deleteShopProduct(id);
    setShopProducts(prev => prev.filter(sp => sp.id !== id));
  }

  async function handleStockChange(id: string, stock: number) {
    if (stock < 0) stock = 0;
    setShopProducts(prev => prev.map(sp =>
      sp.id === id ? { ...sp, stock } : sp
    ));
    await updateShopProduct(id, { stock });
  }

  async function handleSellingPriceChange(id: string, sellingPrice: number) {
    if (sellingPrice < 0) sellingPrice = 0;
    setShopProducts(prev => prev.map(sp =>
      sp.id === id ? { ...sp, selling_price: sellingPrice, price: sellingPrice } : sp
    ));
    await updateShopProduct(id, { selling_price: sellingPrice });
  }

  async function handleBuyingPriceChange(id: string, buyingPrice: number) {
    if (buyingPrice < 0) buyingPrice = 0;
    setShopProducts(prev => prev.map(sp =>
      sp.id === id ? { ...sp, buying_price: buyingPrice } : sp
    ));
    await updateShopProduct(id, { buying_price: buyingPrice });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const url = await uploadProductImage(file);
    if (url) setCreateForm({ ...createForm, image_url: url });
    setImageUploading(false);
  }

  async function handleCreateProduct() {
    if (!createForm.name || !createForm.selling_price) return;
    const sp = await createAndAddShopProduct(shop.id, {
      name: createForm.name,
      emoji: createForm.emoji || "📦",
      category: createForm.category,
      image_url: createForm.image_url || undefined,
      stock: Number(createForm.stock) || 0,
      buying_price: Number(createForm.buying_price) || 0,
      selling_price: Number(createForm.selling_price) || 0,
    });
    if (sp) {
      setShowCreateModal(false);
      setCreateForm({ name: "", emoji: "📦", category: "General", selling_price: "", buying_price: "", stock: "", image_url: "" });
      await load();
    }
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
          <h1 className="text-foreground leading-none" style={{ fontWeight: 700 }}>Bidhaa Zangu</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{shop.name}</p>
        </div>
        <button
          onClick={() => {
            setCreateForm({ name: "", emoji: "📦", category: "General", selling_price: "", buying_price: "", stock: "", image_url: "" });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus size={16} />
          Mpya
        </button>
        {availableProducts.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm hover:border-primary/40 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Package size={16} />
            Kutoka katalogi
          </button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : shopProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Package size={40} />
            <p>Hakuna bidhaa kwenye duka lako</p>
            <button
              onClick={() => {
                setCreateForm({ name: "", emoji: "📦", category: "General", selling_price: "", buying_price: "", stock: "", image_url: "" });
                setShowCreateModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
              style={{ fontWeight: 600 }}
            >
              Ongeza bidhaa mpya
            </button>
            {availableProducts.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="text-primary text-sm hover:underline"
                style={{ fontWeight: 600 }}
              >
                Au ongeza kutoka kwa katalogi
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            {shopProducts.map((sp) => (
              <div
                key={sp.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border"
              >
                {sp.product.image_url ? (
                  <img src={sp.product.image_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-input-background" />
                ) : (
                  <span className="text-2xl">{sp.product.emoji}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>
                    {sp.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{sp.product.category}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-right space-y-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Kuuza:</span>
                      <input
                        type="number"
                        value={sp.selling_price ?? sp.price}
                        onChange={(e) =>
                          handleSellingPriceChange(sp.id, Number(e.target.value))
                        }
                        className="w-20 px-2 py-1 rounded-lg bg-input-background border border-border text-xs text-foreground text-right"
                        style={{ fontWeight: 600 }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Kununua:</span>
                      <input
                        type="number"
                        value={sp.buying_price}
                        onChange={(e) =>
                          handleBuyingPriceChange(sp.id, Number(e.target.value))
                        }
                        className="w-20 px-2 py-1 rounded-lg bg-input-background border border-border text-xs text-foreground text-right"
                        style={{ fontWeight: 600 }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Stoo:</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleStockChange(sp.id, sp.stock - 1)}
                          className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-8 text-center text-xs text-foreground" style={{ fontWeight: 600 }}>
                          {sp.stock}
                        </span>
                        <button
                          onClick={() => handleStockChange(sp.id, sp.stock + 1)}
                          className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(sp.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create product modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
              <h2 className="text-foreground" style={{ fontWeight: 700 }}>Bidhaa mpya</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Picha</label>
                <div className="flex items-center gap-3">
                  {createForm.image_url ? (
                    <img src={createForm.image_url} alt="" className="w-16 h-16 rounded-xl object-contain border border-border bg-input-background" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-input-background border border-border flex items-center justify-center text-2xl">
                      {createForm.emoji}
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border hover:border-primary/40 text-muted-foreground text-sm text-center transition-colors">
                      {imageUploading ? "Inapakia..." : createForm.image_url ? "Badilisha picha" : "Chagua picha"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {createForm.image_url && (
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, image_url: "" })}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Jina la bidhaa</label>
                <input
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Mf. Charger ya simu"
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Aina</label>
                  <select
                    value={createForm.category}
                    onChange={e => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Emoji</label>
                  <input
                    value={createForm.emoji}
                    onChange={e => setCreateForm({ ...createForm, emoji: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Bei ya kuuza (TZS)</label>
                  <input
                    type="number"
                    value={createForm.selling_price}
                    onChange={e => setCreateForm({ ...createForm, selling_price: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Bei ya kununua (TZS)</label>
                  <input
                    type="number"
                    value={createForm.buying_price}
                    onChange={e => setCreateForm({ ...createForm, buying_price: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 600 }}>Stoo (idadi)</label>
                <input
                  type="number"
                  value={createForm.stock}
                  onChange={e => setCreateForm({ ...createForm, stock: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>
              <button
                onClick={handleCreateProduct}
                disabled={!createForm.name || !createForm.selling_price}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontWeight: 700 }}
              >
                Ongeza bidhaa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add product modal (from catalog) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
              <h2 className="text-foreground" style={{ fontWeight: 700 }}>Ongeza kutoka katalogi</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {availableProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAdd(p.id, p.price)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left"
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-input-background" />
                  ) : (
                    <span className="text-2xl">{p.emoji}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus size={14} className="text-primary" />
                  </div>
                </button>
              ))}
              {availableProducts.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">
                  Bidhaa zote tayari zimeongezwa
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
