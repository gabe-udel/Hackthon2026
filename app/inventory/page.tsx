"use client";

import { useEffect, useState, useCallback } from "react";
import { sortBy, addItem, removeItem, updateExpiry } from "@/lib/supabase/interface";

type InventoryItem = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: string;
  expiration_date: string;
  created_at: string;
  price: number;
};

// sortBy indices: 0 = expiration_date, 1 = category, 2 = name, 3 = created_at

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sortColumn, setSortColumn] = useState(0); // default: expiration_date
  const [ascending, setAscending] = useState(true);
  const [loading, setLoading] = useState(true);

  // Add item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // Edit expiry state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editExpiry, setEditExpiry] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sortBy(sortColumn, ascending);
      setItems(data as InventoryItem[]);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [sortColumn, ascending]);

  /** Toggle sort: if clicking the active column, flip direction; otherwise switch column */
  function handleSort(col: number) {
    if (col === sortColumn) {
      setAscending((prev) => !prev);
    } else {
      setSortColumn(col);
      setAscending(true);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newCategory || !newQuantity || !newExpiry) return;
    try {
      await addItem(newName, newCategory, newQuantity, newExpiry, new Date().toISOString(), newPrice || "0");
      setNewName("");
      setNewCategory("");
      setNewQuantity("");
      setNewExpiry("");
      setNewPrice("");
      setShowAddForm(false);
      await fetchItems();
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  }

  async function handleRemove(item: InventoryItem) {
    if (!confirm(`Remove "${item.name}" from your pantry?`)) return;
    try {
      await removeItem(item.name, item.created_at);
      await fetchItems();
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  }

  async function handleUpdateExpiry(item: InventoryItem) {
    if (!editExpiry) return;
    try {
      await updateExpiry(item.name, item.created_at, editExpiry);
      setEditingId(null);
      setEditExpiry("");
      await fetchItems();
    } catch (err) {
      console.error("Failed to update expiry:", err);
    }
  }

  function expiryInfo(dateStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    expiry.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      const overdue = Math.abs(daysLeft);
      return { color: "text-red-600 font-semibold", label: `Expired ${overdue}d ago` };
    }
    if (daysLeft === 0) return { color: "text-red-600 font-semibold", label: "Expires today" };
    if (daysLeft <= 3) return { color: "text-orange-500 font-semibold", label: `${daysLeft}d left` };
    if (daysLeft <= 7) return { color: "text-yellow-600", label: `${daysLeft}d left` };
    return { color: "text-green-600", label: `${daysLeft}d left` };
  }

  const sortLabels = ["Days Until Expiry", "Category", "Name", "Date Added"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-800">My Pantry</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            {showAddForm ? "Cancel" : "+ Add Item"}
          </button>
          <select
            value={sortColumn}
            onChange={(e) => setSortColumn(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {sortLabels.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => setAscending((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {ascending ? "Asc ↑" : "Desc ↓"}
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-white rounded-xl border border-slate-200 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Apples"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Category</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Fruit"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Quantity</label>
            <input
              type="text"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder="e.g. 5"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-24 text-slate-800"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Expiration Date</label>
            <input
              type="date"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="e.g. 3.99"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-24 text-slate-800"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            Add
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500">Loading inventory...</p>
      ) : items.length === 0 ? (
        <div className="p-6 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 h-40">
          <span className="text-4xl mb-2">📦</span>
          <p className="font-medium">No items in your pantry yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort(2)}>
                  Name {sortColumn === 2 ? (ascending ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort(1)}>
                  Category {sortColumn === 1 ? (ascending ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort(0)}>
                  Days Until Expiry {sortColumn === 0 ? (ascending ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort(3)}>
                  Added {sortColumn === 3 ? (ascending ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.category}</td>
                  <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">${(item.price ?? 0).toFixed(2)}</td>
                  <td className={`px-4 py-3 ${expiryInfo(item.expiration_date).color}`}>
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={editExpiry}
                          onChange={(e) => setEditExpiry(e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded text-sm text-slate-800"
                        />
                        <button
                          onClick={() => handleUpdateExpiry(item)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditExpiry(""); }}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => { setEditingId(item.id); setEditExpiry(item.expiration_date); }}
                        title="Click to edit"
                      >
                        {expiryInfo(item.expiration_date).label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}