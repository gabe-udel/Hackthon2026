export default function RecipesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">AI Recipe Generator</h1>
      <div className="bg-green-50 border border-green-200 p-8 rounded-2xl text-center">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Ready to cook?</h2>
        <p className="text-green-700 mb-6">Gemini will look at your expiring items and suggest a meal.</p>
        <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition">
          Generate Magic Recipe
        </button>
      </div>
    </div>
  );
}