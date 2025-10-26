import { useMemo, useState } from 'react';

function formatCurrency(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0);
}

export default function MenuManager({ items, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState({ name: '', price: '', category: 'Drinks' });
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: 'Drinks' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  const submit = (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.name || isNaN(price)) return;
    onAdd({ name: form.name, price, category: form.category });
    setForm({ name: '', price: '', category: 'Drinks' });
  };

  const beginEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, price: item.price, category: item.category || 'Drinks' });
  };

  const saveEdit = () => {
    const price = parseFloat(editForm.price);
    if (!editForm.name || isNaN(price)) return;
    onUpdate(editingId, { ...editForm, price });
    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="rounded-2xl bg-white ring-1 ring-rose-200/60 p-5">
          <h2 className="text-lg font-semibold text-rose-800">Add Menu Item</h2>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <div>
              <label className="text-sm text-rose-700">Name</label>
              <input
                className="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Brown Sugar Boba"
              />
            </div>
            <div>
              <label className="text-sm text-rose-700">Price</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="4.50"
              />
            </div>
            <div>
              <label className="text-sm text-rose-700">Category</label>
              <select
                className="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option>Drinks</option>
                <option>Food</option>
                <option>Dessert</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-rose-600 text-white py-2 font-medium shadow hover:bg-rose-700"
            >
              Add Item
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-2xl bg-white ring-1 ring-rose-200/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="text-lg font-semibold text-rose-800">Menu Items</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category"
              className="rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="mt-4 divide-y divide-rose-100">
            {filtered.length === 0 && (
              <div className="text-sm text-rose-600/80 py-8 text-center">No items yet. Add your first one!</div>
            )}
            {filtered.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-3">
                {editingId === item.id ? (
                  <>
                    <input
                      className="rounded-md border border-rose-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="w-24 rounded-md border border-rose-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      value={editForm.price}
                      onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    />
                    <select
                      className="rounded-md border border-rose-200 px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                      value={editForm.category}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                    >
                      <option>Drinks</option>
                      <option>Food</option>
                      <option>Dessert</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-md bg-slate-200 text-slate-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium text-rose-900">{item.name}</div>
                      <div className="text-xs text-rose-500">{item.category || 'Other'}</div>
                    </div>
                    <div className="w-24 text-right font-semibold text-rose-800">{formatCurrency(item.price)}</div>
                    <div className="ml-2 flex items-center gap-2">
                      <button
                        onClick={() => beginEdit(item)}
                        className="px-3 py-1.5 rounded-md bg-rose-100 text-rose-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="px-3 py-1.5 rounded-md bg-rose-600 text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
