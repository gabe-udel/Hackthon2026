"use client";

import { useRef, useState, useCallback } from "react";
import { getReceiptEntries } from "@/lib/gemini/gemini_interface";
import { addItem, type StandardUnit } from "@/lib/supabase/interface";
import { UploadCloud, Camera, Check, X } from "lucide-react";

type ParsedEntry = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  standardUnit: StandardUnit;
  price: number;
  expiration_date: string;
};

function inferStandardUnit(unit: string): StandardUnit {
  const u = unit.trim().toLowerCase();
  if (["ml", "l", "liter", "litre", "cup", "tbsp", "tsp", "fl oz", "floz"].includes(u)) return "ml";
  if (["g", "kg", "oz", "lb", "lbs", "gram", "grams", "kilogram", "pound", "ounce"].includes(u)) return "g";
  return "count";
}

function parseCSV(csv: string): ParsedEntry[] {
  return csv
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("item_name"))
    .map((line) => {
      const [name, category, qty, unit, price, expiration_date] = line.split(",").map((s) => s.trim());
      const parsedUnit = unit || "count";
      return {
        name,
        category,
        quantity: parseFloat(qty) || 1,
        unit: parsedUnit,
        standardUnit: inferStandardUnit(parsedUnit),
        price: parseFloat(price) || 0,
        expiration_date,
      };
    })
    .filter((e) => e.name && e.category && e.expiration_date);
}

export default function ReceiptButton() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<ParsedEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function handleClick() {
    setShowPicker(true);
  }

  function handleUpload() {
    setShowPicker(false);
    fileInputRef.current?.click();
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  async function handleCamera() {
    setShowPicker(false);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setShowCamera(true);
      // Wait for the video element to mount, then attach the stream
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setError("Camera access denied or not available.");
    }
  }

  async function handleSnap() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    stopCamera();
    await processBase64(base64);
  }

  function resetState() {
    setShowModal(false);
    setShowPicker(false);
    stopCamera();
    setEntries([]);
    setSaved(false);
    setSaving(false);
    setError(null);
  }

  async function processBase64(base64: string) {
    setLoading(true);
    setError(null);
    setEntries([]);
    setSaved(false);

    try {
      const csv = await getReceiptEntries(base64);
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
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await processBase64(base64);
    } catch (err: unknown) {
      console.error("Failed to read file:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddAll() {
    setSaving(true);
    try {
      for (const entry of entries) {
        await addItem({
          name: entry.name,
          category: entry.category,
          quantity: entry.quantity,
          userUnit: entry.unit,
          standardUnit: entry.standardUnit,
          price: entry.price,
          expirationDate: entry.expiration_date,
        });
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
        <canvas ref={canvasRef} className="hidden" />

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
          <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Powered by Gemini</span>
        </button>

        {error && !showModal && !showPicker && (
          <p className="mt-3 text-red-500 text-xs font-medium">{error}</p>
        )}
      </div>

      {/* Camera Viewfinder Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="relative w-full max-w-lg flex-1 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-6 py-6 bg-black">
            <button
              onClick={stopCamera}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={handleSnap}
              className="w-16 h-16 rounded-full bg-white border-4 border-green-500 hover:scale-105 transition-transform active:scale-95"
              aria-label="Take photo"
            />
          </div>
        </div>
      )}

      {/* Source Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPicker(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xs mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h2 className="text-lg font-black text-slate-900">Scan Receipt</h2>
              <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pb-6 flex flex-col gap-3">
              <button
                onClick={handleCamera}
                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition active:scale-95"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
              <button
                onClick={handleUpload}
                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition active:scale-95"
              >
                <UploadCloud className="w-5 h-5" />
                Upload Image
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <th className="py-2 text-left">Qty</th>
                    <th className="py-2 text-left">Price</th>
                    <th className="py-2 text-left">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((entry, i) => (
                    <tr key={i} className="text-slate-700">
                      <td className="py-2 font-medium">{entry.name}</td>
                      <td className="py-2 capitalize text-slate-500">{entry.category}</td>
                      <td className="py-2 text-slate-500">{entry.quantity} {entry.unit}</td>
                      <td className="py-2 text-slate-500">${entry.price.toFixed(2)}</td>
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
