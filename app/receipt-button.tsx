"use client";

import { useRef, useState } from "react";
import { getReciptEntries } from "@/lib/openai/openai_interface";
import { addItem } from "@/lib/supabase/interface";
import { UploadCloud, Check, X } from "lucide-react";

type ParsedEntry = {
  name: string;
  category: string;
  expiration_date: string;
  price: string;
};

function parseCSV(csv: string): ParsedEntry[] {
  return csv
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("item_name"))
    .map((line) => {
      const [name, category, expiration_date, price] = line.split(",").map((s) => s.trim());
      return { name, category, expiration_date, price: price || "0" };
    })
    .filter((e) => e.name && e.category && e.expiration_date);
}

export default function ReceiptButton() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<ParsedEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    fileInputRef.current?.click();
  }

  function resetState() {
    setShowModal(false);
    setEntries([]);
    setSaved(false);
    setSaving(false);
    setError(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setEntries([]);
    setSaved(false);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const csv = await getReciptEntries(base64);
      const parsed = parseCSV(csv);

      if (parsed.length === 0) {
        setError("No food items found in the receipt. Try a clearer photo.");
      } else {
        setEntries(parsed);
        setShowModal(true);
      }
    } catch (err: unknown) {
      console.error("Failed to process receipt:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddAll() {
    setSaving(true);
    try {
      for (const entry of entries) {
        await addItem(entry.name, entry.category, "1", entry.expiration_date, new Date().toISOString(), entry.price);
      }
      setSaved(true);
      setTimeout(resetState, 1500);
    } catch (err: unknown) {
      console.error("Failed to save items:", JSON.stringify(err));
      const msg = (err && typeof err === "object" && "message" in err) ? String((err as {message: string}).message) : "Failed to save items";
      setError(msg);
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={handleClick}
          disabled={loading}
          className="group flex flex-col items-center gap-2 cursor-pointer disabled:cursor-wait"
        >
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 group-hover:scale-110 transition-all shadow-sm">
            <UploadCloud className={`w-7 h-7 text-green-600 ${loading ? "animate-pulse" : ""}`} />
          </div>
          <span className="text-sm font-bold text-slate-800">
            {loading ? "Analyzing..." : "Scan Receipt"}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Powered by GPT-4o Vision</span>
        </button>

        {error && !showModal && (
          <p className="mt-3 text-red-500 text-xs font-medium">{error}</p>
        )}
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={resetState}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h2 className="text-lg font-black text-slate-900">Receipt Items</h2>
              <button onClick={resetState} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table */}
            <div className="px-6 max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 bg-white">
                  <tr>
                    <th className="py-2 text-left">Item</th>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-left">Price</th>
                    <th className="py-2 text-left">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((entry, i) => (
                    <tr key={i} className="text-slate-700">
                      <td className="py-2 font-medium">{entry.name}</td>
                      <td className="py-2 capitalize text-slate-500">{entry.category}</td>
                      <td className="py-2 text-slate-500">${entry.price}</td>
                      <td className="py-2 text-slate-500">{entry.expiration_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4">
              {error && <p className="text-red-500 text-xs font-medium mb-2">{error}</p>}

              {saved ? (
                <div className="flex items-center justify-center gap-1 text-green-600 text-sm font-bold py-3">
                  <Check className="w-5 h-5" /> Added {entries.length} items!
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={resetState}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAll}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : `Add ${entries.length} Items`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
