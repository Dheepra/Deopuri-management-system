import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function TooltipBody({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-ink-100 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur">
      <p className="font-semibold text-ink-900">{label}</p>
      <p className="mt-0.5 text-ink-600">
        Admissions:{' '}
        <span className="font-semibold text-brand-700">{payload[0].value}</span>
      </p>
    </div>
  );
}

export default function AdmissionsChart({ data }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900">
            Admissions · last 7 days
          </h3>
          <p className="text-xs text-ink-500">Across all departments</p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
          +12% vs prev week
        </span>
      </header>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 6, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="admissionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--color-ink-400)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-ink-400)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<TooltipBody />} cursor={{ stroke: 'var(--color-brand-300)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-brand-600)"
              strokeWidth={2.5}
              fill="url(#admissionFill)"
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
