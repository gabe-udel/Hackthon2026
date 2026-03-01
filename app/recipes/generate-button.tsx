"use client";

import { useState } from "react";
import { generateRecipes, type Recipe } from "./create_recipes";
import { Clock3, Users, ChefHat, Sparkles, UtensilsCrossed, Loader2, RefreshCw } from "lucide-react";

export default function GenerateButton() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await generateRecipes();
      setRecipes(result);
    } catch (err) {
      console.error("Failed to generate recipes:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Generate button area */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleClick}
          disabled={loading}
          className="group relative bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-base hover:bg-green-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-green-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cooking up ideas...
            </>
          ) : recipes.length > 0 ? (
            <>
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Generate Another
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Recipe
            </>
          )}
        </button>
        {recipes.length > 0 && !loading && (
          <span className="text-xs text-slate-400 font-medium">
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} generated
          </span>
        )}
      </div>

      {/* Recipe cards */}
      {recipes.length > 0 && (
        <div className="space-y-8">
          {recipes.map((recipe, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              {/* Recipe Header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-8 py-7">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-green-400" />
                      </div>
                      <h3 className="text-2xl font-black">{recipe.name}</h3>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="w-4 h-4 text-slate-500" />
                        {recipe.prepTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-500" />
                        {recipe.servings} servings
                      </span>
                    </div>
                  </div>
                  <div className="bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-500/20">
                    AI Generated
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Ingredients */}
                {recipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      Ingredients
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recipe.ingredients.map((ing, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-3 bg-green-50/60 border border-green-100 rounded-xl px-4 py-2.5"
                        >
                          <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                          <span className="text-sm text-slate-700 font-medium">{ing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Directions */}
                {recipe.directions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                      Directions
                    </h4>
                    <ol className="space-y-4">
                      {recipe.directions.map((step, j) => (
                        <li key={j} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-sm">
                            {j + 1}
                          </span>
                          <p className="text-slate-700 text-sm leading-relaxed pt-1.5">{step}</p>
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

      {/* Empty state */}
      {recipes.length === 0 && !loading && (
        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Hit the button above to generate a recipe from your pantry items</p>
        </div>
      )}
    </div>
  );
}
