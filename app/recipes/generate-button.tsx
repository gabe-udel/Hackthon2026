"use client";

import { useState } from "react";
import { generateRecipes } from "./create_recipes"

export default function GenerateButton() {
  const [recipes, setRecipes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await generateRecipes();
      console.log(result);
      setRecipes(result);
    } catch (err) {
      console.error("Failed to generate recipes:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Magic Recipe"}
      </button>

      {recipes.length > 0 && (
        <div className="mt-6 space-y-4 text-left">
          {recipes.map((recipe, i) => (
            <div key={i} className="bg-white border border-green-200 p-4 rounded-lg">
              <p className="text-slate-800 whitespace-pre-wrap">{recipe}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
