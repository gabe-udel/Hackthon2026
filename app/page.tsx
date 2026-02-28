import { UploadCloud, Utensils, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
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
            <button className="text-green-600 text-sm font-medium">View Full Pantry →</button>
          </div>
          <div className="space-y-3">
            {/* We'll map through your Supabase data here */}
            <div className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="font-medium text-red-900">Whole Milk</span>
              <span className="text-red-700 text-sm italic">Expires in 1 day</span>
            </div>
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