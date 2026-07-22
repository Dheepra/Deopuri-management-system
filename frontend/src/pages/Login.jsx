import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LoginForm from '../components/auth/LoginForm.jsx';
import CreatePassword from './CreatePassword';
import logo from '../assets/picture/c.png';
import { heroImage } from '../assets/picture';

const BULLETS = [
  { emoji: '🎯', label: 'One login, three consoles', hint: 'You land on the right dashboard automatically.' },
  { emoji: '📦', label: 'Real-time inventory', hint: 'Variant-level stock & expiry, synced instantly.' },
  { emoji: '🧘', label: 'Designed for clarity', hint: 'A calm interface your team will enjoy.' },
];

const FLOATERS = [
  { e: '🌿', c: 'left-[6%] top-[14%] text-5xl', d: '0s' },
  { e: '💊', c: 'left-[44%] top-[8%] text-4xl', d: '1.2s' },
  { e: '🩺', c: 'right-[8%] top-[22%] text-5xl', d: '0.6s' },
  { e: '💚', c: 'left-[12%] bottom-[12%] text-4xl', d: '1.8s' },
  { e: '🍃', c: 'right-[14%] bottom-[16%] text-5xl', d: '0.9s' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

export default function Login() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const location = useLocation();
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [doctorUserId, setDoctorUserId] = useState(null);
  const [inviteToken, setInviteToken] = useState(null);
  const urlToken = searchParams.get('token');

  useEffect(() => {
    if (searchParams.get('expired')) toast.error('Your session expired. Please log in again.');
  }, [searchParams]);

  useEffect(() => {
    if (location.state?.justRegistered) toast.success('Account created successfully. Please wait for admin approval.');
  }, [location.state]);

  useEffect(() => {
    if (userId) {
      setDoctorUserId(Number(userId));
      setInviteToken(urlToken);
      setShowCreatePassword(true);
    }
  }, [userId, urlToken]);

  return (
    <div className="relative h-dvh overflow-hidden bg-ink-50 p-2.5 sm:p-4">
      {/* Animated background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-mesh absolute -left-24 -top-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="animate-mesh absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-emerald-200/40 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="animate-mesh absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" style={{ animationDelay: '1s' }} />
        {FLOATERS.map((f, i) => (
          <span key={i} className={`animate-float absolute select-none opacity-20 ${f.c}`} style={{ animationDelay: f.d }}>{f.e}</span>
        ))}
      </div>

      {/* Unique gradient outer border — window frame */}
      <div className="relative mx-auto h-full w-full max-w-6xl rounded-[2.15rem] bg-gradient-to-br from-brand-400 via-emerald-400 to-brand-600 p-[2px] shadow-card">
        <div className="h-full overflow-hidden rounded-[2rem] bg-white/50 backdrop-blur">
          <div className="grid h-full grid-cols-1 lg:grid-cols-2">

            {/* Left — brand panel */}
            <motion.aside
              variants={container}
              initial="hidden"
              animate="show"
              className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-10 text-white lg:flex"
            >
              <div className="bg-grid-dots absolute inset-0 opacity-20" />
              <div className="animate-mesh pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

              <motion.div variants={item} className="relative flex items-center gap-3">
                <Link to="/" className="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105">
                  <img src={logo} alt="Deopuri Herbal" className="h-9 w-auto" />
                </Link>
                <Link to="/" className="text-xs font-semibold text-white/75 transition-colors hover:text-white">← Back to home</Link>
              </motion.div>

              <div className="relative">
                <motion.p variants={item} className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">🌿 Welcome back</motion.p>
                <motion.h1 variants={item} className="mt-3 font-display text-4xl font-bold leading-tight">Good to see you again.</motion.h1>
                <motion.p variants={item} className="mt-3 max-w-sm text-white/80">Sign in and land straight on the dashboard built for your role.</motion.p>

                <div className="mt-8 space-y-3">
                  {BULLETS.map((b) => (
                    <motion.div
                      key={b.label}
                      variants={item}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur ring-1 ring-white/10"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-lg">{b.emoji}</span>
                      <div>
                        <p className="text-sm font-bold">{b.label}</p>
                        <p className="text-xs text-white/70">{b.hint}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div variants={item} className="relative flex items-center gap-3">
                <img src={heroImage} alt="" className="h-14 w-14 rounded-2xl object-cover shadow-lg ring-4 ring-white/20" />
                <p className="text-xs text-white/70">One quiet dashboard, <br /> built for your role. 💚</p>
              </motion.div>
            </motion.aside>

            {/* Right — form (scrolls internally so the page never moves) */}
            <div className="overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-5 sm:p-8 lg:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-md rounded-3xl border border-ink-200/70 bg-white/80 p-6 shadow-card backdrop-blur-xl sm:p-8"
                >
                  <div className="mb-5 flex items-center justify-center lg:hidden">
                    <Link to="/" className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-ink-100 transition-transform hover:scale-105">
                      <img src={logo} alt="Deopuri Herbal" className="h-9 w-auto" />
                    </Link>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">🔐 Sign in</p>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900">
                    {showCreatePassword ? 'Create your password' : 'Welcome back'}
                  </h2>
                  <p className="mt-1 text-sm text-ink-600">
                    {showCreatePassword ? 'Set a password to activate your account.' : 'Sign in to your console.'}
                  </p>

                  <div className="mt-6">
                    {showCreatePassword ? (
                      <CreatePassword
                        userId={doctorUserId}
                        token={inviteToken}
                        onSuccess={() => {
                          setShowCreatePassword(false);
                          toast.success('Password created successfully. Please login.');
                        }}
                      />
                    ) : (
                      <LoginForm
                        onFirstTimeLogin={(uid, token) => {
                          setDoctorUserId(uid);
                          setInviteToken(token);
                          setShowCreatePassword(true);
                        }}
                      />
                    )}
                  </div>

                  {!showCreatePassword && (
                    <p className="mt-4 text-center text-xs text-ink-400">
                      New here?{' '}
                      <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">Create an account</Link>
                    </p>
                  )}
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
