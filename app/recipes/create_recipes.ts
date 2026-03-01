import { getSoonToExpireItems, getAllItems, type InventoryItemRecord } from "@/lib/supabase/interface";
import { askChat } from "@/lib/openai/openai_interface";

export type RecipeIngredient = {
  name: string;
  quantity?: string;
  note?: string;
};

export type Recipe = {
  name: string;
  prepTime: string;
  servings: string;
  ingredientsFromPantry: RecipeIngredient[];
  ingredientsToBuy: RecipeIngredient[];
  directions: string[];
};

function buildIngredientLines(items: InventoryItemRecord[]): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return items
    .map((item) => {
      const qty = item.current_quantity ?? item.initial_quantity ?? 0;
      const unit = item.user_unit ?? "";
      const amount = unit ? `${qty} ${unit}` : String(qty);
      const exp = item.expiration_date
        ? (() => {
            const e = new Date(item.expiration_date);
            e.setHours(0, 0, 0, 0);
            const days = Math.ceil((e.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return days <= 0 ? "EXPIRED" : days <= 3 ? "USE SOON" : `${days}d`;
          })()
        : "—";
      return `${item.name} (${amount}) [expires: ${exp}]`;
    })
    .join("\n");
}

function createRecipePrompt(pantryLines: string): string {
  const today = new Date().toISOString().split("T")[0];

  return `You are a helpful home chef. The user has these ingredients in their pantry. Each line is: Ingredient name (quantity and unit) [expires: USE SOON / Xd / —]. Today is ${today}.

PANTRY INGREDIENTS:
${pantryLines}

RULES:
1. Suggest ONE recipe that uses as many of these ingredients as possible. Prioritize ingredients marked "USE SOON" or "EXPIRED" so they don't go to waste.
2. Only list ingredients that the user actually has in "ingredientsFromPantry". Use the exact names from the list above; you may add quantity needed (e.g. "2 eggs", "1 cup milk") if helpful.
3. If the pantry list is small or you need a few extra items for a complete meal (e.g. oil, salt, one vegetable), list those in "ingredientsToBuy" with quantity. Be minimal: only add what's really needed. If the user has plenty to make a full meal, ingredientsToBuy can be empty.
4. The recipe should be a realistic main dish or complete meal (not just a snack). Prep time and servings should be reasonable.
5. Directions must be clear, beginner-friendly, with temperatures in °F and times where relevant.

Respond with ONLY valid JSON, no markdown or extra text, in this exact shape:
{
  "name": "Recipe Name",
  "prepTime": "e.g. 25 min",
  "servings": "e.g. 4",
  "ingredientsFromPantry": [
    { "name": "ingredient name", "quantity": "e.g. 2 cups", "note": "optional: use first / expiring soon" }
  ],
  "ingredientsToBuy": [
    { "name": "item to buy", "quantity": "e.g. 1 bunch" }
  ],
  "directions": [
    "Step 1 with details.",
    "Step 2."
  ]
}`;
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
  const [soonItems, allItems] = await Promise.all([
    getSoonToExpireItems(14),
    getAllItems(),
  ]);

  const items = allItems.length > 0 ? allItems : soonItems;
  const pantryLines = buildIngredientLines(items);

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

  const prompt = createRecipePrompt(pantryLines);
  const response = await askChat(prompt);
  const recipe = parseRecipeResponse(response);
  return [recipe];
}
