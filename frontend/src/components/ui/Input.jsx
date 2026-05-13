import { forwardRef, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Floating-label input. Use `peer` + `peer-placeholder-shown` to flip label state.
// The `placeholder=" "` is intentional — it lets the CSS detect "empty".
const Input = forwardRef(function Input(
  { label, error, hint, className = '', id, leadingIcon, trailingSlot, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `input-${reactId}`;
  const invalid = Boolean(error);

  return (
    <div className={className}>
      <div
        className={[
          'group relative rounded-xl border bg-white/70 backdrop-blur transition-all duration-200',
          'focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(31,155,110,0.12)]',
          invalid
            ? 'border-red-400 focus-within:border-red-500'
            : 'border-ink-200 focus-within:border-brand-500',
        ].join(' ')}
      >
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          placeholder=" "
          aria-invalid={invalid}
          aria-describedby={invalid ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className={[
            'peer block w-full rounded-xl bg-transparent px-4 pb-2 pt-6 text-sm text-ink-900 outline-none placeholder-transparent',
            leadingIcon ? 'pl-10' : '',
            trailingSlot ? 'pr-12' : '',
          ].join(' ')}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className={[
            'pointer-events-none absolute left-4 top-1.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-200',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal',
            'peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-medium peer-focus:uppercase peer-focus:tracking-wider',
            leadingIcon ? 'peer-placeholder-shown:left-10 left-10' : '',
            invalid ? 'text-red-600' : 'text-ink-500 peer-focus:text-brand-700',
          ].join(' ')}
        >
          {label}
        </label>
        {trailingSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailingSlot}</div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {invalid && (
          <motion.p
            id={`${inputId}-err`}
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

      {!invalid && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-500">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
