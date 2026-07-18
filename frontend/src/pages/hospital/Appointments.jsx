import { useMemo, useState, useEffect } from 'react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getAppointments } from '../../services/hospital.js';
import { http } from '../../services/http.js';
import { whatsappText } from '../../utils/billTools.js';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: 'All', label: 'All', emoji: '📋' },
  { key: 'BOOKED', label: 'Booked', emoji: '🆕' },
  { key: 'CONFIRMED', label: 'Confirmed', emoji: '✅' },
  { key: 'COMPLETED', label: 'Completed', emoji: '🎉' },
  { key: 'CANCELLED', label: 'Cancelled', emoji: '❌' },
];

const statusMeta = (s) => {
  switch (s) {
    case 'BOOKED':
      return { label: 'Booked', emoji: '🆕', pill: 'bg-amber-50 text-amber-700 ring-amber-200' };
    case 'CONFIRMED':
      return { label: 'Confirmed', emoji: '✅', pill: 'bg-sky-50 text-sky-700 ring-sky-200' };
    case 'COMPLETED':
      return { label: 'Completed', emoji: '🎉', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
    case 'CANCELLED':
      return { label: 'Cancelled', emoji: '❌', pill: 'bg-red-50 text-red-700 ring-red-200' };
    default:
      return { label: s || '—', emoji: '•', pill: 'bg-ink-100 text-ink-600 ring-ink-200' };
  }
};

function StatusPill({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
}

function StatTile({ emoji, label, value, tone = 'ink', delay = 0 }) {
  const tones = { ink: 'text-ink-900', green: 'text-brand-700', amber: 'text-amber-600', blue: 'text-blue-700' };
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

const fmtHeaderDate = (d) => {
  if (!d) return 'No date';
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Appointments() {
  const session = JSON.parse(localStorage.getItem('auth.session') || '{}');
  const adminId = session?.userId;

  const { data, loading, refresh } = useAsyncData(() => getAppointments(adminId));

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const handleConfirm = async (appointmentId) => {
    try {
      // Use the shared http instance so the auth token is attached (bare axios
      // sent no Authorization header, so the backend rejected the request).
      await http.patch(
        `/deopuri/appointments/${appointmentId}/status?status=CONFIRMED`
      );
      toast.success('Appointment confirmed');
      refresh();
    } catch (error) {
      console.error('Confirm failed', error);
      toast.error(error?.response?.data?.message || 'Could not confirm appointment');
    }
  };

  // Send the patient a WhatsApp reminder with their appointment details.
  const remind = (a) => {
    const when = [a.appointmentDate, a.appointmentTime].filter(Boolean).join(' ');
    const msg =
      `Hello ${a.patientName || ''}, this is a reminder for your appointment` +
      (a.doctorName ? ` with Dr ${a.doctorName}` : '') +
      (when ? ` on ${when}` : '') +
      `. Please arrive 10 minutes early. Thank you 🙏\n— Powered by Deopuri Herbal 🌿`;
    whatsappText(a.patientMobile, msg);
  };

  // Public "book appointment" link that patients can use to self-book.
  const bookingUrl = `${window.location.origin}/#consult`;
  const copyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking link copied');
    } catch {
      toast(bookingUrl);
    }
  };
  const shareBookingWhatsApp = () =>
    whatsappText('', `📅 Book your appointment online: ${bookingUrl}\n— Deopuri Herbal 🌿`);

  // Live feel: quietly re-poll so new bookings pop in on their own. 20s keeps it
  // fresh without hammering the server (5s was too aggressive).
  useEffect(() => {
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const base = data ?? [];
    return {
      All: base.length,
      BOOKED: base.filter((a) => a.status === 'BOOKED').length,
      CONFIRMED: base.filter((a) => a.status === 'CONFIRMED').length,
      COMPLETED: base.filter((a) => a.status === 'COMPLETED').length,
      CANCELLED: base.filter((a) => a.status === 'CANCELLED').length,
    };
  }, [data]);

  const filteredRows = useMemo(() => {
    const base = data ?? [];
    const q = search.trim().toLowerCase();
    return base.filter((a) => {
      const matchStatus = filter === 'All' || a.status === filter;
      const matchSearch =
        !q
        || a.patientName?.toLowerCase().includes(q)
        || a.doctorName?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [data, filter, search]);

  // Group by date (recent first), sorted by time within each day — an agenda view.
  const grouped = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((a) => {
      const d = a.appointmentDate || 'No date';
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(a);
    });
    for (const arr of map.values()) {
      arr.sort((x, y) => String(x.appointmentTime || '').localeCompare(String(y.appointmentTime || '')));
    }
    return [...map.entries()].sort((a, b) => {
      const da = new Date(a[0]).getTime();
      const db = new Date(b[0]).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return db - da;
    });
  }, [filteredRows]);

  return (
    <section className="animate-fade-up space-y-5 p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">📅 Appointments</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-600">Live schedule — new bookings appear automatically.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyBookingLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm transition-colors hover:bg-ink-50"
          >
            🔗 Copy booking link
          </button>
          <button
            onClick={shareBookingWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
          >
            💬 Share
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile emoji="📋" label="Total" value={counts.All} tone="green" delay={0} />
        <StatTile emoji="🆕" label="To confirm" value={counts.BOOKED} tone="amber" delay={60} />
        <StatTile emoji="✅" label="Confirmed" value={counts.CONFIRMED} tone="blue" delay={120} />
        <StatTile emoji="🎉" label="Completed" value={counts.COMPLETED} tone="ink" delay={180} />
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={(val) => setSearch(val)}
        placeholder="Search patient or doctor…"
      />

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
              filter === f.key
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-ink-700 ring-ink-200 hover:bg-ink-50',
            ].join(' ')}
          >
            {f.emoji} {f.label}
            <span className={`rounded-full px-1.5 text-[10px] ${filter === f.key ? 'bg-white/25' : 'bg-ink-100 text-ink-500'}`}>
              {counts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Agenda */}
      {loading && (data ?? []).length === 0 ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink-100" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">📭</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No appointments here</p>
          <p className="text-xs text-ink-400">New bookings will show up automatically.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, items], gi) => (
            <div key={date} style={{ animationDelay: `${Math.min(gi, 8) * 60}ms` }} className="animate-fade-up">
              <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-white shadow-sm">
                <span>📅</span>
                <h3 className="text-sm font-bold">{fmtHeaderDate(date)}</h3>
                <span className="rounded-full bg-white/25 px-1.5 text-[10px] font-semibold">{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.map((a, i) => {
                  const name = (a?.patientName || 'Unknown').trim();
                  const initial = name.charAt(0).toUpperCase() || 'P';
                  return (
                    <div
                      key={a.id ?? i}
                      style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                      className="group flex animate-fade-up items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
                    >
                      {/* Time chip */}
                      <div className="grid w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-2 py-2 text-white">
                        <p className="text-sm font-bold leading-tight">{a.appointmentTime || '--:--'}</p>
                        <p className="text-[10px] uppercase tracking-wide opacity-80">appt</p>
                      </div>

                      {/* Patient + doctor */}
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                          {initial}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">{name}</p>
                          <p className="truncate text-xs text-ink-500">👨‍⚕️ {a.doctorName || '—'}</p>
                        </div>
                      </div>

                      <StatusPill status={a.status} />

                      {(a.status === 'BOOKED' || a.status === 'CONFIRMED') && a.patientMobile && (
                        <button
                          onClick={() => remind(a)}
                          title="Send WhatsApp reminder"
                          className="shrink-0 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-bold text-white transition hover:brightness-95"
                        >
                          💬
                        </button>
                      )}

                      {a.status === 'BOOKED' && (
                        <button
                          onClick={() => handleConfirm(a.id)}
                          className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97]"
                        >
                          ✅ Confirm
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
