"use client";

import { ExternalLink, Leaf, Recycle, Heart, Apple, Sprout, Globe2, Lightbulb, ArrowRight } from "lucide-react";

const foodBanks = [
  {
    name: "Feeding America",
    url: "https://www.feedingamerica.org/find-your-local-foodbank",
    description: "Find your nearest food bank from the nation's largest hunger-relief network.",
  },
  {
    name: "No Kid Hungry",
    url: "https://www.nokidhungry.org",
    description: "End childhood hunger in America — learn how to get involved.",
  },
  {
    name: "World Food Programme",
    url: "https://www.wfp.org",
    description: "Support the world's largest humanitarian organization fighting hunger globally.",
  },
  {
    name: "Move For Hunger",
    url: "https://moveforhunger.org",
    description: "Reduce food waste by donating surplus food during life transitions.",
  },
];

const tips = [
  {
    icon: <Apple className="w-5 h-5 text-red-500" />,
    title: "Eat What Expires First",
    text: "Use the FIFO method — first in, first out. Check your Savor dashboard to see what's expiring soon and plan meals around those items.",
  },
  {
    icon: <Recycle className="w-5 h-5 text-green-600" />,
    title: "Compost Don't Trash",
    text: "When food does go bad, compost it instead of sending it to landfill. Food waste in landfills produces methane, a potent greenhouse gas.",
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
    title: "Buy Only What You Need",
    text: "Plan meals before shopping. Impulse buys are the #1 driver of household food waste — on average, 30-40% of purchased food goes uneaten.",
  },
  {
    icon: <Heart className="w-5 h-5 text-pink-500" />,
    title: "Donate Surplus Food",
    text: "If you have non-perishable items you won't use, donate them to a local food bank. One meal donated can make a real difference.",
  },
  {
    icon: <Sprout className="w-5 h-5 text-emerald-600" />,
    title: "Store Food Properly",
    text: "Proper storage extends shelf life dramatically. Keep produce in crisper drawers, store grains in airtight containers, and freeze what you can't eat in time.",
  },
  {
    icon: <Globe2 className="w-5 h-5 text-blue-500" />,
    title: "Understand Date Labels",
    text: '"Best by" ≠ "expired." Most date labels indicate peak quality, not safety. Trust your senses — look, smell, and taste before discarding.',
  },
];

const stats = [
  { value: "1.3B", label: "tons of food wasted globally per year" },
  { value: "40%", label: "of US food supply goes to waste" },
  { value: "$408B", label: "annual cost of food waste in the US" },
  { value: "8-10%", label: "of global emissions from food waste" },
];

export default function SustainabilityPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Page Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Sustainability</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-xl">
          Food waste is one of the biggest contributors to climate change. Savor helps you track, use, and save your food — reducing waste, saving money, and feeding more people.
        </p>
      </header>

      {/* Impact Stats */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">The Problem at a Glance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-3xl font-black text-green-600">{s.value}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">What You Can Do</h2>
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

      {/* Food Banks */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Donate & Make a Difference</h2>
        <p className="text-sm text-slate-500 mb-4">
          Don&apos;t let surplus food go to waste. These organizations connect you with local food banks and hunger-relief programs.
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

      {/* Mission Statement */}
      <section className="bg-green-600 text-white p-8 rounded-[2rem] shadow-lg shadow-green-900/20">
        <div className="flex items-start gap-4">
          <Leaf className="w-8 h-8 opacity-80 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-black mb-2">Our Mission</h2>
            <p className="text-sm leading-relaxed opacity-90">
              Savor was built with one goal: to reduce household food waste. By tracking what you buy, alerting you before things expire, and generating recipes from what you already have, we help you eat smarter, save money, and lower your environmental footprint — one meal at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
