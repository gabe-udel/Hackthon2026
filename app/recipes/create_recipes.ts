import { getSoonToExpireItems, getAllItems, type InventoryItemRecord } from "@/lib/supabase/interface";
import { askChat } from "@/lib/openai/openai_interface";

export type Recipe = {
  name: string;
  prepTime: string;
  servings: string;
  ingredients: string[];
  directions: string[];
};

function createIngredientsList(x: any[]): string {
    const result = x.map((item: any) => `${item.name},${item.expiration_date}`).join("\n");
    return result;
}

function createRecipePrompt(pantryLines: string): string {
  const today = new Date().toISOString().split("T")[0];

  return `You are a helpful home chef. The user has these ingredients in their pantry. Each line is: Ingredient name (quantity and unit) [expires: USE SOON / Xd / —]. Today is ${today}.

PANTRY INGREDIENTS:
${pantryLines}

Respond ONLY with valid JSON in this exact schema (no markdown, no backticks, just raw JSON):
{
  "name": "Recipe Name",
  "prepTime": "25 min",
  "servings": "4",
  "ingredients": ["2 cups flour", "1 lb chicken breast", ...],
  "directions": ["Preheat oven to 375°F.", "Dice the chicken into 1-inch cubes.", ...]
}

function parseRecipeResponse(raw: string): Recipe {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as Recipe;
    if (!parsed.name || !Array.isArray(parsed.directions)) {
      throw new Error("Invalid shape");
    }
    return {
      name: String(parsed.name),
      prepTime: String(parsed.prepTime ?? "—"),
      servings: String(parsed.servings ?? "—"),
      ingredientsFromPantry: Array.isArray(parsed.ingredientsFromPantry)
        ? parsed.ingredientsFromPantry.map((i: RecipeIngredient) => ({
            name: String(i?.name ?? ""),
            quantity: i?.quantity != null ? String(i.quantity) : undefined,
            note: i?.note != null ? String(i.note) : undefined,
          }))
        : [],
      ingredientsToBuy: Array.isArray(parsed.ingredientsToBuy)
        ? parsed.ingredientsToBuy.map((i: RecipeIngredient) => ({
            name: String(i?.name ?? ""),
            quantity: i?.quantity != null ? String(i.quantity) : undefined,
            note: i?.note != null ? String(i.note) : undefined,
          }))
        : [],
      directions: parsed.directions.map((s: unknown) => String(s ?? "")),
    };
  } catch {
    return {
      name: "Generated Recipe",
      prepTime: "—",
      servings: "—",
      ingredientsFromPantry: [],
      ingredientsToBuy: [],
      directions: [raw],
    };
  }
}

export async function generateRecipes(): Promise<Recipe[]> {
    const items = await getAllItems();
    const allIngredientsFormatted = createIngredientsList(items);

  if (pantryLines.trim().length === 0) {
    return [
      {
        name: "Add ingredients first",
        prepTime: "—",
        servings: "—",
        ingredientsFromPantry: [],
        ingredientsToBuy: [],
        directions: [
          "You don't have any items in your pantry yet. Add ingredients in My Pantry or scan a receipt, then come back to generate a recipe that uses what you have.",
        ],
      },
    ];
  }

    try {
        // Strip markdown fences if the model wraps it
        const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(cleaned) as Recipe;
        return [parsed];
    } catch {
        // Fallback: return as a single "raw" recipe
        return [{
            name: "Generated Recipe",
            prepTime: "—",
            servings: "—",
            ingredients: [],
            directions: [response],
        }];
    }
}
