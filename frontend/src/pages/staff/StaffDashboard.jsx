import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getDashboard, getMe, markAttendance } from '../../services/staffPortal.js';

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {label}
          </p>
          <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
          {hint && <p className="text-xs text-ink-400">{hint}</p>}
        </div>
      </div>
    </div>
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

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Staff portal
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          Hi {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          {me?.department ? `${me.department} · ` : ''}
          {me?.shift ? `${me.shift} shift` : 'Welcome to your dashboard'}
        </p>
      </header>

      {/* Mark attendance */}
      <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-ink-700">Today&apos;s attendance</p>
        {alreadyMarked ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-2xl bg-emerald-50 py-4 text-base font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:w-auto sm:px-10"
          >
            ✅ Marked present today
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMark}
            disabled={marking || loading}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {marking ? 'Marking…' : '🟢 Mark attendance'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon="📅"
          label="Present this month"
          value={loading ? '—' : (data?.presentThisMonth ?? 0)}
          hint="days marked present"
        />
        <StatCard
          icon="🌴"
          label="Casual leave left"
          value={loading ? '—' : `${data?.casualRemaining ?? 0} / 12`}
          hint="remaining this year"
        />
        <StatCard
          icon="⏳"
          label="Pending requests"
          value={loading ? '—' : (data?.pendingLeaves ?? 0)}
          hint="leaves awaiting approval"
        />
      </div>
    </section>
  );
}
