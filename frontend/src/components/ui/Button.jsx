const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm hover:shadow-md',
  secondary:
    'bg-white text-ink-800 border border-ink-200 hover:border-brand-400 hover:text-brand-700',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  return (
    <Component
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
        'transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Component>
  );
}
