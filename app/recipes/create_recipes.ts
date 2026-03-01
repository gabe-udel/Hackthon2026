import { getSoonToExpireItems, getAllItems, type InventoryItemRecord } from "@/lib/supabase/interface";
import { askChat } from "@/lib/gemini/gemini_interface";

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

Keep directions clear and beginner-friendly. Include cooking temps in °F, specific quantities, and timing for each step.`;
}

function parseRecipeResponse(raw: string): Recipe {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as Recipe;
    if (!parsed.name || !Array.isArray(parsed.directions)) {
      throw new Error("Invalid shape: missing name or directions");
    }
    return {
      name: String(parsed.name),
      prepTime: String(parsed.prepTime ?? "—"),
      servings: String(parsed.servings ?? "—"),
      ingredients: Array.isArray(parsed.ingredients) 
        ? parsed.ingredients.map((i: unknown) => String(i ?? ""))
        : [],
      directions: parsed.directions.map((s: unknown) => String(s ?? "")),
    };
  } catch (error) {
    console.error("Error parsing recipe response:", error, "Raw:", raw);
    return {
      name: "Generated Recipe",
      prepTime: "—",
      servings: "—",
      ingredients: [],
      directions: [raw],
    };
  }
}

export async function generateRecipes(): Promise<Recipe[]> {
    try {
        const items = await getAllItems();
        const allIngredientsFormatted = createIngredientsList(items);

        if (allIngredientsFormatted.trim().length === 0) {
            return [
                {
                    name: "Add ingredients first",
                    prepTime: "—",
                    servings: "—",
                    ingredients: [],
                    directions: [
                        "You don't have any items in your pantry yet. Add ingredients in My Pantry or scan a receipt, then come back to generate a recipe that uses what you have.",
                    ],
                },
            ];
        }

        const prompt = createRecipePrompt(allIngredientsFormatted);
        console.log("Sending prompt to Gemini:", prompt.substring(0, 100) + "...");
        const response = await askChat(prompt);
        console.log("Gemini response:", response.substring(0, 200) + "...");
        
        const recipe = parseRecipeResponse(response);
        return [recipe];
    } catch (error) {
        console.error("Error generating recipes:", error);
        return [{
            name: "Error generating recipe",
            prepTime: "—",
            servings: "—",
            ingredients: [],
            directions: ["An error occurred while generating the recipe. Check console for details."],
        }];
    }
}
