/**
 * Supabase inventory database interface.
 * Provides CRUD operations and sorting for the "inventory" table.
 *
 * Table schema:
 *   id             (uuid)         - auto-generated
 *   user_id        (uuid)
 *   name           (text)
 *   category       (text)
 *   quantity       (text)
 *   expiration_date (date)
 *   created_at     (timestamptz)  - auto-generated
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches all inventory items, ordered by expiration date (latest first).
 * @returns Array of inventory row objects.
 */
export async function getAllItems() {
    const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("expiration_date", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Removes an inventory item identified by its name and creation timestamp.
 * @param name       - The item name.
 * @param createdAt  - The item's created_at timestamp (used to disambiguate duplicates).
 */
export async function removeItem(name: string, createdAt: string) {
    const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("name", name)
        .eq("created_at", createdAt);
    if (error) throw error;
}

/**
 * Inserts a new item into the inventory table.
 * @param name           - Item name (e.g. "Apples").
 * @param category       - Item category (e.g. "Fruit").
 * @param quantity       - Quantity as text (e.g. "5").
 * @param expirationDate - Expiration date string (e.g. "2026-03-10").
 * @param createdAt      - Creation timestamp string.
 */
export async function addItem(name: string, category: string, quantity: string, expirationDate: string, createdAt: string) {
    const { error } = await supabase.from("inventory").insert([
        { name, category, quantity, expiration_date: expirationDate, created_at: createdAt }
    ]);
    if (error) throw error;
}

/**
 * Fetches all inventory items sorted by a chosen column.
 * @param x - Sort mode: 0 = expiration date, 1 = category, 2 = name (alphabetical), 3 = created at.
 *            Defaults to expiration date if an invalid value is provided.
 * @returns Sorted array of inventory row objects.
 */
export async function sortBy(x: number) {
    const columns = ["expiration_date", "category", "name", "created_at"];
    const column = columns[x] ?? "expiration_date";

    const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order(column, { ascending: true });

    if (error) throw error;
    return data;
}

/**
 * Updates the expiration date of an existing inventory item.
 * @param name              - The item name.
 * @param createdAt         - The item's created_at timestamp (used to identify the row).
 * @param newExpirationDate - The new expiration date string (e.g. "2026-04-01").
 */
export async function updateExpiry(name: string, createdAt: string, newExpirationDate: string) {
    const { error } = await supabase
        .from("inventory")
        .update({ expiration_date: newExpirationDate })
        .eq("name", name)
        .eq("created_at", createdAt);
    if (error) throw error;
}