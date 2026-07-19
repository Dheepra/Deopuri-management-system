import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getFeaturedProducts } from "../services/products.js";
import { heroImage } from "../assets/picture";
import AppointmentBooking from "./Appointments";
import AppointmentReview from "./AppointmentReview";

const BENEFITS = [
  { emoji: "🌿", title: "100% Natural", text: "Pure herbs, no harsh chemicals — the way nature intended." },
  { emoji: "🧪", title: "Lab-tested purity", text: "Every batch checked for safety, quality and potency." },
  { emoji: "🕉️", title: "Ancient Ayurveda", text: "Time-honoured formulations rooted in classical texts." },
  { emoji: "🌍", title: "Eco-friendly", text: "Sustainably sourced, kindly made, gently packaged." },
];

const HERBS = [
  { emoji: "🌿", name: "Tulsi", text: "Holy basil for immunity & calm." },
  { emoji: "🌱", name: "Ashwagandha", text: "Root of strength & vitality." },
  { emoji: "🍃", name: "Neem", text: "Nature's purifier for healthy skin." },
  { emoji: "🫐", name: "Amla", text: "Vitamin-C rich rejuvenator." },
];

// Herbs ticker — scrolls forever, feels alive and inviting.
const HERB_TICKER = [
  "🌿 Tulsi", "🌱 Ashwagandha", "🍃 Neem", "🫐 Amla", "🌼 Chamomile", "🌾 Brahmi",
  "🫚 Ginger", "🍯 Honey", "🌸 Hibiscus", "🌰 Shatavari", "🌶️ Turmeric", "🍋 Giloy",
];

// Wellness by need — playful, interactive category cards.
const NEEDS = [
  { emoji: "🛡️", title: "Immunity", herb: "Tulsi · Giloy", tint: "bg-emerald-50" },
  { emoji: "😴", title: "Better sleep", herb: "Ashwagandha", tint: "bg-indigo-50" },
  { emoji: "🌿", title: "Digestion", herb: "Ginger · Amla", tint: "bg-amber-50" },
  { emoji: "⚡", title: "Energy", herb: "Shatavari", tint: "bg-orange-50" },
  { emoji: "✨", title: "Glowing skin", herb: "Neem · Turmeric", tint: "bg-rose-50" },
  { emoji: "🧘", title: "Calm & focus", herb: "Brahmi", tint: "bg-sky-50" },
];

// Default contact details — placeholders; edit these later.
const CONTACT = [
  { emoji: "📍", label: "Visit us", value: "123 Herbal Lane, Green Valley, India" },
  { emoji: "📞", label: "Call us", value: "+91 90000 00000" },
  { emoji: "✉️", label: "Email us", value: "hello@deopuriherbal.com" },
  { emoji: "🕒", label: "Hours", value: "Mon–Sat · 9:00 AM – 7:00 PM" },
];

