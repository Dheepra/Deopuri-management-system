import { useMemo, useState } from 'react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getPatients } from '../../services/patients.js';

// Appointment status → pill styling + emoji.
const statusMeta = (s) => {
  switch (s) {
    case 'BOOKED':
      return { label: 'Booked', emoji: '📘', pill: 'bg-sky-50 text-sky-700 ring-sky-200' };
    case 'CONFIRMED':
      return { label: 'Confirmed', emoji: '⏳', pill: 'bg-amber-50 text-amber-700 ring-amber-200' };
    case 'COMPLETED':
      return { label: 'Completed', emoji: '✅', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
    case 'CANCELLED':
      return { label: 'Cancelled', emoji: '❌', pill: 'bg-red-50 text-red-700 ring-red-200' };
    default:
      return { label: s || '—', emoji: '•', pill: 'bg-ink-100 text-ink-600 ring-ink-200' };
  }
};

const genderEmoji = (g) => {
  const k = (g || '').toLowerCase();
  if (k.startsWith('m')) return '👨';
  if (k.startsWith('f')) return '👩';
  return '🧑';
};

const DATE_FILTERS = [
  { key: 'all', label: 'All', emoji: '📅' },
  { key: 'past', label: 'Past', emoji: '⏮️' },
  { key: 'today', label: 'Today', emoji: '📍' },
  { key: 'future', label: 'Upcoming', emoji: '⏭️' },
];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// lastVisit may arrive as ISO (2026-07-18), dd/mm/yyyy or dd-mm-yyyy — parse all safely.
const parseVisit = (s) => {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Bucket a visit date relative to today: past / today / future (unknown if unparseable).
const dateBucket = (s, today) => {
  const d = parseVisit(s);
  if (!d) return 'unknown';
  const t = startOfDay(d).getTime();
  if (t < today) return 'past';
  if (t > today) return 'future';
  return 'today';
};

function StatTile({ emoji, label, value, tone = 'ink', delay = 0 }) {
  const tones = { ink: 'text-ink-900', green: 'text-brand-700', blue: 'text-blue-700', pink: 'text-pink-600' };
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-500"><span>{emoji}</span>{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export default function Patients() {
  const { data, loading } = useAsyncData((opts) => getPatients(opts));
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const today = useMemo(() => startOfDay(new Date()).getTime(), []);

  // Count patients per date bucket (from full data) so the chips can show totals.
  const dateCounts = useMemo(() => {
    const list = data ?? [];
    const c = { all: list.length, past: 0, today: 0, future: 0 };
    list.forEach((p) => {
      const b = dateBucket(p?.lastVisit, today);
      if (c[b] != null) c[b] += 1;
    });
    return c;
  }, [data, today]);

  const rows = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      const matchesSearch =
        !q
        || (p?.name || '').toLowerCase().includes(q)
        || (p?.doctorName || '').toLowerCase().includes(q)
        || (p?.mobile || '').toLowerCase().includes(q);
      const matchesDate = dateFilter === 'all' || dateBucket(p?.lastVisit, today) === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [data, search, dateFilter, today]);

  const stats = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      male: list.filter((p) => (p?.gender || '').toLowerCase().startsWith('m')).length,
      female: list.filter((p) => (p?.gender || '').toLowerCase().startsWith('f')).length,
      repeat: list.filter((p) => Number(p?.totalVisits) > 1).length,
    };
  }, [data]);

  return (
    <section className="animate-fade-up space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">🧑‍🤝‍🧑 Patients</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            🩺 Patient records
          </h1>
          <p className="mt-1 text-sm text-ink-600">Everyone who booked an appointment — search by patient, doctor or mobile.</p>
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search patient, doctor, mobile"
          className="sm:w-72"
        />
      </header>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile emoji="🧑‍🤝‍🧑" label="Total patients" value={stats.total} tone="green" delay={0} />
        <StatTile emoji="👨" label="Male" value={stats.male} tone="blue" delay={60} />
        <StatTile emoji="👩" label="Female" value={stats.female} tone="pink" delay={120} />
        <StatTile emoji="🔁" label="Repeat visitors" value={stats.repeat} tone="ink" delay={180} />
      </div>

      {/* Date filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setDateFilter(f.key)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
              dateFilter === f.key
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-ink-700 ring-ink-200 hover:bg-ink-50',
            ].join(' ')}
          >
            {f.emoji} {f.label}
            <span className={`rounded-full px-1.5 text-[10px] ${dateFilter === f.key ? 'bg-white/25' : 'bg-ink-100 text-ink-500'}`}>
              {dateCounts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Records table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">🧑‍🤝‍🧑</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No patients found</p>
          <p className="text-xs text-ink-400">Patients appear here once they book an appointment.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3 font-semibold">🧑 Patient</th>
                  <th className="px-4 py-3 text-center font-semibold">🎂 Age</th>
                  <th className="px-4 py-3 font-semibold">⚧ Gender</th>
                  <th className="px-4 py-3 font-semibold">👨‍⚕️ Doctor</th>
                  <th className="px-4 py-3 font-semibold">📅 Last visit</th>
                  <th className="px-4 py-3 text-center font-semibold">🔢 Visits</th>
                  <th className="px-4 py-3 text-center font-semibold">📌 Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {rows.map((p, i) => {
                  const name = (p?.name || 'Unknown').trim();
                  const initial = name.charAt(0).toUpperCase() || 'P';
                  return (
                    <tr
                      key={p?.id ?? i}
                      style={{ animationDelay: `${Math.min(i, 15) * 35}ms` }}
                      className="animate-fade-up transition-colors hover:bg-ink-50/50"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                            {initial}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-900">{name}</p>
                            <p className="truncate text-xs text-ink-400">📱 {p?.mobile || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-ink-700">{p?.age ?? '—'}</td>
                      <td className="px-4 py-2.5 text-ink-700">{genderEmoji(p?.gender)} {p?.gender || '—'}</td>
                      <td className="px-4 py-2.5 text-ink-700">{p?.doctorName || '—'}</td>
                      <td className="px-4 py-2.5 text-ink-600">{p?.lastVisit || '—'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">{p?.totalVisits ?? 0}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {p?.status ? (
                          (() => {
                            const m = statusMeta(p.status);
                            return (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
                                <span>{m.emoji}</span>{m.label}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-ink-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
