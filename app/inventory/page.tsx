"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  sortBy,
  addItem,
  removeItem,
  markAsExpired,
  updateExpiry,
  updateQuantity,
  updatePrice,
  type InventoryItemRecord,
  type StandardUnit,
} from "@/lib/supabase/interface";

// sortBy indices: 0 = expiration_date, 1 = category, 2 = name, 3 = created_at
type UnitOption = {
  key: string;
  label: string;
  userUnit: string;
  standardUnit: StandardUnit;
};

const UNIT_OPTIONS: UnitOption[] = [
  { key: "ml", label: "ml", userUnit: "ml", standardUnit: "ml" },
  { key: "l", label: "L", userUnit: "L", standardUnit: "ml" },
  { key: "g", label: "g", userUnit: "g", standardUnit: "g" },
  { key: "kg", label: "kg", userUnit: "kg", standardUnit: "g" },
  { key: "count", label: "count", userUnit: "count", standardUnit: "count" },
  { key: "pcs", label: "pcs", userUnit: "pcs", standardUnit: "count" },
  { key: "oz", label: "oz", userUnit: "oz", standardUnit: "g" },
  { key: "lb", label: "lb", userUnit: "lb", standardUnit: "g" },
  { key: "cup", label: "cup", userUnit: "cup", standardUnit: "ml" },
  { key: "tbsp", label: "tbsp", userUnit: "tbsp", standardUnit: "ml" },
];

function getSuggestedUnitKeys(category: string, itemName: string): string[] {
  const c = category.toLowerCase();
  const n = itemName.toLowerCase();

  const liquidHints = ["milk", "juice", "soda", "water", "broth", "oil", "drink", "beverage", "yogurt"];
  const countHints = ["egg", "eggs", "banana", "apple", "avocado", "onion", "potato", "can", "bottle"];

  if (
    c.includes("drink") ||
    c.includes("beverage") ||
    c.includes("dairy") ||
    c.includes("liquid") ||
    liquidHints.some((h) => n.includes(h))
  ) {
    return ["ml", "l", "cup"];
  }

  if (
    c.includes("produce") ||
    c.includes("meat") ||
    c.includes("grain") ||
    c.includes("baking") ||
    c.includes("bulk")
  ) {
    return ["g", "kg", "oz", "lb"];
  }

  if (c.includes("count") || countHints.some((h) => n.includes(h))) {
    return ["count", "pcs"];
  }

  return ["count", "g", "ml"];
}

