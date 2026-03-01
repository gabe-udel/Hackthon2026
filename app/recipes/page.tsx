import GenerateButton from "./generate-button";
import Link from "next/link";
import { ChefHat, Leaf, ShoppingBag } from "lucide-react";

export default function RecipesPage() {
  return (
    <div className="max-w-2xl mx-auto pb-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-green-500" />
          Recipe generator
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          We suggest meals using what you already have. We prioritize ingredients that are expiring soon so nothing goes to waste. If we need a few extra items, we&apos;ll tell you exactly what to get.
        </p>
      </header>

      <div className="rounded-2xl bg-green-50 border border-green-100 p-6 md:p-8 mb-8">
        <h2 className="text-lg font-bold text-green-900 mb-2">How it works</h2>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <Leaf className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>Recipes are built from your pantry — we use what you have first.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold shrink-0">2.</span>
            <span>Ingredients expiring soon are prioritized so you can use them in time.</span>
          </li>
          <li className="flex items-start gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>If we suggest extra items (e.g. oil, one veg), we&apos;ll list them clearly as &quot;You&apos;ll need to get these.&quot;</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-green-700">
          Don&apos;t have much in your pantry yet? <Link href="/inventory" className="font-semibold underline hover:no-underline">Add items</Link> or scan a receipt from the dashboard.
        </p>
      </div>

      <GenerateButton />
    </div>
  );
}
