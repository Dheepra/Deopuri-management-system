const REPORTS = [
  { name: 'Blood Test', status: 'Completed', emoji: '🩸' },
  { name: 'X-Ray', status: 'Pending', emoji: '🦴' },
  { name: 'ECG', status: 'Completed', emoji: '❤️' },
  { name: 'Urine Test', status: 'Completed', emoji: '🧪' },
  { name: 'MRI Scan', status: 'Pending', emoji: '🧠' },
  { name: 'Lipid Profile', status: 'Completed', emoji: '💧' },
];

const statusPill = (s) =>
  s === 'Completed'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : 'bg-amber-50 text-amber-700 ring-amber-200';

export default function Reports() {
  return (
    <section className="animate-fade-up space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">📊 Reports</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">🧾 Lab reports</h1>
        <p className="mt-1 text-sm text-ink-600">Diagnostic tests and their current status.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r, i) => (
          <div
            key={r.name}
            style={{ animationDelay: `${Math.min(i, 9) * 45}ms` }}
            className="animate-fade-up flex items-center justify-between gap-3 rounded-2xl border border-ink-200/70 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink-50 text-xl">{r.emoji}</span>
              <div className="min-w-0">
                <p className="truncate font-bold text-ink-900">{r.name}</p>
                <p className="text-xs text-ink-500">Diagnostic test</p>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusPill(r.status)}`}>
              {r.status === 'Completed' ? '✅' : '⏳'} {r.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
