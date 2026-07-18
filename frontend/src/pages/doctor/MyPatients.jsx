import { useMemo, useState } from 'react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMyAppointments } from '../../services/doctorAppointments.js';

const AVATAR_GRADIENTS = [
  'from-brand-500 to-brand-700', 'from-sky-500 to-blue-600', 'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600', 'from-pink-500 to-rose-600',
];

const statusMeta = (s) => {
  switch (s) {
    case 'BOOKED': return { label: 'Booked', emoji: '🆕', pill: 'bg-amber-50 text-amber-700 ring-amber-200' };
    case 'CONFIRMED': return { label: 'Confirmed', emoji: '✅', pill: 'bg-sky-50 text-sky-700 ring-sky-200' };
    case 'COMPLETED': return { label: 'Completed', emoji: '🎉', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
    case 'CANCELLED': return { label: 'Cancelled', emoji: '❌', pill: 'bg-red-50 text-red-700 ring-red-200' };
    default: return { label: s || '—', emoji: '•', pill: 'bg-ink-100 text-ink-600 ring-ink-200' };
  }
};

// Collapse the doctor's appointments into one row per unique patient (keyed by mobile, else name).
function toPatients(appointments) {
  const byKey = new Map();
  for (const a of appointments) {
    const key = (a.patientMobile && a.patientMobile.trim()) || `name:${(a.patientName || '').toLowerCase()}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(a);
  }

  return [...byKey.values()].map((visits) => {
    const latest = [...visits].sort((x, y) => {
      const dx = `${x.appointmentDate} ${x.appointmentTime}`;
      const dy = `${y.appointmentDate} ${y.appointmentTime}`;
      return dx < dy ? 1 : dx > dy ? -1 : 0;
    })[0];
    const seenCount = visits.filter((v) => v.status === 'COMPLETED').length;
    return {
      id: latest.id,
      name: latest.patientName,
      mobile: latest.patientMobile,
      age: latest.patientAge,
      gender: latest.patientGender,
      lastVisit: latest.appointmentDate,
      lastStatus: latest.status,
      totalVisits: visits.length,
      seenCount,
    };
  });
}

export default function MyPatients() {
  const { data, loading } = useAsyncData(() => getMyAppointments());
  const [search, setSearch] = useState('');

  const patients = useMemo(() => {
    const list = toPatients(data ?? []);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.mobile || '').toLowerCase().includes(q));
  }, [data, search]);

  return (
    <section className="animate-fade-up space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">🧑‍🤝‍🧑 My patients</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            👥 Patients
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-700">{toPatients(data ?? []).length}</span>
          </h1>
          <p className="mt-1 text-sm text-ink-600">Everyone who booked with you. “Seen” counts visits you marked done.</p>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search patient or mobile" className="sm:w-72" />
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-100" />)}
        </div>
      ) : patients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">🧑‍🤝‍🧑</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No patients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {patients.map((p, i) => {
            const initial = (p.name || 'P').charAt(0).toUpperCase();
            const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            const m = statusMeta(p.lastStatus);
            return (
              <div
                key={p.id ?? i}
                style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                className="group animate-fade-up rounded-2xl border border-ink-200/70 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-lg font-bold text-white transition-transform group-hover:scale-110`}>
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-900">{p.name || 'Patient'}</p>
                    <p className="truncate text-xs text-ink-500">
                      {[p.age && `${p.age}y`, p.gender, p.mobile].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>{m.label}</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-50 pt-3 text-center">
                  <div className="rounded-lg bg-ink-50 py-1.5">
                    <p className="text-[10px] font-semibold text-ink-400">🔁 Visits</p>
                    <p className="text-sm font-bold text-ink-800">{p.totalVisits ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 py-1.5">
                    <p className="text-[10px] font-semibold text-emerald-600">✅ Seen</p>
                    <p className="text-sm font-bold text-emerald-700">{p.seenCount ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-ink-50 py-1.5">
                    <p className="text-[10px] font-semibold text-ink-400">📅 Last</p>
                    <p className="truncate text-xs font-bold text-ink-800">{p.lastVisit || '—'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
