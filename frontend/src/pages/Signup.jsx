import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm.jsx';
import logo from '../assets/picture/logo.jpg';
import { heroImage } from '../assets/picture';

const BULLETS = [
  {
    emoji: '🏥',
    label: 'Built for healthcare teams',
    hint: 'Hospitals & medical shops on one calm platform.',
  },
  {
    emoji: '🛡️',
    label: 'Approval before access',
    hint: 'A Company Admin reviews every new account.',
  },
  {
    emoji: '🎯',
    label: 'Role-based from day one',
    hint: 'Your dashboard is tailored to your role.',
  },
];

// Decorative floating emojis for the herbal-themed background.
const FLOATERS = [
  { e: '🌿', c: 'left-[6%] top-[14%] text-5xl', d: '0s' },
  { e: '💊', c: 'left-[44%] top-[8%] text-4xl', d: '1.2s' },
  { e: '🩺', c: 'right-[8%] top-[22%] text-5xl', d: '0.6s' },
  { e: '💚', c: 'left-[12%] bottom-[12%] text-4xl', d: '1.8s' },
  { e: '🍃', c: 'right-[14%] bottom-[16%] text-5xl', d: '0.9s' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Signup() {
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

      {/* Unique gradient outer border */}
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
            <motion.p variants={item} className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              🌿 Welcome to Deopuri
            </motion.p>
            <motion.h1 variants={item} className="mt-3 font-display text-4xl font-bold leading-tight">
              Healthcare software that feels calm.
            </motion.h1>
            <motion.p variants={item} className="mt-3 max-w-sm text-white/80">
              One platform for hospitals and medical shops — orders, patients, payments and more, tailored to your role.
            </motion.p>

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
            <p className="text-xs text-white/70">Trusted by hospitals &amp; pharmacies <br /> across the network. 💚</p>
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
            {/* Mobile logo → home */}
            <div className="mb-5 flex items-center justify-center lg:hidden">
              <Link to="/" className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-ink-100 transition-transform hover:scale-105">
                <img src={logo} alt="Deopuri Herbal" className="h-9 w-auto" />
              </Link>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">✨ Sign up</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900">Create your account</h2>
            <p className="mt-1 text-sm text-ink-600">
              Pick your role — an admin will approve you before sign-in.
            </p>

            <div className="mt-6">
              <SignupForm />
            </div>

            <p className="mt-4 text-center text-xs text-ink-400">
              By continuing you agree to our terms.{' '}
              <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">Sign in instead</Link>
            </p>
          </motion.div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
