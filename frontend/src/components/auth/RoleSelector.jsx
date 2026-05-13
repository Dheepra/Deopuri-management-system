import { AnimatePresence, motion } from 'framer-motion';

/**
 * Modern selectable tiles for picking a signup role. Renders proper radio
 * inputs so it's keyboard- and screen-reader accessible.
 *
 *   options: [{ value, label, description, icon }]
 *   value:    currently selected option value (or null)
 *   onChange(value): handler
 *   error:    optional inline error message
 *   name:     radio group name (default "role")
 */
export default function RoleSelector({ options, value, onChange, error, name = 'role' }) {
  return (
    <fieldset>
      <legend className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-ink-500">
        I am signing up as
      </legend>
      <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={[
                'group relative flex cursor-pointer flex-col gap-2 rounded-xl border bg-white/70 p-4 transition-all duration-200',
                selected
                  ? 'border-brand-500 bg-brand-50/60 shadow-[0_0_0_4px_rgba(31,155,110,0.12)]'
                  : 'border-ink-200 hover:border-ink-300',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-3">
                <span
                  className={[
                    'grid h-10 w-10 place-items-center rounded-lg transition-colors',
                    selected ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700 group-hover:bg-ink-200',
                  ].join(' ')}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d={opt.icon} />
                  </svg>
                </span>

                <span
                  className={[
                    'grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors',
                    selected ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {selected && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3 text-white">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-ink-900">{opt.label}</p>
                {opt.description && (
                  <p className="mt-0.5 text-xs leading-5 text-ink-600">{opt.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.93 4.412L8.7 9.118h-1.4l-.23-4.706h1.86zm-.93 7.176a1.034 1.034 0 1 1 0-2.068 1.034 1.034 0 0 1 0 2.068z" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </fieldset>
  );
}