const FLOATERS = [
  { e: "🌿", c: "left-[4%] top-[18%] text-5xl", d: "0s" },
  { e: "🍃", c: "right-[6%] top-[10%] text-4xl", d: "1.2s" },
  { e: "🌱", c: "left-[10%] bottom-[10%] text-4xl", d: "0.7s" },
  { e: "🍃", c: "right-[12%] bottom-[18%] text-5xl", d: "1.6s" },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [step, setStep] = useState("form");
  const [reviewData, setReviewData] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "", patientMobile: "", patientEmail: "", patientAge: "", patientGender: "",
    hospitalAdminId: "", doctorId: "", appointmentDate: "", appointmentTime: "", notes: "",
    paymentMethod: "UPI", paymentRef: "",
  });

  const resetAppointmentFlow = () => {
    setShowAppointmentForm(false);
    setStep("form");
    setReviewData(null);
    setFormData({
      patientName: "", patientMobile: "", patientEmail: "", patientAge: "", patientGender: "",
      hospitalAdminId: "", doctorId: "", appointmentDate: "", appointmentTime: "", notes: "",
    paymentMethod: "UPI", paymentRef: "",
    });
  };

  const products = getFeaturedProducts();

  // Default contact submit — placeholder; wire to a real endpoint later.
  const handleContact = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    toast.success("Thanks! We'll get back to you soon. 🌿");
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-emerald-50/40 to-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="animate-mesh absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="animate-mesh absolute right-0 top-40 h-[26rem] w-[26rem] rounded-full bg-emerald-200/40 blur-3xl" style={{ animationDelay: "1.5s" }} />
          {FLOATERS.map((f, i) => (
            <span key={i} className={`animate-float absolute select-none opacity-25 ${f.c}`} style={{ animationDelay: f.d }}>{f.e}</span>
          ))}
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.span variants={reveal} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 shadow-sm ring-1 ring-brand-100 backdrop-blur">
              🌿 Rooted in Ayurveda
            </motion.span>
            <motion.h1 variants={reveal} className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              Nature's wisdom,
              <span className="block bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">in every drop.</span>
            </motion.h1>
            <motion.p variants={reveal} className="mt-5 max-w-xl text-base leading-7 text-ink-600 sm:text-lg">
              Deopuri Herbal blends ancient Ayurvedic wisdom with pure, natural ingredients — crafted gently to nurture your body, mind and everyday wellbeing.
            </motion.p>
            <motion.div variants={reveal} className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#products" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-brand-600/30 active:scale-[.98]">
                🌱 Explore our remedies
              </a>
              <button
                onClick={() => { resetAppointmentFlow(); setShowAppointmentForm(true); }}
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-6 py-3 text-sm font-semibold text-brand-700 backdrop-blur transition-colors hover:bg-brand-50"
              >
                📅 Book a consultation
              </button>
            </motion.div>
            <motion.div variants={reveal} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              <span>🌿 100% Herbal</span>
              <span>🧪 Lab-tested</span>
              <span>🐾 Cruelty-free</span>
            </motion.div>
          </motion.div>

          {/* Hero image — organic frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="animate-float absolute -left-4 -top-4 z-10 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-brand-700 shadow-lg ring-1 ring-brand-100">🌿 100% Natural</div>
            <div className="animate-float absolute -bottom-4 -right-3 z-10 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-emerald-600 shadow-lg ring-1 ring-emerald-100" style={{ animationDelay: "1s" }}>🕉️ Ayurvedic</div>
            <div className="overflow-hidden rounded-[3rem] border-4 border-white bg-brand-100 shadow-2xl">
              <img src={heroImage} alt="Deopuri Herbal remedies" className="aspect-[4/5] w-full object-cover" />
            </div>
            <div aria-hidden className="absolute -inset-3 -z-10 rounded-[3.5rem] bg-gradient-to-br from-brand-300/50 to-emerald-200/40 blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {BENEFITS.map((b) => (
            <motion.div key={b.title} variants={reveal} className="rounded-3xl border border-ink-100 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-card-hover">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl">{b.emoji}</div>
              <h3 className="mt-3 font-display text-base font-bold text-ink-900">{b.title}</h3>
              <p className="mt-1 text-xs text-ink-500">{b.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== HERBS BAND (static) ===== */}
      <section aria-label="Our herbs" className="relative overflow-hidden border-y border-brand-500/40 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 py-8 text-white">
        <div className="bg-grid-dots absolute inset-0 opacity-15" />
        <div className="animate-float pointer-events-none absolute left-6 top-2 select-none text-4xl opacity-20">🌿</div>
        <div className="animate-float pointer-events-none absolute bottom-2 right-6 select-none text-4xl opacity-20" style={{ animationDelay: "1s" }}>🍃</div>
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">🌿 Nature's pharmacy</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {HERB_TICKER.map((h, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.06 }}
                className="cursor-default rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
              >
                {h}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WELLNESS BY NEED ===== */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">🌸 Find your remedy</span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Wellness for every need</h2>
          <p className="mt-3 text-ink-600">Tell us how you feel — nature has a herb for it.</p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3"
        >
          {NEEDS.map((n) => (
            <motion.a
              key={n.title}
              href="#products"
              variants={reveal}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-ink-100 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-card-hover"
            >
              <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${n.tint} text-3xl transition-transform group-hover:scale-110`}>{n.emoji}</div>
              <h3 className="mt-3 font-display text-base font-bold text-ink-900">{n.title}</h3>
              <p className="mt-0.5 text-xs text-ink-500">🌿 {n.herb}</p>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ===== PRODUCTS (no price) ===== */}
      <section id="products" className="bg-gradient-to-b from-white to-brand-50/50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">🌱 Our remedies</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Pure herbal essentials</h2>
            <p className="mt-3 text-ink-600">Handcrafted from nature's finest botanicals — for daily wellness, the gentle way.</p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((p) => (
              <motion.article
                key={p.id}
                variants={reveal}
                whileHover={{ y: -6 }}
                className="group overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-sm transition-shadow hover:shadow-card-hover"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100 backdrop-blur">
                    🌿 {p.badge || "Herbal"}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{p.category}</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-700">{p.name}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                    Learn more <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== INGREDIENTS / PHILOSOPHY ===== */}
      <section id="philosophy" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">🕉️ Our philosophy</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Healing, the way nature designed it.</h2>
            <p className="mt-4 text-ink-600">
              For centuries, Ayurveda has looked to plants, roots and herbs to bring the body back into balance. We honour that tradition — sourcing pure ingredients, formulating with care, and letting nature do what it does best.
            </p>
            <p className="mt-3 text-ink-600">No shortcuts. No harsh additives. Just honest, herbal goodness. 🌿</p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 gap-4"
          >
            {HERBS.map((h) => (
              <motion.div key={h.name} variants={reveal} className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5 transition-transform hover:-translate-y-1">
                <div className="text-3xl">{h.emoji}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-ink-900">{h.name}</h3>
                <p className="mt-1 text-xs text-ink-500">{h.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="bg-gradient-to-b from-brand-50/50 to-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">📮 Get in touch</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">We'd love to hear from you</h2>
            <p className="mt-3 text-ink-600">Questions, wholesale enquiries or wellness advice — reach out and our team will help. 🌿</p>
          </motion.div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* Contact info */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {CONTACT.map((c) => (
                <motion.div key={c.label} variants={reveal} className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-2xl">{c.emoji}</div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-500">{c.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink-900">{c.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact form (default — wire up later) */}
            <motion.form
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal}
              onSubmit={handleContact}
              className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🧑 Your name</span>
                  <input name="name" placeholder="e.g. Aarav" className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">📧 Email</span>
                  <input name="email" type="email" placeholder="you@email.com" className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">💬 Message</span>
                <textarea name="message" rows={4} placeholder="How can we help?" className="w-full resize-none rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </label>
              <button type="submit" className="mt-4 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.99]">
                ✉️ Send message
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="consult" className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-700 px-8 py-14 text-center text-white shadow-card"
        >
          <div className="bg-grid-dots absolute inset-0 opacity-20" />
          <div className="animate-float pointer-events-none absolute left-8 top-8 select-none text-5xl opacity-30">🌿</div>
          <div className="animate-float pointer-events-none absolute bottom-8 right-8 select-none text-5xl opacity-30" style={{ animationDelay: "1s" }}>🍃</div>
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Begin your wellness journey 🌱</h2>
            <p className="mt-3 text-white/80">Talk to our practitioners or explore remedies crafted with nature's care.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => { resetAppointmentFlow(); setShowAppointmentForm(true); }}
                className="rounded-full bg-white px-7 py-3 text-sm font-bold text-brand-700 shadow-sm transition-transform hover:scale-[1.03] active:scale-[.98]"
              >
                📅 Book a consultation
              </button>
              <Link to="/register" className="rounded-full border border-white/40 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                Join Deopuri →
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Floating book button */}
      <button
        onClick={() => { resetAppointmentFlow(); setShowAppointmentForm(true); }}
        className="fixed bottom-8 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-105 active:scale-95"
      >
        📅 Book Appointment
      </button>

      {/* Appointment modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
            <button
              onClick={resetAppointmentFlow}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
            >
              ✕
            </button>
            {step === "form" ? (
              <AppointmentBooking formData={formData} setFormData={setFormData} setReviewData={setReviewData} setStep={setStep} />
            ) : (
              <AppointmentReview reviewData={reviewData} setStep={setStep} setShowAppointmentForm={setShowAppointmentForm} setReviewData={setReviewData} resetAppointmentFlow={resetAppointmentFlow} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
