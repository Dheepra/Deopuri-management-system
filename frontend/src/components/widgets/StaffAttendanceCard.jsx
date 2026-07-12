import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { downloadAttendanceCsv, getStaffAttendance } from '../../services/staff.js';

const STATUS_STYLE = {
  PRESENT: 'bg-emerald-50 text-emerald-700',
  LEAVE: 'bg-amber-50 text-amber-700',
  ABSENT: 'bg-red-50 text-red-700',
};

function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}

// Attendance roster for a chosen day — used on the hospital & medical admin dashboards so the
// admin can see who was present, on leave, or absent on any date.
export default function StaffAttendanceCard() {
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadAttendanceCsv(date.slice(0, 7)); // YYYY-MM of the selected date
    } catch {
      toast.error('Could not export attendance');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    getStaffAttendance(date)
      .then((data) => {
        if (active) setRows(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setRows([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [date]);

  const present = rows.filter((r) => r.status === 'PRESENT').length;
  const onLeave = rows.filter((r) => r.status === 'LEAVE').length;
  const absent = rows.filter((r) => r.status === 'ABSENT').length;

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-lg">🗓️</span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Staff attendance</h2>
            <p className="text-xs text-ink-500">Who was present, on leave, or absent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            title="Download this month's attendance as CSV"
            className="shrink-0 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-60"
          >
            {exporting ? '…' : '⬇️ Export month'}
          </button>
        </div>
      </header>

      {/* Counts */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-emerald-700">{present}</p>
          <p className="text-xs font-semibold text-emerald-700/80">Present</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-amber-700">{onLeave}</p>
          <p className="text-xs font-semibold text-amber-700/80">On leave</p>
        </div>
        <div className="rounded-xl bg-red-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-red-700">{absent}</p>
          <p className="text-xs font-semibold text-red-700/80">Absent</p>
        </div>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-ink-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl bg-ink-50/60 px-4 py-6 text-center text-sm text-ink-400">
          No staff yet. Add staff to track attendance.
        </p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {rows.map((r) => (
            <li key={r.staffId} className="flex items-center justify-between py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">{r.name}</p>
                <p className="truncate text-xs text-ink-500">{r.department || '—'}</p>
              </div>
              <span
                className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  STATUS_STYLE[r.status] || 'bg-ink-100 text-ink-600'
                }`}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
