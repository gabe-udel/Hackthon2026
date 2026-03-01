import { getAllItems } from "@/lib/supabase/interface";
import { askGemini } from "@/lib/gemini/gemini_interface";

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

function createRecipePrompt(ingredients: string): string {
    return `You are a helpful home chef assistant. Below is a list of ingredients the user has, along with their expiration dates (format: name,YYYY-MM-DD). Today's date is ${new Date().toISOString().split("T")[0]}.

INGREDIENTS:
${ingredients}

Please suggest ONE recipe that:
1. Prioritizes ingredients that are expiring soonest so they don't go to waste.
2. Uses as many of the listed ingredients as possible.
3. Is a realistic, complete meal (not just a snack).

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

export async function generateRecipes(): Promise<Recipe[]> {
    const items = await getAllItems();
    const allIngredientsFormatted = createIngredientsList(items);

    const prompt = createRecipePrompt(allIngredientsFormatted);
    const response = await askGemini(prompt);

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