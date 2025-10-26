import { useMemo, useState } from 'react';

function formatCurrency(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0);
}

export default function OrderBuilder({ menuItems, onSave }) {
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]); // {id, name, price, qty, note}
  const [customerName, setCustomerName] = useState('');
  const [payment, setPayment] = useState('Cash');
  const [taxRate, setTaxRate] = useState(0.08);

  const selected = useMemo(() => menuItems.find((m) => m.id === selectedId), [menuItems, selectedId]);

  const addItem = () => {
    if (!selected) return;
    if (qty <= 0) return;
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === selected.id && (note || '') === (p.note || ''));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [
        { id: selected.id, name: selected.name, price: selected.price, qty, note: note.trim() || undefined },
        ...prev,
      ];
    });
    setQty(1);
    setNote('');
    setSelectedId('');
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQty = (index, newQty) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, qty: Math.max(1, newQty) } : it)));
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax = +(subtotal * taxRate).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    return { subtotal, tax, total };
  }, [items, taxRate]);

  const save = () => {
    if (items.length === 0) return;
    const order = {
      items,
      customerName: customerName.trim() || 'Guest',
      paymentMethod: payment,
      subtotal: +totals.subtotal.toFixed(2),
      tax: totals.tax,
      total: totals.total,
      status: 'Paid',
    };
    onSave(order);
    // reset
    setItems([]);
    setCustomerName('');
    setPayment('Cash');
  };

  const categories = useMemo(() => {
    const set = new Set(menuItems.map((m) => m.category || 'Other'));
    return ['All', ...Array.from(set)];
  }, [menuItems]);
  const [cat, setCat] = useState('All');

  const visibleMenu = useMemo(() => {
    return menuItems.filter((m) => (cat === 'All' ? true : (m.category || 'Other') === cat));
  }, [menuItems, cat]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl bg-white ring-1 ring-rose-200/60 p-5">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="text-sm text-rose-700">Category</label>
              <select
                className="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-rose-700">Menu Item</label>
              <select
                className="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Select an item</option>
                {visibleMenu.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} - {formatCurrency(m.price)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-rose-700">Qty</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-24 rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value || '1'))}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-rose-700">Note (optional)</label>
              <input
                className="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Less ice, oat milk, etc."
              />
            </div>
            <div className="md:self-end">
              <button
                onClick={addItem}
                className="w-full md:w-auto rounded-md bg-rose-600 text-white px-4 py-2 font-medium shadow hover:bg-rose-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-rose-200/60 p-5">
          <h2 className="text-lg font-semibold text-rose-800">Items</h2>
          {items.length === 0 ? (
            <div className="text-sm text-rose-600/80 py-8 text-center">No items yet. Add from the menu above.</div>
          ) : (
            <div className="mt-3 divide-y divide-rose-100">
              {items.map((it, idx) => (
                <div key={idx} className="py-3 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-rose-900">{it.name} {it.note ? <span className="text-xs text-rose-500">({it.note})</span> : null}</div>
                    <div className="text-xs text-rose-500">{formatCurrency(it.price)} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      className="w-20 rounded-md border border-rose-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      value={it.qty}
                      onChange={(e) => updateQty(idx, parseInt(e.target.value || '1'))}
                    />
                    <div className="w-24 text-right font-semibold text-rose-800">
                      {formatCurrency(it.price * it.qty)}
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="px-3 py-1.5 rounded-md bg-rose-600 text-white text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="rounded-2xl bg-white ring-1 ring-rose-200/60 p-5 sticky top-24">
          <h2 className="text-lg font-semibold text-rose-800">Checkout</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-sm text-rose-700">Customer</label>
              <input
                className="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Guest"
              />
            </div>
            <div>
              <label className="text-sm text-rose-700">Payment</label>
              <select
                className="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Online</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-rose-700">Tax Rate</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  className="w-28 rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value || '0'))}
                />
                <span className="text-sm text-rose-500">e.g. 0.08 = 8%</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-rose-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-rose-600">Subtotal</span><span className="font-medium text-rose-800">{formatCurrency(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-rose-600">Tax</span><span className="font-medium text-rose-800">{formatCurrency(totals.tax)}</span></div>
              <div className="mt-2 border-t border-rose-200 pt-2 flex justify-between text-base"><span className="font-semibold text-rose-700">Total</span><span className="font-bold text-rose-900">{formatCurrency(totals.total)}</span></div>
            </div>

            <button
              onClick={save}
              disabled={items.length === 0}
              className="w-full rounded-md bg-rose-600 text-white py-2 font-medium shadow hover:bg-rose-700 disabled:opacity-50"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
