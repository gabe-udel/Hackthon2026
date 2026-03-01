"use client";

import { useState } from "react";
import { generateRecipes, type Recipe, type RecipeIngredient } from "./create_recipes";
import { Clock3, Users, ChefHat, ShoppingBag, Leaf } from "lucide-react";

function IngredientLine({ ing }: { ing: RecipeIngredient }) {
  const text = [ing.quantity, ing.name].filter(Boolean).join(" ");
  return (
    <li className="flex items-start gap-2 text-sm text-slate-700">
      <span className="text-green-500 mt-0.5 shrink-0">•</span>
      <span>
        {text || ing.name}
        {ing.note && (
          <span className="ml-1.5 text-xs text-amber-600 font-medium">({ing.note})</span>
        )}
      </span>
    </li>
  );
}

export default function GenerateButton() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setRecipes([]);
    try {
      const result = await generateRecipes();
      setRecipes(result);
    } catch (err) {
      console.error("Failed to generate recipe:", err);
      setError("Couldn't generate a recipe. Check your pantry has items and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition shadow-sm disabled:opacity-60 disabled:cursor-wait"
      >
        <ChefHat className="w-4 h-4" />
        {loading ? "Finding a recipe…" : "Generate recipe from my pantry"}
      </button>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {recipes.length > 0 && (
        <div className="space-y-6 text-left">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleClick}
              disabled={loading}
              className="text-sm font-semibold text-green-600 hover:text-green-700 disabled:opacity-50"
            >
              Generate another recipe
            </button>
          </div>
          {recipes.map((recipe, i) => (
            <article
              key={i}
              className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden print:shadow-none"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-6 md:px-8 md:py-7">
                <div className="flex items-center gap-2 mb-2">
                  <ChefHat className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{recipe.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="w-4 h-4 text-slate-400" />
                    {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    {recipe.servings} servings
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* From your pantry */}
                {recipe.ingredientsFromPantry.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                      From your pantry
                    </h3>
                    <ul className="space-y-1.5">
                      {recipe.ingredientsFromPantry.map((ing, j) => (
                        <IngredientLine key={j} ing={ing} />
                      ))}
                    </ul>
                  </div>
                )}

                {/* You'll need to get */}
                {recipe.ingredientsToBuy.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-500" />
                      You&apos;ll need to get these
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">
                      Pick these up so the recipe works as written.
                    </p>
                    <ul className="space-y-1.5">
                      {recipe.ingredientsToBuy.map((ing, j) => (
                        <IngredientLine key={j} ing={ing} />
                      ))}
                    </ul>
                  </div>
                )}

                {/* Directions */}
                {recipe.directions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                      Directions
                    </h3>
                    <ol className="space-y-4">
                      {recipe.directions.map((step, j) => (
                        <li key={j} className="flex gap-4">
                          <span className="shrink-0 w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">
                            {j + 1}
                          </span>
                          <p className="text-slate-700 text-sm leading-relaxed pt-0.5">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Placeholder when it's the "add ingredients first" message */}
                {recipe.name === "Add ingredients first" && (
                  <p className="text-sm text-slate-500">
                    Once you have items in My Pantry, we&apos;ll suggest recipes that use them and flag anything you need to buy.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
