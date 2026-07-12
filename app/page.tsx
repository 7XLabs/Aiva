import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FEATURES = [
  {
    icon: "📞",
    title: "Answers every call",
    body: "AIVA picks up 24/7 in under a second. No hold music, no missed customers, no voicemail black hole.",
  },
  {
    icon: "📅",
    title: "Books appointments",
    body: "Checks live availability, confirms the details back to the caller, and drops the booking straight into your calendar.",
  },
  {
    icon: "❓",
    title: "Answers FAQs",
    body: "Hours, parking, insurance, pricing — AIVA is trained on your business knowledge and answers instantly.",
  },
  {
    icon: "🍽️",
    title: "Takes orders",
    body: "Full order capture with item-by-item confirmation, pickup or delivery, and an accurate total every time.",
  },
  {
    icon: "🌍",
    title: "Speaks 8+ languages",
    body: "English, Hindi, Spanish, French, German and more. AIVA detects the caller's language and switches instantly.",
  },
  {
    icon: "🤝",
    title: "Knows when to hand off",
    body: "Upset caller? Complex request? AIVA transfers to your staff with full context — never a dead end.",
  },
];

const INDUSTRIES = [
  {
    icon: "🏥",
    name: "Clinics",
    body: "Patient appointment booking, insurance questions, and walk-in guidance — while your front desk focuses on patients in the room.",
  },
  {
    icon: "💇",
    name: "Salons",
    body: "Bookings for cuts, color and spa services, stylist availability, and product questions handled while your team keeps working.",
  },
  {
    icon: "🍕",
    name: "Restaurants",
    body: "Phone orders taken accurately during the dinner rush, reservations booked, and menu questions answered in any language.",
  },
  {
    icon: "🏨",
    name: "Hotels",
    body: "Room availability, rate questions, spa bookings, and airport pickups — a concierge that never sleeps.",
  },
];

const STEPS = [
  { n: "01", title: "Connect your number", body: "Point your existing phone number at AIVA or get a new one in minutes." },
  { n: "02", title: "Teach it your business", body: "Add your services, menu, hours and FAQs. AIVA learns instantly — no training period." },
  { n: "03", title: "AIVA answers", body: "Every call answered, every booking captured, every conversation logged in your dashboard." },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(84,100,251,0.25),transparent_60%)]"
            aria-hidden
          />
          <div className="container-page relative text-center">
            <p className="mb-4 inline-block rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1 text-sm text-brand-300">
              Your 24/7 AI receptionist
            </p>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
              Never miss another call.{" "}
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                AIVA answers.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              AIVA answers your phone, books appointments, answers questions and
              takes orders — in your customer&apos;s language. Built for clinics,
              salons, restaurants and hotels.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/demo" className="btn-primary">
                🎙️ Talk to AIVA now
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                View the dashboard
              </Link>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                ["<1s", "answer time"],
                ["24/7", "availability"],
                ["8+", "languages"],
                ["100%", "calls logged"],
              ].map(([stat, label]) => (
                <div key={label} className="card !p-4 text-center">
                  <div className="text-3xl font-bold text-brand-400">{stat}</div>
                  <div className="mt-1 text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <div className="container-page">
            <h2 className="text-center text-3xl font-bold md:text-4xl">
              Everything a great receptionist does
            </h2>
            <p className="mt-3 text-center text-slate-400">
              Minus the sick days, hold times and missed calls.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="card">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section id="industries" className="bg-slate-900/40 py-20">
          <div className="container-page">
            <h2 className="text-center text-3xl font-bold md:text-4xl">
              Built for your business
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {INDUSTRIES.map((ind) => (
                <div key={ind.name} className="card flex gap-5">
                  <div className="text-4xl">{ind.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold">{ind.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {ind.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20">
          <div className="container-page">
            <h2 className="text-center text-3xl font-bold md:text-4xl">
              Live in an afternoon
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="card">
                  <div className="text-sm font-bold text-brand-400">{s.n}</div>
                  <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container-page">
            <div className="card bg-gradient-to-r from-brand-600/20 to-purple-600/20 py-14 text-center">
              <h2 className="text-3xl font-bold">Hear AIVA for yourself</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">
                Try the live demo — speak to AIVA in your browser and watch it
                book an appointment or take an order in real time.
              </p>
              <Link href="/demo" className="btn-primary mt-8">
                🎙️ Start the demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
