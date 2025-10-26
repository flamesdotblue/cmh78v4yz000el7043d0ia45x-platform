import Spline from '@splinetool/react-spline';

function formatCurrency(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0);
}

export default function Hero({ stats }) {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative h-[280px] md:h-[360px] rounded-2xl overflow-hidden ring-1 ring-rose-200/60 bg-rose-100">
          <Spline
            scene="https://prod.spline.design/Tddl75W6Ij9Qp77j/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rose-100/70 via-transparent to-transparent" />
        </div>
        <div className="py-2">
          <h1 className="text-3xl md:text-4xl font-bold text-rose-800">Cafe Billing</h1>
          <p className="mt-2 text-rose-900/80">
            Quick orders, simple menu management, and clear history — all in one place.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Today" value={formatCurrency(stats?.todaySales)} />
            <Stat label="Orders Today" value={stats?.countToday ?? 0} />
            <Stat label="Total Sales" value={formatCurrency(stats?.totalSales)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-rose-200/60 p-4">
      <div className="text-xs uppercase tracking-wide text-rose-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-rose-800">{value}</div>
    </div>
  );
}
