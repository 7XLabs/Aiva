"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How is AIVA different from an IVR or phone tree?",
    a: "There are no menus and no 'press 1'. AIVA holds a natural conversation, understands context, switches languages mid-call, and actually completes tasks — booking, ordering, answering — instead of routing you around.",
  },
  {
    q: "What happens when AIVA can't handle a call?",
    a: "It transfers to your staff with full context, or logs a callback request as an action item in your dashboard. No caller ever hits a dead end.",
  },
  {
    q: "How long does setup take?",
    a: "Minutes. Describe your business in plain English on the onboarding page and AIVA generates its own configuration — services, FAQs, menu, languages. Point your Twilio number at it and you're live.",
  },
  {
    q: "Which languages does AIVA speak?",
    a: "English, Hindi, Spanish, French, German, Italian, Portuguese and Japanese today — and it detects the caller's language automatically, mid-sentence.",
  },
  {
    q: "Do I keep my existing phone number?",
    a: "Yes. Forward your existing number to AIVA, or port it. Callers never know anything changed — except that someone finally answers.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`card !p-0 overflow-hidden transition-colors ${
              isOpen ? "border-brand-500/40" : ""
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-medium">{f.q}</span>
              <span
                className={`shrink-0 text-brand-400 transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
