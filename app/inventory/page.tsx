export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">My Pantry</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* We will map your Supabase data here later! */}
        <div className="p-6 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 h-40">
          <span className="text-4xl mb-2">+</span>
          <p className="font-medium">Scan a receipt to add food</p>
        </div>
      </div>
    </div>
  );
}