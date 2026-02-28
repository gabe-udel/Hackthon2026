import { createClient } from "@/lib/supabase/client";

// Frontend dev calls this to get the pantry list
export async function getInventory() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("expiration_date", { ascending: true });

  if (error) console.error(error);
  return data;
}

// Frontend dev calls this after Gemini scans the receipt
export async function addGroceries(items: Array<Record<string, unknown>>) {
  const supabase = createClient();
  const { data, error } = await supabase.from("inventory").insert(items);

  if (error) console.error(error);
  return data;
}