function formatAmount(value: number | null, unit: string | null) {
  const numeric = Number(value ?? 0);
  const pretty = Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/\.00$/, "");
  return `${pretty} ${unit ?? ""}`.trim();
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItemRecord[]>([]);
  const [sortColumn, setSortColumn] = useState(0);
  const [ascending, setAscending] = useState(true);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnitKey, setNewUnitKey] = useState("count");
  const [newPrice, setNewPrice] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editExpiry, setEditExpiry] = useState("");

  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const [removeTarget, setRemoveTarget] = useState<InventoryItemRecord | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sortBy(sortColumn, ascending);
      setItems(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [sortColumn, ascending]);

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

  const suggestedKeys = useMemo(() => getSuggestedUnitKeys(newCategory, newName), [newCategory, newName]);
  const availableUnitOptions = useMemo(
    () => [
      ...UNIT_OPTIONS.filter((u) => suggestedKeys.includes(u.key)),
      ...UNIT_OPTIONS.filter((u) => !suggestedKeys.includes(u.key)),
    ],
    [suggestedKeys],
  );
  const selectedUnit =
    availableUnitOptions.find((u) => u.key === newUnitKey) ?? availableUnitOptions[0] ?? UNIT_OPTIONS[0];

  useEffect(() => {
    if (!availableUnitOptions.some((u) => u.key === newUnitKey)) {
      setNewUnitKey(availableUnitOptions[0]?.key ?? "count");
    }
  }, [newUnitKey, availableUnitOptions]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);

    if (!newName || !newCategory || !newQuantity || !newExpiry) {
      setAddError("Please fill all required fields.");
      return;
    }

    const quantity = Number(newQuantity);
    const price = newPrice ? Number(newPrice) : null;

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setAddError("Quantity must be a positive number.");
      return;
    }
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setAddError("Price must be zero or a positive number.");
      return;
    }

    try {
      await addItem({
        name: newName,
        category: newCategory,
        quantity,
        userUnit: selectedUnit.userUnit,
        standardUnit: selectedUnit.standardUnit,
        price,
        expirationDate: newExpiry,
      });

      setNewName("");
      setNewCategory("");
      setNewQuantity("");
      setNewUnitKey("count");
      setNewPrice("");
      setNewExpiry("");
      setNewPrice("");
      setShowAddForm(false);
      await fetchItems();
    } catch (err) {
      console.error("Failed to add item:", err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message ?? "Unknown error")
          : "Unknown error";
      setAddError(message);
    }
  }

  async function handleRemove(item: InventoryItemRecord) {
    setRemoveTarget(item);
  }

  async function handleRemoveChoice(choice: "used" | "expired") {
    if (!removeTarget) return;
    try {
      if (choice === "used") {
        await removeItem(removeTarget.id);
      } else {
        await markAsExpired(removeTarget.id);
      }
      setRemoveTarget(null);
      await fetchItems();
    } catch (err) {
      console.error("Failed to remove item:", err);
      setRemoveTarget(null);
    }
  }

  async function handleUpdateExpiry(item: InventoryItemRecord) {
    if (!editExpiry) return;
    try {
      await updateExpiry(item.id, editExpiry);
      setEditingId(null);
      setEditExpiry("");
      await fetchItems();
    } catch (err) {
      console.error("Failed to update expiry:", err);
    }
  }

  async function handleUpdateQuantity(item: InventoryItemRecord) {
    const qty = Number(editQty);
    if (!Number.isFinite(qty) || qty < 0) return;
    try {
      await updateQuantity(item.id, qty);
      setEditingQtyId(null);
      setEditQty("");
      await fetchItems();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  }

  async function handleUpdatePrice(item: InventoryItemRecord) {
    const price = editPrice === "" ? null : Number(editPrice);
    if (price !== null && (!Number.isFinite(price) || price < 0)) return;
    try {
      await updatePrice(item.id, price);
      setEditingPriceId(null);
      setEditPrice("");
      await fetchItems();
    } catch (err) {
      console.error("Failed to update price:", err);
    }
  }

  function expiryInfo(dateStr: string | null) {
    if (!dateStr) {
      return { color: "text-slate-400", label: "No expiry set" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(dateStr);
    if (Number.isNaN(expiry.getTime())) {
      return { color: "text-slate-400", label: "No expiry set" };
    }

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">My Pantry</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            {showAddForm ? "Cancel" : "+ Add Item"}
          </button>
          <select
            value={sortColumn}
            onChange={(e) => setSortColumn(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {sortLabels.map((label, i) => (
              <option key={i} value={i}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setAscending((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {ascending ? "Asc ↑" : "Desc ↓"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-500">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Apples"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-500">Category</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Fruit"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-500">Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder="e.g. 5.00"
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-500">Unit</label>
            <select
              value={selectedUnit.key}
              onChange={(e) => setNewUnitKey(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
              required
            >
              {availableUnitOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {suggestedKeys.includes(option.key) ? `Suggested: ${option.label}` : option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Stored as: {newQuantity || "0"} {selectedUnit.userUnit}
            </p>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-500">Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="e.g. 6.49"
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-500">Expiration Date</label>
            <input
              type="date"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
              required
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Add
          </button>

          {addError && <p className="mt-2 w-full text-sm text-red-600">Failed to add item: {addError}</p>}
        </form>
      )}

      {loading ? (
        <p className="text-slate-500">Loading inventory...</p>
      ) : items.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 text-slate-400">
          <span className="mb-2 text-4xl">📦</span>
          <p className="font-medium">No items in your pantry yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th
                  className="cursor-pointer select-none px-4 py-3 hover:text-slate-900"
                  onClick={() => handleSort(2)}
                >
                  Name {sortColumn === 2 ? (ascending ? "↑" : "↓") : ""}
                </th>
                <th
                  className="cursor-pointer select-none px-4 py-3 hover:text-slate-900"
                  onClick={() => handleSort(1)}
                >
                  Category {sortColumn === 1 ? (ascending ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Price</th>
                <th
                  className="cursor-pointer select-none px-4 py-3 hover:text-slate-900"
                  onClick={() => handleSort(0)}
                >
                  Days Until Expiry {sortColumn === 0 ? (ascending ? "↑" : "↓") : ""}
                </th>
                <th
                  className="cursor-pointer select-none px-4 py-3 hover:text-slate-900"
                  onClick={() => handleSort(3)}
                >
                  Added {sortColumn === 3 ? (ascending ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="bg-white transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.category ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {editingQtyId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateQuantity(item);
                            if (e.key === "Escape") { setEditingQtyId(null); setEditQty(""); }
                          }}
                        />
                        <span className="text-xs text-slate-400">{item.user_unit ?? ""}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item)}
                          className="text-xs font-medium text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingQtyId(null); setEditQty(""); }}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => {
                          setEditingQtyId(item.id);
                          setEditQty(String(item.current_quantity ?? 0));
                        }}
                        title="Click to edit quantity"
                      >
                        {formatAmount(item.current_quantity, item.user_unit)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {editingPriceId === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdatePrice(item);
                            if (e.key === "Escape") { setEditingPriceId(null); setEditPrice(""); }
                          }}
                        />
                        <button
                          onClick={() => handleUpdatePrice(item)}
                          className="text-xs font-medium text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingPriceId(null); setEditPrice(""); }}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => {
                          setEditingPriceId(item.id);
                          setEditPrice(item.price != null ? String(item.price) : "");
                        }}
                        title="Click to edit price"
                      >
                        {item.price == null ? "—" : `$${Number(item.price).toFixed(2)}`}
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-3 ${expiryInfo(item.expiration_date).color}`}>
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={editExpiry}
                          onChange={(e) => setEditExpiry(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
                        />
                        <button
                          onClick={() => handleUpdateExpiry(item)}
                          className="text-xs font-medium text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditExpiry("");
                          }}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditExpiry(item.expiration_date ?? "");
                        }}
                        title="Click to edit"
                      >
                        {expiryInfo(item.expiration_date).label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
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

      {/* Remove Item Modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Remove &ldquo;{removeTarget.name}&rdquo;</h3>
            <p className="text-sm text-slate-500 mb-6">Was this item used up or did it expire?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRemoveChoice("used")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
              >
                ✅ Used
              </button>
              <button
                onClick={() => handleRemoveChoice("expired")}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition"
              >
                🗑️ Expired
              </button>
            </div>
            <button
              onClick={() => setRemoveTarget(null)}
              className="mt-3 w-full text-sm text-slate-400 hover:text-slate-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
