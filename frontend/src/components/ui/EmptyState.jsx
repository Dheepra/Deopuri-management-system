export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center">
      {icon && (
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          {icon}
        </span>
      )}
      <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-ink-600">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
