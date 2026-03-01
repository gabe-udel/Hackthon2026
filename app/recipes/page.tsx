import GenerateButton from "./generate-button";
import { ChefHat, Sparkles } from "lucide-react";

export default function RecipesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero header */}
      <header className="relative bg-slate-900 text-white rounded-[2.5rem] p-10 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-green-500/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">AI Recipe Generator</h1>
              <p className="text-sm text-slate-400 font-medium">Powered by your pantry</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg mt-4">
            Our AI chef scans your inventory, prioritizes items expiring soon, and crafts a
            complete recipe so nothing goes to waste.
          </p>
          <div className="flex items-center gap-2 mt-6 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-green-400" />
            <span>Recipes are tailored to what you already have on hand</span>
          </div>
        </div>
      </header>

      {/* Generate section */}
      <GenerateButton />
    </div>
  );
}