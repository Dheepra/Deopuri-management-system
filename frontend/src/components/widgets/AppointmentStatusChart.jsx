import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  Scheduled: 'var(--color-brand-600)',
  Completed: 'var(--color-brand-300)',
  'No-show': '#f59e0b',
  Cancelled: '#dc2626',
};

function TooltipBody({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-ink-100 bg-white/95 px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink-900">{name}</p>
      <p className="text-ink-600">{value} appointments</p>
    </div>
  );
}

export default function AppointmentStatusChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <section className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
      <header className="mb-3">
        <h3 className="font-display text-lg font-semibold text-ink-900">
          Today’s appointments
        </h3>
        <p className="text-xs text-ink-500">Distribution by status</p>
      </header>

      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={88}
              paddingAngle={3}
              stroke="white"
              strokeWidth={3}
              animationDuration={650}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<TooltipBody />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-ink-900">{total}</p>
            <p className="text-xs text-ink-500">total today</p>
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-700">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: COLORS[entry.name] ?? '#94a3b8' }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-ink-900">{entry.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
