  import { useEffect, useState } from 'react';
  import { motion } from 'framer-motion';
  import { useAsyncData } from '../../hooks/useAsyncData.js';
  import {
    appointmentsStatusBreakdown,
    getAppointments,
    getDoctors,
  } from '../../services/hospital.js';
  import { getStaff } from '../../services/staff.js';
  import { getPatients } from '../../services/patients.js';
  import { getLeaves } from '../../services/hospitalLeaves.js';
  import { getProfile } from '../../services/profile.js';
  import StatCard from '../../components/widgets/StatCard.jsx';
  import AppointmentStatusChart from '../../components/widgets/AppointmentStatusChart.jsx';
  import AppointmentList from '../../components/widgets/AppointmentList.jsx';
  import QuickActions from '../../components/widgets/QuickActions.jsx';
  import StaffAttendanceCard from '../../components/widgets/StaffAttendanceCard.jsx';

  const QUICK_ACTIONS = [
    { label: 'New patient',     hint: 'Register an admission', to: '/hospital/patients',     icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6' },
    { label: 'Add doctor',      hint: 'Onboard a clinician',  to: '/hospital/doctors',      icon: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0M19 16v4M21 18h-4' },
    { label: 'Schedule',        hint: 'Book an appointment',  to: '/hospital/appointments', icon: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18' },
  ];

  export default function HospitalDashboard() {
    const session = JSON.parse(
      localStorage.getItem('auth.session') || '{}'
    );

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
      return () => {
        active = false;
      };
    }, []);

    const doctors = useAsyncData((opts) => getDoctors(opts));
    const staff = useAsyncData((opts) => getStaff(opts));
    const patients = useAsyncData((opts) => getPatients(opts));
    const leaves = useAsyncData((opts) => getLeaves(opts));

    const appointments = useAsyncData(() => {
      if (!adminId) return Promise.resolve([]);
      return getAppointments(adminId);
    });

    const todayStr = new Date().toISOString().slice(0, 10);

    const totalDoctors  = doctors.data?.length ?? 0;
    const totalPatients = patients.data?.length ?? 0;
    const activeStaff   = staff.data?.filter((s) => s.status === 'active').length ?? 0;
    const onLeaveCount  = staff.data ? staff.data.length - activeStaff : 0;
    const pendingReqs   = (leaves.data ?? []).filter((l) => l.status === 'PENDING').length;
    const todaysAppts   = (appointments.data ?? []).filter((a) => a.appointmentDate === todayStr).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-8"
      >
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Hospital Console
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-[34px]">
            Good morning, {name}
          </h1>
          <p className="mt-2 text-ink-600">
            A snapshot across departments, with what needs your eye highlighted.
          </p>
        </header>

        <section aria-label="KPIs" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Total doctors" value={totalDoctors} delta="" deltaTone="flat" tone="brand"
            loading={doctors.loading}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" /></svg>}
          />
          <StatCard
            label="Total patients" value={totalPatients} delta="" deltaTone="flat" tone="ocean"
            loading={patients.loading}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>}
          />
          <StatCard
            label="Active staff" value={activeStaff} delta={`${onLeaveCount} on leave`} deltaTone="flat" tone="amber"
            loading={staff.loading}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87" /></svg>}
          />
          <StatCard
            label="Pending requests" value={pendingReqs} delta="Leaves" deltaTone="flat" tone="rose"
            loading={leaves.loading}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 8v4l3 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" /></svg>}
          />
          <StatCard
            label="Today’s appts." value={todaysAppts} delta="Today" deltaTone="flat" tone="brand"
            loading={appointments.loading}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18" /></svg>}
          />
        </section>

        <QuickActions actions={QUICK_ACTIONS} />

        <StaffAttendanceCard />

        <section className="grid gap-6 xl:grid-cols-3">
          {appointments.data && (
            <AppointmentStatusChart data={appointmentsStatusBreakdown(appointments.data)} />
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            {appointments.data && <AppointmentList appointments={appointments.data} />}
          </div>
        </section>
      </motion.div>
    );
  }
