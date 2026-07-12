import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import LiveCallDemo from "@/components/LiveCallDemo";
import FaqAccordion from "@/components/FaqAccordion";

const FEATURES = [
  {
    icon: "📞",
    title: "Answers every call",
    body: "AIVA picks up 24/7 in under a second. No hold music, no missed customers, no voicemail black hole.",
  },
  {
    icon: "📅",
    title: "Books appointments",
    body: "Checks live availability, proactively offers free slots, confirms details back, and texts an SMS confirmation.",
  },
  {
    icon: "🧠",
    title: "Post-call intelligence",
    body: "Every call gets a summary, caller sentiment, staff action items — and upsell opportunities spotted in conversation.",
  },
  {
    icon: "🍽️",
    title: "Takes orders",
    body: "Full order capture with item-by-item confirmation, pickup or delivery, and an accurate total every time.",
  },
  {
    icon: "🌍",
    title: "Speaks 8+ languages",
    body: "AIVA detects the caller's language mid-sentence and switches instantly — greetings in English, dessert in Spanish.",
  },
  {
    icon: "✨",
    title: "Onboards itself",
    body: "Describe your business in plain English. AIVA generates its own services, FAQs and menu — live in minutes.",
  },
];

const INDUSTRIES = [
  {
    icon: "🏥",
    name: "Clinics",
    body: "Appointment booking, insurance questions and walk-in guidance — while your front desk focuses on patients in the room.",
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

const TESTIMONIALS = [
  {
    quote:
      "We used to miss 30+ calls a week during dinner service. Now every single one is answered — and the order totals are always right.",
    name: "Marco B.",
    role: "Owner, Bella Notte Trattoria",
  },
  {
    quote:
      "Half our patients prefer Hindi. AIVA switches languages mid-call like it's nothing. Our front desk finally breathes.",
    name: "Dr. Priya S.",
    role: "Sunrise Family Clinic",
  },
  {
    quote:
      "The upsell radar paid for itself in a month. It noticed callers kept asking about keratin — we added it to the menu.",
    name: "Elena R.",
    role: "Luxe Hair & Beauty",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    tagline: "For a single line",
    features: ["1 phone line", "200 calls / month", "Bookings & FAQs", "Dashboard & transcripts"],
    featured: false,
  },
  {
    name: "Growth",
    price: "$149",
    tagline: "Most popular",
    features: [
      "3 phone lines",
      "Unlimited calls",
      "Orders + SMS confirmations",
      "Post-call intelligence & analytics",
      "8+ languages",
    ],
    featured: true,
  },
  {
    name: "Scale",
    price: "Custom",
    tagline: "Multi-location",
    features: ["Unlimited lines", "CRM & calendar integrations", "Custom voices", "Priority support"],
    featured: false,
  },
];

const LANGS = ["English", "हिन्दी", "Español", "Français", "Deutsch", "Italiano", "Português", "日本語"];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        {/* ---------- Hero ---------- */}
        <section className="relative pb-24 pt-16 md:pt-24">
          <div className="orb left-[-10%] top-[-5%] h-96 w-96 animate-orb bg-brand-600/50" aria-hidden />
          <div className="orb right-[-12%] top-[30%] h-[28rem] w-[28rem] animate-orb bg-purple-600/40 [animation-delay:-8s]" aria-hidden />

          <div className="container-page relative grid items-center gap-14 lg:grid-cols-2">
            <div>
              <Reveal>
                <p className="eyebrow">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Your 24/7 AI receptionist
                </p>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                  Never miss
                  <br />
                  another call.
                  <br />
                  <em className="text-gradient not-italic">AIVA answers.</em>
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-400">
                  AIVA answers your phone, books appointments, takes orders and
                  answers questions — in your customer&apos;s language. Built
                  for clinics, salons, restaurants and hotels.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-9 flex flex-wrap gap-4">
                  <Link href="/demo" className="btn-primary">
                    🎙️ Talk to AIVA now
                  </Link>
                  <Link href="/onboard" className="btn-secondary">
                    ✨ Build yours in 2 minutes
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={400}>
                <div className="mt-10 flex items-center gap-8 text-sm text-slate-500">
                  {[
                    ["<1s", "answer time"],
                    ["24/7", "always on"],
                    ["8+", "languages"],
                  ].map(([stat, label]) => (
                    <div key={label}>
                      <div className="font-display text-2xl font-semibold text-slate-100">{stat}</div>
                      <div className="mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={250} className="relative">
              <LiveCallDemo />
            </Reveal>
          </div>

          {/* language marquee */}
          <div className="marquee-mask relative mt-20 overflow-hidden">
            <div className="flex w-max animate-marquee gap-4">
              {[...LANGS, ...LANGS, ...LANGS, ...LANGS].map((l, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap rounded-full border border-white/5 bg-white/[0.03] px-5 py-2 text-sm text-slate-400"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Features ---------- */}
        <section id="features" className="py-24">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow">Capabilities</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Everything a great receptionist does.
                <span className="text-slate-500"> And a few things none can.</span>
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="card card-hover h-full">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 text-2xl">
                      {f.icon}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Industries ---------- */}
        <section id="industries" className="relative py-24">
          <div className="orb left-[40%] top-[10%] h-80 w-80 animate-orb bg-brand-700/30" aria-hidden />
          <div className="container-page relative">
            <Reveal>
              <p className="eyebrow">Industries</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Built for your front desk.
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {INDUSTRIES.map((ind, i) => (
                <Reveal key={ind.name} delay={i * 100}>
                  <div className="card card-hover flex h-full gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 text-3xl">
                      {ind.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{ind.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">{ind.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Testimonials ---------- */}
        <section className="py-24">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow">Loved by owners</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                The phone stopped being a problem.
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 100}>
                  <figure className="card card-hover flex h-full flex-col">
                    <div className="text-brand-400" aria-hidden>★★★★★</div>
                    <blockquote className="mt-4 flex-1 font-display text-lg leading-relaxed text-slate-200">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-6 text-sm">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-slate-500">{t.role}</div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Pricing ---------- */}
        <section id="pricing" className="relative py-24">
          <div className="orb right-[5%] top-[20%] h-72 w-72 animate-orb bg-purple-700/30" aria-hidden />
          <div className="container-page relative">
            <Reveal>
              <div className="text-center">
                <p className="eyebrow">Pricing</p>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  Cheaper than one missed booking a day.
                </h2>
              </div>
            </Reveal>
            <div className="mx-auto mt-14 grid max-w-4xl gap-5 lg:grid-cols-3">
              {PLANS.map((p, i) => (
                <Reveal key={p.name} delay={i * 100}>
                  {p.featured ? (
                    <div className="card-glow h-full">
                      <div className="flex h-full flex-col">
                        <PlanBody plan={p} />
                      </div>
                    </div>
                  ) : (
                    <div className="card card-hover flex h-full flex-col">
                      <PlanBody plan={p} />
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="py-24">
          <div className="container-page">
            <Reveal>
              <div className="text-center">
                <p className="eyebrow">FAQ</p>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight">
                  Questions, answered.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="mt-12">
                <FaqAccordion />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="pb-28">
          <div className="container-page">
            <Reveal>
              <div className="card-glow">
                <div className="relative overflow-hidden !p-14 text-center">
                  <div className="orb left-[20%] top-[-40%] h-64 w-64 animate-orb bg-brand-500/40" aria-hidden />
                  <h2 className="relative font-display text-4xl font-semibold tracking-tight md:text-5xl">
                    Hear AIVA for yourself.
                  </h2>
                  <p className="relative mx-auto mt-4 max-w-xl text-slate-400">
                    Speak to AIVA in your browser and watch it book an
                    appointment, take an order, and switch languages — live.
                  </p>
                  <div className="relative mt-9 flex flex-wrap justify-center gap-4">
                    <Link href="/demo" className="btn-primary">
                      🎙️ Start the demo
                    </Link>
                    <Link href="/onboard" className="btn-secondary">
                      Build your receptionist
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PlanBody({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
        <span className={`text-xs ${plan.featured ? "text-brand-300" : "text-slate-500"}`}>
          {plan.tagline}
        </span>
      </div>
      <div className="mt-4 font-display text-4xl font-semibold">
        {plan.price}
        {plan.price.startsWith("$") && (
          <span className="text-base font-normal text-slate-500">/mo</span>
        )}
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-300">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span className="mt-0.5 text-emerald-400">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/onboard"
        className={`${plan.featured ? "btn-primary" : "btn-secondary"} mt-8 w-full`}
      >
        Get started
      </Link>
    </>
  );
}
