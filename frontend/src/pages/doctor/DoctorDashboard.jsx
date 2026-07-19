import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getProfile } from '../../services/profile.js';
import { getMyAppointments, setAppointmentStatus } from '../../services/doctorAppointments.js';
import { fetchProducts } from '../../services/products.js';
import { heroImage } from '../../assets/picture';

const productImg = (u) => (u ? (u.startsWith('http') ? u : `http://localhost:8080${u}`) : '/placeholder.png');

// Rotating soft tags for the recommended-medicines cards (feels editorial, not like an ad).
const PROMO_TAGS = ['🔥 Trending', '💊 Popular', '⭐ Recommended', '🌿 Herbal pick', '🩺 Doctor’s choice', '✨ New'];

const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function Kpi({ emoji, label, value, sub, iconTint, loading }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-300 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-14 animate-pulse rounded bg-ink-100" />
          ) : (
            <p className="mt-1 text-3xl font-bold text-ink-900">{value}</p>
          )}
          {sub && <p className="mt-1 text-[11px] font-medium text-ink-400">{sub}</p>}
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl ${iconTint}`}>{emoji}</span>
      </div>
    </motion.div>
  );
}

export default function DoctorDashboard() {
  const { data: profile } = useAsyncData(() => getProfile());
  const { data, loading, refresh } = useAsyncData(() => getMyAppointments());
  const products = useAsyncData(() => fetchProducts());
  const [busyId, setBusyId] = useState(null);

  const rows = useMemo(() => data ?? [], [data]);
  const today = new Date().toISOString().slice(0, 10);

  const toSeeToday = useMemo(
    () => rows.filter((a) => a.status === 'CONFIRMED' && a.appointmentDate === today),
    [rows, today],
  );
  const seenToday = useMemo(
    () => rows.filter((a) => a.status === 'COMPLETED' && a.appointmentDate === today).length,
    [rows, today],
  );
  const uniquePatients = useMemo(
    () => new Set(rows.map((a) => a.patientMobile || a.patientName)).size,
    [rows],
  );
  const upcoming = useMemo(() => rows.filter((a) => a.status === 'CONFIRMED').length, [rows]);

  const firstName = (profile?.firstName || '').trim() || 'Doctor';

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', emoji: '🌅' };
    if (h < 17) return { text: 'Good afternoon', emoji: '☀️' };
    return { text: 'Good evening', emoji: '🌙' };
  }, []);
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [],
  );

  // Recommended medicines (real products) — bigger & more prominent for doctors, since they drive
  // what patients buy. Framed as clinical recommendations, not ads.
  const list = useMemo(() => products.data ?? [], [products.data]);
  const recommend = useMemo(() => list.slice(0, 8), [list]);
  const [spot, setSpot] = useState(0);
  useEffect(() => {
    if (recommend.length < 2) return undefined;
    const id = setInterval(() => setSpot((s) => (s + 1) % recommend.length), 3500);
    return () => clearInterval(id);
  }, [recommend.length]);
  const current = recommend.length ? recommend[spot % recommend.length] : null;

  const markSeen = async (appt) => {
    setBusyId(appt.id);
    try {
      await setAppointmentStatus(appt.id, 'COMPLETED');
      toast.success(`Marked ${appt.patientName} as seen`);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update appointment');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-6 text-white shadow-card sm:p-8"
      >
        <div className="bg-grid-dots absolute inset-0 opacity-20" />
        <div className="animate-mesh pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">🩺 Doctor Console</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {greeting.text}, Dr. {firstName} {greeting.emoji}
            </h1>
            <p className="mt-1.5 text-sm text-white/80">📅 {todayLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                🩺 {toSeeToday.length} to see today
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                ✅ {seenToday} seen
              </span>
            </div>
          </div>
          <motion.img
            src={heroImage}
            alt="Deopuri Herbal"
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            whileHover={{ scale: 1.04, rotate: 1 }}
            className="hidden h-32 w-32 shrink-0 rounded-3xl object-cover shadow-2xl ring-4 ring-white/30 sm:block lg:h-40 lg:w-40"
          />
        </div>
      </motion.header>

      {/* KPIs */}
      <motion.section
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <Kpi emoji="🩺" label="To see today" value={loading ? '—' : toSeeToday.length} sub="Approved for today" iconTint="bg-brand-50 text-brand-700" loading={loading} />
        <Kpi emoji="✅" label="Seen today" value={loading ? '—' : seenToday} sub="Marked completed" iconTint="bg-emerald-50 text-emerald-700" loading={loading} />
        <Kpi emoji="👥" label="Total patients" value={loading ? '—' : uniquePatients} sub="All-time" iconTint="bg-sky-50 text-sky-700" loading={loading} />
        <Kpi emoji="⏳" label="Upcoming" value={loading ? '—' : upcoming} sub="Confirmed" iconTint="bg-amber-50 text-amber-700" loading={loading} />
      </motion.section>

      {/* Recommended medicines — prominent, doctor-focused */}
      {current && (
        <section className="rounded-3xl border border-ink-200/70 bg-gradient-to-br from-brand-50/60 via-white to-sky-50/60 p-4 shadow-card sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">💊 Recommended to prescribe</h2>
              <p className="text-xs text-ink-500">Handpicked Deopuri medicines your patients love</p>
            </div>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Updated daily ✨</span>
          </div>

          {/* Spotlight banner */}
          <div className="relative mb-4 overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-4 shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id ?? spot}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-center gap-4"
              >
                <img
                  src={productImg(current.imageUrl)}
                  alt={current.name}
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-lg ring-4 ring-white sm:h-28 sm:w-28"
                  onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                />
                <div className="min-w-0">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">🩺 Doctor’s pick</span>
                  <h3 className="mt-2 truncate font-display text-xl font-bold text-ink-900">{current.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">
                    {current.description || `${current.variants?.length || 0} size${(current.variants?.length || 0) === 1 ? '' : 's'} available`}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    🌿 Safe to suggest to patients
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
            {recommend.length > 1 && (
              <div className="relative mt-4 flex gap-1.5">
                {recommend.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSpot(i)}
                    aria-label={`Show item ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === spot % recommend.length ? 'w-6 bg-brand-500' : 'w-1.5 bg-ink-300'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Grid of recommendations */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {recommend.map((p, i) => (
              <motion.div
                key={p.id ?? i}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-sm"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={productImg(p.imageUrl)}
                    alt={p.name}
                    className="h-24 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink-700 shadow-sm">
                    {PROMO_TAGS[i % PROMO_TAGS.length]}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-sm font-semibold text-ink-900">{p.name}</p>
                  <p className="truncate text-[11px] text-ink-500">🎚️ {p.variants?.length || 0} sizes</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Today's patients — records grid */}
      <section className="rounded-3xl border border-ink-200/70 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-lg">📋</span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Today&apos;s patients</h2>
            <p className="text-xs text-ink-500">
              {toSeeToday.length ? `${toSeeToday.length} to review — mark each once seen` : 'Nothing scheduled for today'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-100" />)}
          </div>
        ) : toSeeToday.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
            <div className="text-4xl">🎉</div>
            <p className="mt-2 text-sm font-semibold text-ink-600">No patients pending today</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {toSeeToday.map((a, i) => (
              <div
                key={a.id ?? i}
                style={{ animationDelay: `${Math.min(i, 9) * 45}ms` }}
                className="animate-fade-up rounded-2xl border border-ink-200/70 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                    {(a.patientName || 'P').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-900">{a.patientName || 'Patient'}</p>
                    <p className="truncate text-xs text-ink-500">🕒 {a.appointmentTime || '—'}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">Confirmed</span>
                </div>
                <button
                  onClick={() => markSeen(a)}
                  disabled={busyId === a.id}
                  className="mt-3 w-full rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97] disabled:opacity-60"
                >
                  {busyId === a.id ? 'Saving…' : '✅ Mark seen'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
