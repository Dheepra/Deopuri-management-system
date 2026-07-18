import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { fetchProducts } from '../../services/products.js';
import { fetchMyOrders } from '../../services/orders.js';
import {
  getAppointments,
  getDoctors,
} from '../../services/hospital.js';
import { getStaff } from '../../services/staff.js';
import { getPatients } from '../../services/patients.js';
import { getLeaves } from '../../services/hospitalLeaves.js';
import { getProfile } from '../../services/profile.js';
import { heroImage } from '../../assets/picture';
import QuickActions from '../../components/widgets/QuickActions.jsx';
import StaffAttendanceCard from '../../components/widgets/StaffAttendanceCard.jsx';

const apptStatus = (s) => {
  switch (s) {
    case 'BOOKED': return { label: 'Booked', pill: 'bg-amber-50 text-amber-700 ring-amber-200' };
    case 'CONFIRMED': return { label: 'Confirmed', pill: 'bg-sky-50 text-sky-700 ring-sky-200' };
    case 'COMPLETED': return { label: 'Completed', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
    case 'CANCELLED': return { label: 'Cancelled', pill: 'bg-red-50 text-red-700 ring-red-200' };
    default: return { label: s || '—', pill: 'bg-ink-100 text-ink-600 ring-ink-200' };
  }
};

const QUICK_ACTIONS = [
  { label: 'New patient', hint: 'Register an admission', to: '/hospital/patients', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6' },
  { label: 'Add doctor', hint: 'Onboard a clinician', to: '/hospital/doctors', icon: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0M19 16v4M21 18h-4' },
  { label: 'Schedule', hint: 'Book an appointment', to: '/hospital/appointments', icon: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18' },
];

// Framer-motion stagger for the KPI row.
const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
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

const productImg = (u) => (u ? (u.startsWith('http') ? u : `http://localhost:8080${u}`) : '/placeholder.png');

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('auth.session') || '{}');
  const adminId = session?.userId;

  const [name, setName] = useState('admin');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await getProfile();
        if (!active) return;
        const full = [p?.firstName, p?.lastName].filter(Boolean).join(' ');
        setName(full || p?.email?.split('@')[0] || 'admin');
      } catch (err) {
        console.log(err);
      }
    })();
    return () => { active = false; };
  }, []);

  const doctors = useAsyncData((opts) => getDoctors(opts));
  const staff = useAsyncData((opts) => getStaff(opts));
  const patients = useAsyncData((opts) => getPatients(opts));
  const leaves = useAsyncData((opts) => getLeaves(opts));

  const appointments = useAsyncData(() => {
    if (!adminId) return Promise.resolve([]);
    return getAppointments(adminId);
  });

  // Real company products, surfaced as a "featured for your pharmacy" spotlight (feels like a curated
  // pick, not an ad) — auto-rotates so there's always something new to catch the eye.
  const productsData = useAsyncData(() => fetchProducts());
  const featured = useMemo(() => (productsData.data ?? []).slice(0, 6), [productsData.data]);
  const [spot, setSpot] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return undefined;
    const id = setInterval(() => setSpot((s) => (s + 1) % featured.length), 4000);
    return () => clearInterval(id);
  }, [featured.length]);

  const current = featured.length ? featured[spot % featured.length] : null;

  // How much the pharmacy still owes — shown softly in the same card (info, not a nag).
  const ordersData = useAsyncData(() => fetchMyOrders().catch(() => []));
  const outstanding = useMemo(() => {
    const seen = new Set();
    let sum = 0;
    (ordersData.data ?? []).forEach((o) => {
      if (!o.orderNumber || seen.has(o.orderNumber)) return;
      seen.add(o.orderNumber);
      sum += Number(o.remainingAmount) || 0;
    });
    return sum;
  }, [ordersData.data]);

  // Reference-style records grid over recent appointments (search + status filter + sort).
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const totalAppts = (appointments.data ?? []).length;
  const shownAppts = useMemo(() => {
    let list = appointments.data ?? [];
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((a) => a.patientName?.toLowerCase().includes(s) || a.doctorName?.toLowerCase().includes(s));
    if (statusF !== 'all') list = list.filter((a) => a.status === statusF);
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return String(a.patientName || '').localeCompare(String(b.patientName || ''));
      return new Date(b.appointmentDate || 0) - new Date(a.appointmentDate || 0);
    });
    return list;
  }, [appointments.data, q, statusF, sortBy]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const totalDoctors = doctors.data?.length ?? 0;
  const totalPatients = patients.data?.length ?? 0;
  const activeStaff = staff.data?.filter((s) => s.status === 'active').length ?? 0;
  const onLeaveCount = staff.data ? staff.data.length - activeStaff : 0;
  const pendingReqs = (leaves.data ?? []).filter((l) => l.status === 'PENDING').length;
  const todaysAppts = (appointments.data ?? []).filter((a) => a.appointmentDate === todayStr).length;

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">🩺 Hospital Console</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {greeting.text}, {name} {greeting.emoji}
            </h1>
            <p className="mt-1.5 text-sm text-white/80">📅 {todayLabel}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                📆 {todaysAppts} appointment{todaysAppts === 1 ? '' : 's'} today
              </span>
              {pendingReqs > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                  📝 {pendingReqs} leave{pendingReqs === 1 ? '' : 's'} to review
                </span>
              )}
            </div>
          </div>

          {/* Real hero image from the landing page */}
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
        aria-label="KPIs"
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5"
      >
        <Kpi emoji="👨‍⚕️" label="Total doctors" value={totalDoctors} iconTint="bg-brand-50 text-brand-700" loading={doctors.loading} />
        <Kpi emoji="🧑‍🤝‍🧑" label="Total patients" value={totalPatients} iconTint="bg-sky-50 text-sky-700" loading={patients.loading} />
        <Kpi emoji="🧑‍⚕️" label="Medical staff" value={activeStaff} sub={`${onLeaveCount} on leave`} iconTint="bg-amber-50 text-amber-700" loading={staff.loading} />
        <Kpi emoji="📝" label="Pending leaves" value={pendingReqs} sub="Needs review" iconTint="bg-rose-50 text-rose-600" loading={leaves.loading} />
        <Kpi emoji="📅" label="Today's appts." value={todaysAppts} sub="Today" iconTint="bg-emerald-50 text-emerald-700" loading={appointments.loading} />
      </motion.section>

      {/* Featured products — subtle, useful promotion (real products, one-tap to order) */}
      {current && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">✨ Featured for your pharmacy</h2>
              <p className="text-xs text-ink-500">Handpicked stock you can order in one tap</p>
            </div>
            <button
              onClick={() => navigate('/hospital/orders')}
              className="rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Browse all →
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Auto-rotating spotlight + soft account summary — light card so it never dominates */}
            <div className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-card lg:col-span-2">
              {/* soft decorative blobs */}
              <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-sky-200/40 blur-3xl" />

              {/* Account chip — a little "wallet" pill, distinct from everything else */}
              <button
                onClick={() => navigate('/hospital/orders')}
                className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-ink-200/70 bg-white/90 py-1 pl-1 pr-3 text-xs font-semibold text-ink-700 shadow-sm backdrop-blur transition-all hover:shadow-card-hover"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] text-white">💳</span>
                {outstanding > 0 ? (
                  <span>₹{outstanding.toLocaleString('en-IN')} <span className="font-medium text-ink-400">to pay</span></span>
                ) : (
                  <span className="text-emerald-600">All settled ✓</span>
                )}
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id ?? spot}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex items-center gap-4 pr-28"
                >
                  <img
                    src={productImg(current.imageUrl)}
                    alt={current.name}
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-lg ring-4 ring-white sm:h-28 sm:w-28"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                  />
                  <div className="min-w-0">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">🔥 Popular pick</span>
                    <h3 className="mt-2 truncate font-display text-xl font-bold text-ink-900">{current.name}</h3>
                    <p className="mt-0.5 text-sm text-ink-500">
                      {current.variants?.length || 0} size{(current.variants?.length || 0) === 1 ? '' : 's'} available
                    </p>
                    <button
                      onClick={() => navigate('/hospital/orders')}
                      className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-[.98]"
                    >
                      🛒 Order now
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {featured.length > 1 && (
                <div className="relative mt-4 flex gap-1.5">
                  {featured.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSpot(i)}
                      aria-label={`Show item ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === spot % featured.length ? 'w-6 bg-indigo-500' : 'w-1.5 bg-ink-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mini list of other picks (no prices) */}
            <div className="space-y-2">
              {featured.slice(0, 3).map((p, i) => (
                <motion.button
                  key={p.id ?? i}
                  whileHover={{ x: 3 }}
                  onClick={() => navigate('/hospital/orders')}
                  className="flex w-full items-center gap-3 rounded-2xl border border-ink-200/70 bg-white p-2.5 text-left shadow-sm transition-shadow hover:shadow-card-hover"
                >
                  <img
                    src={productImg(p.imageUrl)}
                    alt={p.name}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">{p.variants?.length || 0} size{(p.variants?.length || 0) === 1 ? '' : 's'} · tap to order</p>
                  </div>
                  <span className="text-indigo-600">→</span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      <QuickActions actions={QUICK_ACTIONS} />

      <StaffAttendanceCard />

      {/* Reference-style records grid — recent appointments */}
      <section className="rounded-3xl border border-ink-200/70 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">🗓️ Recent appointments</h2>
            <p className="text-xs text-ink-500">Showing {shownAppts.length} of {totalAppts}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 transition-all focus-within:border-brand-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search patient or doctor…"
                className="w-40 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 sm:w-52"
              />
            </label>
            <select
              value={statusF}
              onChange={(e) => setStatusF(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="all">All status</option>
              <option value="BOOKED">Booked</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="date">Sort: Date</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {shownAppts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
            <div className="text-4xl">📭</div>
            <p className="mt-2 text-sm font-semibold text-ink-600">No appointments found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shownAppts.slice(0, 9).map((a, i) => {
              const m = apptStatus(a.status);
              const patient = (a.patientName || 'Unknown').trim();
              return (
                <div
                  key={a.id ?? i}
                  style={{ animationDelay: `${Math.min(i, 9) * 45}ms` }}
                  className="animate-fade-up rounded-2xl border border-ink-200/70 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-ink-900">{patient}</h3>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600">
                        👨‍⚕️ {a.doctorName || '—'}
                      </span>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
                      {m.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-50 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm">📅</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-ink-400">Date</p>
                        <p className="truncate text-xs font-bold text-ink-800">{a.appointmentDate || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-50 text-sm">🕒</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-ink-400">Time</p>
                        <p className="truncate text-xs font-bold text-ink-800">{a.appointmentTime || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-ink-50 pt-3 text-[11px] text-ink-400">
                    <span>🏥 Appointment</span>
                    <span className="truncate">👤 {patient}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
}
