import { getAllItems } from "@/lib/supabase/interface";
import { askChat } from "@/lib/openai/openai_interface";

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

Respond in this exact format:
RECIPE NAME: <name>
INGREDIENTS USED: <comma-separated list of ingredients from the list above>
PREP TIME: <estimated time>
SERVINGS: <number>

DIRECTIONS:
1. <step 1 with specific measurements, temperatures, and times>
2. <step 2>
...

Keep directions clear and beginner-friendly. Include cooking temps in °F, specific quantities, and timing for each step.`;
}

export async function generateRecipes(): Promise<string[]> {
    const items = await getAllItems();
    const allIngredientsFormatted = createIngredientsList(items);

    const prompt = createRecipePrompt(allIngredientsFormatted);
    const response = await askChat(prompt);

    return [response];
}