"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Utensils, TrendingUp, AlertTriangle, Clock3, Leaf, Wallet, ChevronRight } from "lucide-react";
import { getSoonToExpireItems, getAllItems, type InventoryItemRecord } from "@/lib/supabase/interface";
import { ShieldCheck } from "lucide-react";
import ReceiptButton from "./receipt-button";

export default function Dashboard() {
  const [soonItems, setSoonItems] = useState<InventoryItemRecord[]>([]);
  const [allItems, setAllItems] = useState<InventoryItemRecord[]>([]);
  const [loadingSoon, setLoadingSoon] = useState(true);
  const [todayMidnightMs, setTodayMidnightMs] = useState<number | null>(null);

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

  // Fun equivalence: what could you "save" by using soon-to-expire items?
  const mealsEquivalent = useMemo(() => {
    const avgMealCost = 12; // average cost of eating out
    return Math.max(Math.round(cashAtRisk / avgMealCost), 0);
  }, [cashAtRisk]);

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
      
      {/* 1. TOP SECTION: THE BIG STATS (BENTO STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MEALS SAVED CARD */}
        <div className="bg-green-600 text-white p-6 rounded-[2rem] shadow-lg shadow-green-900/20 flex flex-col justify-between aspect-square md:aspect-auto min-h-[160px]">
          <div className="flex justify-between items-start">
            <Leaf className="w-6 h-6 opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Use It Up</span>
          </div>
          <div>
            <p className="text-4xl font-black italic">{mealsEquivalent}<span className="text-lg ml-1 font-normal opacity-70">{mealsEquivalent === 1 ? 'meal' : 'meals'}</span></p>
            <p className="text-xs font-medium opacity-80">Worth of dining out — cook your expiring items instead!</p>
          </div>
        </div>

        {/* CASH AT RISK CARD - Dynamic Logic */}
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <Wallet className="text-green-600 w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Risk Warning</span>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">${cashAtRisk.toFixed(2)}</p>
            <p className="text-xs font-medium text-slate-500 italic">Total value expiring soon</p>
          </div>
        </div>

        {/* SCAN ACTION CARD */}
        <section className="bg-white border-2 border-dashed border-green-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:bg-green-50 transition-all group">
          <ReceiptButton />
        </section>
      </div>

      {/* 2. MAIN GRID: INVENTORY & AI INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* DYNAMIC LIST: Spans 8 cols */}
        <section className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <AlertTriangle className="text-amber-500 w-7 h-7" /> The "Use First" List
            </h2>
            <Link href="/inventory" className="flex items-center gap-1 text-green-600 text-xs font-bold hover:underline">
              Full Pantry <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {loadingSoon ? (
              <div className="flex items-center justify-center py-10 text-slate-400 italic text-sm">Loading your items...</div>
            ) : soonItems.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-[2rem] border border-dashed text-slate-400 text-sm">Your pantry is currently fresh! No items expiring soon.</div>
            ) : (
              soonItems.map((item) => {
                const daysLeft = daysUntil(item.expiration_date);
                if (daysLeft === null) return null;
                const styles = urgencyStyles(daysLeft);

                return (
                  <div key={item.id} className={`flex justify-between items-center p-5 rounded-3xl border transition-all hover:shadow-md ${styles.row}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                        {item.category === 'dairy' ? '🥛' : item.category === 'fruit' || item.category === 'vegetable' ? '🥗' : '📦'}
                      </div>
                      <div>
                        <p className={`font-bold ${styles.text}`}>{item.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${styles.sub}`}>Qty: {item.current_quantity ?? 0} {item.user_unit ?? ''} • {item.category ?? 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className={`text-xs font-black italic flex items-center gap-2 ${styles.sub}`}>
                      <Clock3 className="w-4 h-4" />
                      {daysLeft <= 0 ? "Expires Today" : `In ${daysLeft} days`}
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
              <Utensils className="text-green-400 w-5 h-5" /> AI Chef Suggestion
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed italic mb-6 relative z-10">
              "Based on your expiring {soonItems[0]?.name || 'items'}, I recommend making a quick frittata to save ${cashAtRisk.toFixed(0)}."
            </p>
            <Link href="/recipes" className="block w-full bg-green-500 hover:bg-green-400 text-slate-900 font-black py-4 rounded-2xl transition-all active:scale-95 relative z-10 text-center">
              Generate Recipe
            </Link>
          </div>

          {/* FRESHNESS INDICATOR CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Freshness Indicator
            </h2>
            <p className="text-4xl font-black text-slate-900 mb-1">{freshnessPct}%</p>
            <p className="text-xs text-slate-500 mb-4">of items are fresh (&gt;3 days until expiry)</p>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  freshnessPct >= 70 ? 'bg-green-500' : freshnessPct >= 40 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${freshnessPct}%` }}
              />
            </div>
          </div>

          {/* QUICK ANALYTICS CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Pantry Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Value</p>
                <p className="text-2xl font-black text-slate-900">${allItems.reduce((sum, i) => sum + (i.price ?? 0), 0).toFixed(0)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Items Tracked</p>
                <p className="text-2xl font-black text-slate-900">{allItems.length}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}