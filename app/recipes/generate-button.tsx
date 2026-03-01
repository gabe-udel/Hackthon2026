"use client";

import { useState } from "react";
import { generateRecipes, type Recipe } from "./create_recipes";
import { Clock3, Users, ChefHat } from "lucide-react";

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
        {loading ? "Generating..." : "Generate Recipe"}
      </button>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {recipes.length > 0 && (
        <div className="mt-8 space-y-6 text-left">
          {recipes.map((recipe, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Recipe Header */}
              <div className="bg-slate-900 text-white px-6 py-5">
                <div className="flex items-center gap-2 mb-1">
                  <ChefHat className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-black">{recipe.name}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> {recipe.prepTime}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {recipe.servings} servings</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Ingredients */}
                {recipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Ingredients</h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ing, j) => (
                        <span
                          key={j}
                          className="bg-green-50 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full border border-green-200"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Directions */}
                {recipe.directions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Directions</h4>
                    <ol className="space-y-3">
                      {recipe.directions.map((step, j) => (
                        <li key={j} className="flex gap-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {j + 1}
                          </span>
                          <p className="text-slate-700 text-sm leading-relaxed pt-0.5">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
