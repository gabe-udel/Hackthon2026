/**
 * Supabase inventory database interface for the Savor schema.
 * Uses typed Supabase client and supports partial usage logging.
 */

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type InventoryItemRecord = Database["public"]["Tables"]["inventory"]["Row"];
export type InventoryInsert = Database["public"]["Tables"]["inventory"]["Insert"];
export type ActionType = Database["public"]["Enums"]["action_type_enum"];
export type StandardUnit = Database["public"]["Enums"]["standard_unit_type"];

/**
 * Fetches all active (status=1) inventory items, ordered by expiration date (soonest first).
 */
export async function getAllItems() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .or("status.eq.1,status.is.null")
    .order("expiration_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as InventoryItemRecord[];
}

/**
 * Removes an inventory item by primary key.
 */
export async function removeItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("inventory").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Marks an inventory item as expired (status = -1) instead of deleting it.
 */
export async function markAsExpired(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("inventory")
    .update({ status: -1 })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Fetches all expired (status = -1) inventory items.
 */
export async function getExpiredItems() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("status", -1)
    .order("expiration_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as InventoryItemRecord[];
}

/**
 * Adds a new inventory item with expanded quantity/unit schema.
 */
export async function addItem(input: {
  name: string;
  category?: string | null;
  quantity: number;
  userUnit: string;
  standardUnit: StandardUnit;
  price?: number | null;
  expirationDate?: string | null;
}) {
  const supabase = createClient();

  // Internal-only conversion factor management. This is intentionally not
  // user-provided to keep cataloging UX simple and consistent.
  const conversionFactor = inferConversionFactor(input.userUnit, input.standardUnit);

  const payload: InventoryInsert = {
    name: input.name.trim(),
    category: input.category ?? null,
    initial_quantity: input.quantity,
    current_quantity: input.quantity,
    user_unit: input.userUnit.trim(),
    standard_unit: input.standardUnit,
    conversion_factor: conversionFactor,
    price: input.price ?? null,
    expiration_date: input.expirationDate ?? null,
    status: 1,
  };

  const { data, error } = await supabase.from("inventory").insert(payload).select().single();
  if (error) throw error;
  return data as InventoryItemRecord;
}

/**
 * Fetches all inventory items sorted by a chosen column.
 * x: 0 = expiration_date, 1 = category, 2 = name, 3 = created_at
 */
export async function sortBy(x: number, ascending: boolean = true) {
  const supabase = createClient();
  const columns = ["expiration_date", "category", "name", "created_at"] as const;
  const column = columns[x] ?? "expiration_date";

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .or("status.eq.1,status.is.null")
    .order(column, { ascending });

  if (error) throw error;
  return (data ?? []) as InventoryItemRecord[];
}

/**
 * Updates the expiration date of an existing inventory item.
 */
export async function updateExpiry(id: string, newExpirationDate: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("inventory")
    .update({ expiration_date: newExpirationDate })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Updates the current quantity of an inventory item.
 */
export async function updateQuantity(id: string, newQuantity: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("inventory")
    .update({ current_quantity: newQuantity })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Updates the price of an inventory item.
 */
export async function updatePrice(id: string, newPrice: number | null) {
  const supabase = createClient();
  const { error } = await supabase
    .from("inventory")
    .update({ price: newPrice })
    .eq("id", id);
  if (error) throw error;
}

function inferConversionFactor(userUnit: string, standardUnit: StandardUnit): number {
  const u = userUnit.trim().toLowerCase();

  if (standardUnit === "g") {
    if (u === "kg" || u === "kilogram" || u === "kilograms") return 1000;
    if (u === "g" || u === "gram" || u === "grams") return 1;
    if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") return 453.5924;
    if (u === "oz" || u === "ounce" || u === "ounces") return 28.3495;
  }

  if (standardUnit === "ml") {
    if (u === "l" || u === "liter" || u === "litre" || u === "liters" || u === "litres") return 1000;
    if (u === "ml" || u === "milliliter" || u === "millilitre" || u === "milliliters" || u === "millilitres") return 1;
    if (u === "cup" || u === "cups") return 236.588;
    if (u === "tbsp" || u === "tablespoon" || u === "tablespoons") return 14.7868;
    if (u === "tsp" || u === "teaspoon" || u === "teaspoons") return 4.92892;
    if (u === "fl oz" || u === "floz") return 29.5735;
  }

  // count and unknown units default to 1:1 until AI normalization refines it.
  return 1;
}

/**
 * Fetches inventory items expiring between today and the next `days` days.
 */
export async function getSoonToExpireItems(days: number = 5) {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  const startIso = today.toISOString().slice(0, 10);
  const endIso = endDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .or("status.eq.1,status.is.null")
    .gte("expiration_date", startIso)
    .lte("expiration_date", endIso)
    .order("expiration_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as InventoryItemRecord[];
}

/**
 * Atomic partial usage logger via RPC function:
 * public.log_partial_usage(p_item_id, p_amount_used, p_action_type)
 */
export async function logPartialUsage(itemId: string, amountUsed: number, actionType: ActionType) {
  if (!itemId) throw new Error("itemId is required");
  if (!Number.isFinite(amountUsed) || amountUsed <= 0) {
    throw new Error("amountUsed must be a positive number");
  }

  const supabase = createClient();

  const { error } = await supabase.rpc("log_partial_usage", {
    p_item_id: itemId,
    p_amount_used: amountUsed,
    p_action_type: actionType,
  });

  if (error) throw error;
}
