import { useEffect, useMemo, useState } from 'react';
import Hero from './components/Hero';
import MenuManager from './components/MenuManager';
import OrderBuilder from './components/OrderBuilder';
import OrderHistory from './components/OrderHistory';

function App() {
  const [activeTab, setActiveTab] = useState('order'); // 'order' | 'menu' | 'history'
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);

  // Load persisted data
  useEffect(() => {
    try {
      const m = JSON.parse(localStorage.getItem('cafe_menu') || '[]');
      const o = JSON.parse(localStorage.getItem('cafe_orders') || '[]');
      if (Array.isArray(m)) setMenuItems(m);
      if (Array.isArray(o)) setOrders(o);
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem('cafe_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('cafe_orders', JSON.stringify(orders));
  }, [orders]);

  const addMenuItem = (item) => {
    setMenuItems((prev) => [{ ...item, id: crypto.randomUUID() }, ...prev]);
  };

  const updateMenuItem = (id, patch) => {
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const deleteMenuItem = (id) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  const saveOrder = (orderDraft) => {
    const now = new Date();
    const order = {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      ...orderDraft,
    };
    setOrders((prev) => [order, ...prev]);
    setActiveTab('history');
    return order.id;
  };

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    let todaySales = 0;
    let totalSales = 0;
    let countToday = 0;
    orders.forEach((o) => {
      totalSales += o.total;
      if (o.createdAt.slice(0, 10) === todayStr) {
        todaySales += o.total;
        countToday += 1;
      }
    });
    return { todaySales, totalSales, countToday };
  }, [orders]);

  return (
    <div className="min-h-screen bg-rose-50 text-slate-800">
      <Hero stats={stats} />

      <div className="sticky top-0 z-20 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-rose-100">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-2 py-2">
            <TabButton label="Create Order" active={activeTab === 'order'} onClick={() => setActiveTab('order')} />
            <TabButton label="Menu" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
            <TabButton label="Order History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'order' && (
          <OrderBuilder menuItems={menuItems} onSave={saveOrder} />
        )}
        {activeTab === 'menu' && (
          <MenuManager
            items={menuItems}
            onAdd={addMenuItem}
            onUpdate={updateMenuItem}
            onDelete={deleteMenuItem}
          />
        )}
        {activeTab === 'history' && (
          <OrderHistory orders={orders} onNewOrder={() => setActiveTab('order')} />
        )}
      </main>

      <footer className="border-t border-rose-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Cafe Billing</span>
          <span>Fast, simple billing for your cafe</span>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
        (active
          ? 'bg-rose-600 text-white shadow'
          : 'text-rose-700 hover:bg-rose-100')
      }
    >
      {label}
    </button>
  );
}

export default App;
