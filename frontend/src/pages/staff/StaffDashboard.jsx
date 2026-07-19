import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getDashboard, getMe, markAttendance } from '../../services/staffPortal.js';
import { heroImage } from '../../assets/picture';

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

export default function StaffDashboard() {
  const { data: me } = useAsyncData((opts) => getMe(opts));
  const { data, loading, refresh } = useAsyncData((opts) => getDashboard(opts));
  const [marking, setMarking] = useState(false);

  const alreadyMarked = Boolean(data?.todayMarked);

  const handleMark = async () => {
    if (marking || alreadyMarked) return;
    setMarking(true);
    try {
      await markAttendance();
      toast.success('Attendance marked for today');
      refresh();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 422) {
        toast(msg || 'You have already marked attendance today');
        refresh();
      } else {
        toast.error(msg || 'Could not mark attendance');
      }
    } finally {
      setMarking(false);
    }
  };

  const firstName = (me?.name || '').split(' ')[0] || 'there';

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">🧑‍⚕️ Staff Portal</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {greeting.text}, {firstName} {greeting.emoji}
            </h1>
            <p className="mt-1.5 text-sm text-white/80">📅 {todayLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {me?.department && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">🏥 {me.department}</span>
              )}
              {me?.shift && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">⏰ {me.shift} shift</span>
              )}
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

      {/* Mark attendance */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink-200/70 bg-white p-5 shadow-sm">
        <div>
          <p className="font-display text-lg font-bold text-ink-900">🟢 Today&apos;s attendance</p>
          <p className="text-xs text-ink-500">{alreadyMarked ? 'You are marked present today' : 'Tap to mark yourself present'}</p>
        </div>
        {alreadyMarked ? (
          <span className="rounded-2xl bg-emerald-50 px-6 py-3 text-base font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            ✅ Marked present
          </span>
        ) : (
          <button
            type="button"
            onClick={handleMark}
            disabled={marking || loading}
            className="rounded-2xl bg-brand-600 px-8 py-3 text-base font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.98] disabled:opacity-60"
          >
            {marking ? 'Marking…' : '🟢 Mark attendance'}
          </button>
        )}
      </div>

      {/* KPIs */}
      <motion.section
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <Kpi emoji="📅" label="Present this month" value={loading ? '—' : (data?.presentThisMonth ?? 0)} sub="Days marked" iconTint="bg-brand-50 text-brand-700" loading={loading} />
        <Kpi emoji="🌴" label="Casual leave left" value={loading ? '—' : `${data?.casualRemaining ?? 0} / 12`} sub="This year" iconTint="bg-amber-50 text-amber-700" loading={loading} />
        <Kpi emoji="⏳" label="Pending requests" value={loading ? '—' : (data?.pendingLeaves ?? 0)} sub="Awaiting approval" iconTint="bg-rose-50 text-rose-600" loading={loading} />
        <Kpi emoji={alreadyMarked ? '✅' : '🕒'} label="Today" value={alreadyMarked ? 'Present' : 'Pending'} sub={alreadyMarked ? 'Marked' : 'Not marked'} iconTint={alreadyMarked ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'} loading={loading} />
      </motion.section>
    </motion.div>
  );
}
