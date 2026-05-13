export default function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return (
    <div
      className={`relative overflow-hidden bg-ink-100 ${rounded} ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}
