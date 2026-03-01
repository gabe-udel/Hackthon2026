"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Leaf,
  Recycle,
  Heart,
  Apple,
  Sprout,
  Globe2,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
} from "lucide-react";

const foodBanks = [
  { name: "Feeding America", url: "https://www.feedingamerica.org/find-your-local-foodbank", description: "Find your nearest food bank from the nation's largest hunger-relief network." },
  { name: "No Kid Hungry", url: "https://www.nokidhungry.org", description: "End childhood hunger — learn how to get involved." },
  { name: "Move For Hunger", url: "https://moveforhunger.org", description: "Reduce food waste by donating surplus food during moves." },
];

const tips = [
  { icon: <Apple className="w-5 h-5 text-red-500" />, title: "Eat what expires first", text: "Use the FIFO method. Check your Use First list and plan meals around those items." },
  { icon: <Recycle className="w-5 h-5 text-green-600" />, title: "Compost, don't trash", text: "Food in landfills produces methane. Composting keeps it out of the atmosphere." },
  { icon: <Lightbulb className="w-5 h-5 text-amber-500" />, title: "Buy only what you need", text: "Plan meals before shopping. Impulse buys drive ~30–40% of household food waste." },
  { icon: <Heart className="w-5 h-5 text-pink-500" />, title: "Donate surplus", text: "Unopened items you won't use can go to a food bank and help your community." },
  { icon: <Sprout className="w-5 h-5 text-emerald-600" />, title: "Store food properly", text: "Crisper drawers, airtight containers, and freezing extend shelf life a lot." },
  { icon: <Globe2 className="w-5 h-5 text-blue-500" />, title: "Understand date labels", text: '"Best by" usually means peak quality, not safety. Look, smell, and taste before tossing.' },
];

const storageGuide: { category: string; emoji: string; tips: string[] }[] = [
  { category: "Dairy & eggs", emoji: "🥛", tips: ["Keep milk and yogurt in the coldest part of the fridge.", "Store eggs in their carton, not the door.", "Hard cheese: wrap in wax paper or foil; lasts weeks."] },
  { category: "Produce", emoji: "🥬", tips: ["Berries: don’t wash until eating; store dry in a single layer.", "Leafy greens: dry well and store in a container with a paper towel.", "Tomatoes and avocados: ripen on the counter, then refrigerate."] },
  { category: "Meat & seafood", emoji: "🥩", tips: ["Keep on the bottom shelf to avoid drips.", "Use or freeze within 1–2 days of sell-by.", "Thaw in the fridge overnight, not on the counter."] },
  { category: "Grains & bread", emoji: "🍞", tips: ["Bread freezes well — slice and toast from frozen.", "Rice and pasta: store in a cool, dry place in sealed containers.", "Whole grains and flours: fridge or freezer extends freshness."] },
  { category: "Leftovers", emoji: "🍱", tips: ["Cool quickly and refrigerate within 2 hours.", "Label with the date so you use oldest first.", "Most cooked food is safe for 3–4 days; reheat to 165°F."] },
];

const stats = [
  { value: "1.3B", label: "tons of food wasted globally per year" },
  { value: "40%", label: "of US food supply goes to waste" },
  { value: "8–10%", label: "of global emissions from food waste" },
];

export default function SustainabilityPage() {
  const [expandedStorage, setExpandedStorage] = useState<number | null>(0);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Sustainability</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-xl">
          Technology can help us use resources better. Savor helps you track food, use it before it expires, and build habits that reduce waste and support the planet.
        </p>
      </header>

      {/* This week's challenge */}
      <section className="savor-green-challenge bg-gradient-to-br from-green-600 to-emerald-700 p-8 rounded-[2rem] shadow-xl shadow-green-900/20">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 opacity-90 text-white" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white/90">This week’s challenge</h2>
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">Use everything on your Use First list</h3>
        <p className="text-sm text-white/90 mb-6">
          Check your dashboard and plan at least one meal around items expiring in the next 3 days. Every item you use is less waste and fewer emissions.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-5 py-2.5 rounded-xl hover:bg-green-50 transition"
        >
          Go to dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Problem at a glance */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">The problem at a glance</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-3xl font-black text-green-600">{s.value}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you can do */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">What you can do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                {tip.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{tip.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Storage guide */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Storage guide
        </h2>
        <p className="text-sm text-slate-500 mb-4">Store food the right way to extend shelf life and cut waste.</p>
        <div className="space-y-2">
          {storageGuide.map((block, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedStorage(expandedStorage === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{block.emoji}</span>
                  <span className="font-bold text-slate-900">{block.category}</span>
                </span>
                {expandedStorage === i ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {expandedStorage === i && (
                <ul className="px-5 pb-5 pt-0 space-y-2 border-t border-slate-100 pt-4">
                  {block.tips.map((t, j) => (
                    <li key={j} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Donate */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Donate & make a difference</h2>
        <p className="text-sm text-slate-500 mb-4">
          Surplus unopened food can go to local food banks and hunger-relief programs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foodBanks.map((bank, i) => (
            <a
              key={i}
              href={bank.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-green-300 hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {bank.name}
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-green-500 transition" />
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{bank.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-green-500 transition flex-shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-green-600 text-white p-8 rounded-[2rem] shadow-lg shadow-green-900/20">
        <div className="flex items-start gap-4">
          <Leaf className="w-8 h-8 opacity-80 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-black mb-2">Our mission</h2>
            <p className="text-sm leading-relaxed opacity-90">
              Savor helps you reduce household food waste by tracking what you buy, alerting you before things expire, and suggesting recipes from what you have. Better habits and smarter tech can improve how we use the planet’s resources — one meal at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
