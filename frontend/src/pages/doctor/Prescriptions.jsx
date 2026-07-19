import { useState } from 'react';
import toast from 'react-hot-toast';

// Quick-insert snippets so writing a prescription feels fast (feature, not a blank box).
const TEMPLATES = [
  { label: 'Paracetamol 500mg', emoji: '💊', text: 'Paracetamol 500mg — 1 tablet twice a day after food (5 days)\n' },
  { label: 'Cough syrup', emoji: '🧴', text: 'Cough syrup — 10ml three times a day (5 days)\n' },
  { label: 'Antibiotic', emoji: '🦠', text: 'Amoxicillin 500mg — 1 capsule twice a day (7 days)\n' },
  { label: 'Rest advice', emoji: '🛌', text: 'Advice: Rest, plenty of fluids, follow-up if not better in 3 days.\n' },
];

export default function Prescriptions() {
  const [text, setText] = useState('');

  const add = (t) => setText((prev) => prev + t);

  const save = () => {
    if (!text.trim()) {
      toast.error('Write a prescription first.');
      return;
    }
    toast.success('Prescription saved');
  };

  return (
    <section className="animate-fade-up space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">💊 Prescriptions</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">📝 Write prescription</h1>
        <p className="mt-1 text-sm text-ink-600">Tap a template to insert, then edit as needed.</p>
      </header>

      {/* Quick templates */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={() => add(t.text)}
            style={{ animationDelay: `${i * 45}ms` }}
            className="animate-fade-up flex items-center gap-2 rounded-2xl border border-ink-200/70 bg-white p-3 text-left text-sm font-semibold text-ink-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg">{t.emoji}</span>
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="rounded-3xl border border-ink-200/70 bg-white p-4 shadow-card sm:p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Rx…&#10;e.g. Paracetamol 500mg — 1 tablet twice a day after food (5 days)"
          className="h-56 w-full resize-none rounded-2xl border border-ink-200 bg-ink-50/40 p-4 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setText('')}
            className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
          >
            🗑️ Clear
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.98]"
          >
            ✅ Save prescription
          </button>
        </div>
      </div>
    </section>
  );
}
