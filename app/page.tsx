"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UploadCloud, Utensils, TrendingUp, AlertTriangle, Clock3 } from "lucide-react";
import { getSoonToExpireItems } from "@/lib/supabase/interface";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expiration_date: string;
};

export default function Dashboard() {
  const [soonItems, setSoonItems] = useState<InventoryItem[]>([]);
  const [loadingSoon, setLoadingSoon] = useState(true);
  const [todayMidnightMs, setTodayMidnightMs] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setTodayMidnightMs(d.getTime());

    async function fetchSoonItems() {
      setLoadingSoon(true);
      try {
        const data = await getSoonToExpireItems(5);
        if (isMounted) setSoonItems((data ?? []) as InventoryItem[]);
      } catch (err) {
        console.error("Failed to fetch soon-to-expire items:", err);
        if (isMounted) setSoonItems([]);
      } finally {
        if (isMounted) setLoadingSoon(false);
      }
    }

    fetchSoonItems();
    return () => {
      isMounted = false;
    };
  }, []);

  function daysUntil(dateStr: string) {
    if (todayMidnightMs === null) return null;
    const expiry = new Date(dateStr);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - todayMidnightMs) / (1000 * 60 * 60 * 24));
  }

  function urgencyStyles(daysLeft: number) {
    if (daysLeft <= 1) {
      return {
        row: "bg-red-50 border-red-200",
        text: "text-red-900",
        sub: "text-red-700",
      };
    }
    if (daysLeft <= 3) {
      return {
        row: "bg-amber-50 border-amber-200",
        text: "text-amber-900",
        sub: "text-amber-700",
      };
    }
    return {
      row: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-900",
      sub: "text-yellow-700",
    };
  }

  function expiryLabel(daysLeft: number) {
    if (daysLeft <= 0) return "Expires today";
    if (daysLeft === 1) return "Expires in 1 day";
    return `Expires in ${daysLeft} days`;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. UPLOAD SECTION - The "Big Action" */}
      <section className="bg-white border-2 border-dashed border-green-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-green-400 transition cursor-pointer">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <UploadCloud className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold">Upload Your Receipt</h2>
        <p className="text-slate-500">Drag and drop or click to scan with Gemini AI</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. INVENTORY OVERVIEW - "The Red Zone" */}
        <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-amber-500" /> Use These Soon
            </h2>
            <Link href="/inventory" className="text-green-600 text-sm font-medium">
              View Full Pantry →
            </Link>
          </div>
          <div className="space-y-3">
            {loadingSoon && (
              <p className="text-sm text-slate-500">Loading soon-to-expire items...</p>
            )}

            {!loadingSoon && soonItems.length === 0 && (
              <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm">
                No items expiring in the next 5 days.
              </div>
            )}

            {!loadingSoon &&
              soonItems.map((item) => {
                const daysLeft = daysUntil(item.expiration_date);
                if (daysLeft === null) return null;
                const styles = urgencyStyles(daysLeft);

                return (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-3 rounded-lg border ${styles.row}`}
                  >
                    <div className="min-w-0">
                      <p className={`font-medium ${styles.text}`}>{item.name}</p>
                      <p className={`text-xs ${styles.sub}`}>
                        {item.category} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className={`text-sm italic flex items-center gap-1 ${styles.sub}`}>
                      <Clock3 className="w-4 h-4" />
                      {expiryLabel(daysLeft)}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* 3. ANALYTICS & RECIPES - "The History" */}
        <aside className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-500 w-5 h-5" /> Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Waste Saved</p>
                <p className="text-xl font-bold">12%</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Items</p>
                <p className="text-xl font-bold">28</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Utensils className="text-green-500 w-5 h-5" /> Recent Recipes
            </h2>
            <ul className="text-sm space-y-2 text-slate-600 italic">
              <li>• Spinach & Mushroom Frittata</li>
              <li>• Roasted Root Vegetables</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
