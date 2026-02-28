// components/Dashboard.tsx (or app/page.tsx)
"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, Utensils, TrendingUp, AlertTriangle, Loader2, FileImage } from 'lucide-react';

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedStrings, setExtractedStrings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcessImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedFile) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      // Calling the internal Next.js API route we just created
      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setExtractedStrings(data.items);
      console.log("Extracted Food Strings:", data.items);
      
      // Optional: Clear selected file after success
      setSelectedFile(null);

    } catch (error) {
      console.error("Error uploading receipt:", error);
      alert("Failed to process the receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* 1. UPLOAD SECTION */}
      <section 
        className="bg-white border-2 border-dashed border-green-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-green-400 transition cursor-pointer"
        onClick={handleBoxClick}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {!selectedFile ? (
          <>
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <UploadCloud className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Upload Your Receipt</h2>
            <p className="text-slate-500">Click to upload an image and scan with Gemini AI</p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <FileImage className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{selectedFile.name}</h2>
            
            <button 
              onClick={handleProcessImage}
              disabled={isProcessing}
              className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with Gemini...
                </>
              ) : (
                'Process Receipt'
              )}
            </button>
          </div>
        )}
      </section>

      {/* RESULT SECTION */}
      {extractedStrings.length > 0 && (
        <section className="bg-green-50 p-6 rounded-2xl border border-green-200">
          <h2 className="text-lg font-bold text-green-800 mb-4">Extracted Food Items</h2>
          <ul className="space-y-2">
            {extractedStrings.map((itemString, index) => (
              <li key={index} className="p-3 bg-white rounded-lg shadow-sm border border-green-100 text-sm font-medium text-slate-700">
                {itemString}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 2 & 3. INVENTORY & ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-amber-500" /> Use These Soon
            </h2>
            <button className="text-green-600 text-sm font-medium">View Full Pantry →</button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="font-medium text-red-900">Whole Milk</span>
              <span className="text-red-700 text-sm italic">Expires in 1 day</span>
            </div>
          </div>
        </section>

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