import { getAllItems } from "@/lib/supabase/interface";

export async function generateRecipes(): Promise<string[]> {
    const items = await getAllItems();
    return items.map((item: any) => `${item.name} - ${item.category} (qty: ${item.quantity}, expires: ${item.expiration_date})`);
}