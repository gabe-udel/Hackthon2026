"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Utensils, TrendingUp, AlertTriangle, Clock3, Leaf, Wallet, ChevronRight, Sparkles, ScanLine } from "lucide-react";
import { getSoonToExpireItems, getAllItems, type InventoryItemRecord } from "@/lib/supabase/interface";
import { ShieldCheck } from "lucide-react";
import ReceiptButton from "./receipt-button";
import { toTitleCase } from "@/lib/utils";

const SUSTAINABILITY_TIPS = [
  { text: "Meat & dairy have the highest carbon footprint — use those first when they’re close to expiry.", icon: "🌱" },
  { text: "Composting food scraps keeps methane out of landfills. Even a small bin helps.", icon: "♻️" },
  { text: "\"Best by\" usually means peak quality, not safety. Smell and look before you toss.", icon: "👃" },
  { text: "Planning 3 meals before you shop can cut household food waste by up to 40%.", icon: "📋" },
  { text: "Freeze bread, fruit, and cooked grains to extend life by weeks or months.", icon: "🧊" },
  { text: "Donating unopened items you won’t use helps your community and the planet.", icon: "❤️" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { line: "Good morning", sub: "Start the day by checking what to use first." };
  if (h < 17) return { line: "Good afternoon", sub: "A quick look at your pantry can save food and money." };
  return { line: "Good evening", sub: "Plan tomorrow’s meals around what’s expiring." };
}

function getCategoryEmoji(category: string | null): string {
  const c = (category ?? "").toLowerCase();
  if (c.includes("dairy")) return "🥛";
  if (c.includes("fruit") || c.includes("fruits")) return "🍎";
  if (c.includes("vegetable") || c.includes("produce") || c.includes("greens")) return "🥬";
  if (c.includes("meat") || c.includes("poultry")) return "🥩";
  if (c.includes("seafood") || c.includes("fish")) return "🐟";
  if (c.includes("grain") || c.includes("bread") || c.includes("bakery")) return "🍞";
  if (c.includes("beverage") || c.includes("drink")) return "🧃";
  if (c.includes("frozen")) return "🧊";
  if (c.includes("snack")) return "🍿";
  if (c.includes("condiment") || c.includes("sauce") || c.includes("spice")) return "🧂";
  if (c.includes("egg")) return "🥚";
  return "🍽️";
}

export default function Dashboard() {
  const [soonItems, setSoonItems] = useState<InventoryItemRecord[]>([]);
  const [allItems, setAllItems] = useState<InventoryItemRecord[]>([]);
  const [loadingSoon, setLoadingSoon] = useState(true);
  const [todayMidnightMs, setTodayMidnightMs] = useState<number | null>(null);

  const greeting = useMemo(() => getGreeting(), []);
  const tipOfTheDay = useMemo(() => SUSTAINABILITY_TIPS[new Date().getDate() % SUSTAINABILITY_TIPS.length], []);

  useEffect(() => {
    let isMounted = true;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setTodayMidnightMs(d.getTime());

    async function fetchItems() {
      setLoadingSoon(true);
      try {
        const [soonData, allData] = await Promise.all([
          getSoonToExpireItems(3),
          getAllItems(),
        ]);
        if (isMounted) {
          setSoonItems(soonData ?? []);
          setAllItems(allData ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        if (isMounted) setLoadingSoon(false);
      }
    }

    fetchItems();
    return () => { isMounted = false; };
  }, []);

  // Calculation Logic for "Cash at Risk"
  const cashAtRisk = useMemo(() => {
    return soonItems.reduce((acc, item) => acc + (item.price || 0), 0);
  }, [soonItems]);

  // Freshness indicator: % of items NOT expiring within 3 days
  const freshnessPct = useMemo(() => {
    if (allItems.length === 0 || todayMidnightMs === null) return 100;
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const freshCount = allItems.filter((item) => {
      if (!item.expiration_date) return true;
      const exp = new Date(item.expiration_date);
      exp.setHours(0, 0, 0, 0);
      return exp.getTime() - todayMidnightMs > threeDaysMs;
    }).length;
    return Math.round((freshCount / allItems.length) * 100);
  }, [allItems, todayMidnightMs]);

  // Spotlight: items to use + why it matters (replaces "meals of dining")
  const useFirstHighlight = useMemo(() => {
    const n = soonItems.length;
    if (n === 0) return { count: 0, line: "Nothing expiring soon", sub: "Your pantry is in good shape." };
    if (n === 1) return { count: 1, line: "1 item to use", sub: `Use it before it goes to waste — food waste drives ~8% of global emissions.` };
    return { count: n, line: `${n} items to use`, sub: `Using them this week keeps food out of landfills and cuts unnecessary emissions.` };
  }, [soonItems.length]);

  function daysUntil(dateStr: string | null) {
    if (todayMidnightMs === null || !dateStr) return null;
    const expiry = new Date(dateStr);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - todayMidnightMs) / (1000 * 60 * 60 * 24));
  }

  function urgencyStyles(daysLeft: number) {
    if (daysLeft <= 1) return { row: "bg-red-50 border-red-100", text: "text-red-900", sub: "text-red-600", icon: "text-red-500" };
    if (daysLeft <= 3) return { row: "bg-orange-50 border-orange-100", text: "text-orange-900", sub: "text-orange-600", icon: "text-orange-500" };
    return { row: "bg-yellow-50 border-yellow-100", text: "text-yellow-900", sub: "text-yellow-600", icon: "text-yellow-500" };
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Greeting + Quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">{greeting.line}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{greeting.sub}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 h-10 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition shadow-sm"
          >
            <Utensils className="w-4 h-4 shrink-0" /> Generate recipe
          </Link>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-green-300 hover:bg-green-50 transition"
          >
            My Pantry <ChevronRight className="w-3 h-3 shrink-0" />
          </Link>
        </div>
      </div>

      {/* Sustainability tip of the day */}
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
        <span className="text-2xl flex-shrink-0" aria-hidden>{tipOfTheDay.icon}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Today’s sustainability tip</p>
          <p className="text-sm text-slate-700 mt-0.5">{tipOfTheDay.text}</p>
        </div>
        <Link href="/sustainability" className="flex-shrink-0 text-xs font-semibold text-emerald-600 hover:underline">
          More tips →
        </Link>
      </div>

      {/* 1. TOP SECTION: THE BIG STATS (BENTO STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* USE-FIRST SPOTLIGHT CARD */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-[2rem] shadow-lg shadow-green-900/20 flex flex-col justify-between aspect-square md:aspect-auto min-h-[160px] transition hover:shadow-xl hover:shadow-green-900/25">
          <div className="flex justify-between items-start">
            <Leaf className="w-6 h-6 opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Use It Up</span>
          </div>
          <div>
            <p className="text-4xl font-black italic">{useFirstHighlight.line}</p>
            <p className="text-xs font-medium opacity-80 mt-1">{useFirstHighlight.sub}</p>
          </div>
        </div>

        {/* CASH AT RISK CARD */}
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between min-h-[160px] hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <Wallet className="text-green-600 w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">At risk</span>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">${cashAtRisk.toFixed(2)}</p>
            <p className="text-xs font-medium text-slate-500 italic">Total value expiring in the next 3 days</p>
          </div>
        </div>

        {/* SCAN CARD */}
        <section className="bg-white border-2 border-dashed border-green-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:bg-green-50 hover:border-green-300 transition-all group">
          <ScanLine className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-bold text-slate-700 mb-2">Just went shopping?</p>
          <ReceiptButton />
        </section>
      </div>

      {/* 2. MAIN GRID: INVENTORY & AI INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* DYNAMIC LIST: Spans 8 cols */}
        <section className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <AlertTriangle className="text-amber-500 w-7 h-7" /> Use First
            </h2>
            <Link href="/inventory" className="flex items-center gap-1 text-green-600 text-xs font-bold hover:underline">
              Full Pantry <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {loadingSoon ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <span className="animate-pulse">Loading your items…</span>
              </div>
            ) : soonItems.length === 0 ? (
              <div className="p-12 text-center bg-gradient-to-b from-slate-50 to-white rounded-[2rem] border-2 border-dashed border-slate-200">
                <Sparkles className="w-10 h-10 text-green-400 mx-auto mb-3 opacity-80" />
                <p className="font-semibold text-slate-700">Your pantry is in great shape</p>
                <p className="text-sm text-slate-500 mt-1">Nothing expiring in the next 3 days. Add items or scan a receipt to keep tracking.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Link href="/inventory" className="text-sm font-bold text-green-600 hover:underline">Add item</Link>
                  <span className="text-slate-300">·</span>
                  <ReceiptButton />
                </div>
              </div>
            ) : (
              soonItems.map((item) => {
                const daysLeft = daysUntil(item.expiration_date);
                if (daysLeft === null) return null;
                const styles = urgencyStyles(daysLeft);

                return (
                  <div key={item.id} className={`flex justify-between items-center p-5 rounded-3xl border transition-all hover:shadow-md ${styles.row}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">
                        {getCategoryEmoji(item.category)}
                      </div>
                      <div>
                        <p className={`font-bold ${styles.text}`}>{toTitleCase(item.name)}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${styles.sub}`}>Qty: {item.current_quantity ?? 0} {item.user_unit ?? ""} · {toTitleCase(item.category) || "Uncategorized"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black italic flex items-center gap-1.5 ${styles.sub}`}>
                        <Clock3 className="w-4 h-4" />
                        {daysLeft <= 0 ? "Expires today" : `${daysLeft}d left`}
                      </span>
                      <Link
                        href="/recipes"
                        className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline whitespace-nowrap"
                      >
                        Cook with this →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* SIDEBAR: Spans 4 cols */}
        <aside className="lg:col-span-4 space-y-6">
          {/* AI RECIPE CARD */}
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors" />
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
              <Utensils className="text-green-400 w-5 h-5" /> AI Chef
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed italic mb-6 relative z-10">
              {soonItems.length > 0
                ? `Use ${soonItems[0]?.name ?? "your expiring items"} in a recipe and save $${cashAtRisk.toFixed(0)} from going to waste.`
                : "Add items with expiry dates, then we’ll suggest recipes to use them up."}
            </p>
            <Link href="/recipes" className="block w-full bg-green-500 hover:bg-green-400 text-slate-900 font-black py-4 rounded-2xl transition-all active:scale-95 relative z-10 text-center">
              Generate recipe
            </Link>
          </div>

          {/* FRESHNESS INDICATOR */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Freshness
            </h2>
            <p className="text-4xl font-black text-slate-900 mb-1">{freshnessPct}%</p>
            <p className="text-xs text-slate-500 mb-4">of items fresh (&gt;3 days left)</p>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  freshnessPct >= 70 ? "bg-green-500" : freshnessPct >= 40 ? "bg-amber-400" : "bg-red-500"
                }`}
                style={{ width: `${freshnessPct}%` }}
              />
            </div>
            {freshnessPct >= 80 && allItems.length > 0 && (
              <p className="text-xs text-green-600 font-medium mt-3">You’re doing great — most of your pantry is fresh.</p>
            )}
          </div>

          {/* SUSTAINABILITY SPOTLIGHT */}
          <Link
            href="/sustainability"
            className="block bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] shadow-sm hover:border-emerald-200 hover:shadow-md transition"
          >
            <h2 className="text-sm font-black uppercase tracking-widest text-emerald-700 mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Sustainability
            </h2>
            <p className="text-sm text-slate-700">Challenges, storage tips, and ways to reduce waste.</p>
            <p className="text-xs font-semibold text-emerald-600 mt-2">Explore →</p>
          </Link>

          {/* PANTRY OVERVIEW */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Pantry
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total value</p>
                <p className="text-2xl font-black text-slate-900">${allItems.reduce((sum, i) => sum + (i.price ?? 0), 0).toFixed(0)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Items</p>
                <p className="text-2xl font-black text-slate-900">{allItems.length}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}