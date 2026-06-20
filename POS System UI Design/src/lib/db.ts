import { supabase } from "./supabase";

// --- Profiles ---

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function getEmailByUsername(username: string) {
  const { data } = await supabase.rpc("get_email_by_username", {
    lookup_username: username,
  });
  return data ?? null;
}

// --- Products (global catalog, admin only) ---

export async function getGlobalProducts() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  return data ?? [];
}

export async function createGlobalProduct(product: {
  name: string;
  emoji: string;
  category: string;
  price: number;
}) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data } = await supabase
    .from("products")
    .insert({ ...product, created_by: user.user.id })
    .select()
    .single();
  return data;
}

export async function updateGlobalProduct(
  id: string,
  product: { name: string; emoji: string; category: string; price: number }
) {
  const { data } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();
  return data;
}

export async function deleteGlobalProduct(id: string) {
  await supabase.from("products").delete().eq("id", id);
}

// --- Shops ---

export async function getUserShop() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.user.id)
    .maybeSingle();
  return data;
}

export async function createShop(name: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data } = await supabase
    .from("shops")
    .insert({ name, owner_id: user.user.id })
    .select()
    .single();
  return data;
}

// --- Shop Products ---

export async function getShopProducts(shopId: string) {
  const { data } = await supabase
    .from("shop_products")
    .select("*, product:products(*)")
    .eq("shop_id", shopId)
    .eq("is_active", true);
  return data ?? [];
}

export async function addShopProduct(
  shopId: string,
  productId: string,
  price: number,
  stock: number
) {
  const { data } = await supabase
    .from("shop_products")
    .insert({ shop_id: shopId, product_id: productId, price, stock })
    .select()
    .single();
  return data;
}

export async function updateShopProduct(
  id: string,
  updates: { price?: number; stock?: number; is_active?: boolean }
) {
  const { data } = await supabase
    .from("shop_products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return data;
}

export async function deleteShopProduct(id: string) {
  await supabase.from("shop_products").delete().eq("id", id);
}

// --- Orders ---

export async function createOrder(order: {
  shop_id: string;
  total: number;
  payment_method: string;
  items: Array<{ product_id: string; quantity: number; price: number }>;
}) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: orderData, error } = await supabase
    .from("orders")
    .insert({
      shop_id: order.shop_id,
      user_id: user.user.id,
      total: order.total,
      payment_method: order.payment_method,
    })
    .select()
    .single();

  if (error || !orderData) return null;

  const orderItems = order.items.map((item) => ({
    order_id: orderData.id,
    ...item,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) return null;

  return orderData;
}

export async function getShopOrders(shopId: string) {
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(name, emoji))")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getOrdersByDateRange(shopId: string, from: string, to: string) {
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(name, emoji))")
    .eq("shop_id", shopId)
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// --- Admin ---

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("getAllProfiles error:", error);
  return data ?? [];
}

export async function getAllShops() {
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("getAllShops error:", error);
  return data ?? [];
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("getAllOrders error:", error);
  return data ?? [];
}

export async function updateUserRole(userId: string, role: string) {
  const { data } = await supabase
    .from("profiles")
    .update({ role })
    .eq("user_id", userId)
    .select()
    .single();
  return data;
}

export async function deleteShop(shopId: string) {
  await supabase.from("shops").delete().eq("id", shopId);
}

export async function updateUserProfile(
  userId: string,
  updates: { username?: string; phone?: string; email?: string }
) {
  await supabase.from("profiles").update(updates).eq("user_id", userId);
}

export async function deleteUserProfile(userId: string) {
  await supabase.from("profiles").delete().eq("user_id", userId);
}
