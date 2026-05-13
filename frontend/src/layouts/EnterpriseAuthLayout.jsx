import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Two-column auth shell used by every admin auth page (Company today,
 * Hospital / Medical later). Pass a `tagline` and `bullets` to brand the
 * side panel per role.
 */
export default function EnterpriseAuthLayout({
  title,
  subtitle,
  eyebrow = 'Deopuri · Admin Console',
  formEyebrow = 'Account',
  tagline = 'Run your shop with clarity.',
  bullets = [],
  footerNote,
  children,
}) {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-12">
        {/* Dark enterprise side panel */}
        <aside className="relative hidden overflow-hidden lg:col-span-5 lg:flex">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[var(--color-night-800)]"
          />
          {/* Animated mesh */}
          <div
            aria-hidden="true"
            className="animate-mesh absolute -top-32 -right-16 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-brand-500/40 via-brand-400/10 to-transparent blur-3xl"
          />
          <div
            aria-hidden="true"
            className="animate-mesh absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-indigo-500/25 via-brand-500/10 to-transparent blur-3xl"
            style={{ animationDelay: '-7s' }}
          />
          <div
            aria-hidden="true"
            className="bg-grid-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full flex-col justify-between p-10 text-white xl:p-14"
          >
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 backdrop-blur transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 3v18M3 12h18" />
                </svg>
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">Deopuri</span>
            </Link>

            <div className="max-w-lg">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                {eyebrow}
              </p>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight xl:text-[44px]">
                {tagline}
              </h1>
              {bullets.length > 0 && (
                <ul className="mt-10 space-y-4">
                  {bullets.map((item) => (
                    <li key={item.label} className="flex items-start gap-3.5">
                      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 backdrop-blur">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-brand-300">
                          <path d={item.icon} />
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        {item.hint && (
                          <p className="mt-0.5 text-xs leading-5 text-white/60">{item.hint}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {footerNote ?? (
              <p className="text-xs text-white/50">
                © {new Date().getFullYear()} Deopuri · Enterprise admin console
              </p>
            )}
          </motion.div>
        </aside>

        {/* Form panel */}
        <section className="relative flex flex-col px-4 py-10 sm:px-6 lg:col-span-7 lg:px-10 lg:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(31,155,110,0.10)_0%,transparent_60%)] lg:hidden"
          />

          <header className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-night-800)] text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 3v18M3 12h18" />
                </svg>
              </span>
              <span className="font-display text-lg font-semibold text-ink-900">Deopuri</span>
            </Link>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="mx-auto my-auto w-full max-w-lg pt-10 lg:pt-16"
          >
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                {formEyebrow}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-[34px]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-base text-ink-600">{subtitle}</p>
              )}
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.18)] backdrop-blur-md sm:p-8">
              {children}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
