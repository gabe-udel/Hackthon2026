'use client';
import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

export default function UploadReceipt({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result;

      const res = await fetch('/api/process-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64data }),
      });

      if (res.ok) {
        onUploadSuccess();
      }
      setLoading(false);
    };
  };

  return (
    <div className="relative inline-block">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        disabled={loading}
      />
      <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700">
        {loading ? <Loader2 className="animate-spin" /> : <Camera />}
        {loading ? 'Processing Receipt...' : 'Scan Receipt'}
      </button>
    </div>
  );
}
