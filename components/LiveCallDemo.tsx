"use client";

import { useEffect, useRef, useState } from "react";
import Waveform from "./Waveform";

interface Step {
  role: "caller" | "aiva" | "event";
  text: string;
  pause: number; // ms before this step appears
}

// A scripted call that plays on loop in the hero — shows exactly what AIVA
// does (multilingual booking) without the visitor doing anything.
const SCRIPT: Step[] = [
  { role: "caller", text: "Hi! Do you have a table for two tonight?", pause: 1100 },
  { role: "aiva", text: "Of course! We have 7:30 or 9:00 free this evening — which works better?", pause: 1600 },
  { role: "caller", text: "7:30 please. Also… ¿tienen opciones veganas?", pause: 1800 },
  { role: "aiva", text: "¡Sí! Tenemos pizza vegana y pasta al pomodoro. Your table for two at 7:30 is confirmed 🎉", pause: 1900 },
  { role: "event", text: "📅 Booked · Table for 2 · 19:30 · SMS confirmation sent", pause: 1400 },
];

export default function LiveCallDemo() {
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function schedule(step: number) {
      if (cancelled) return;
      if (step >= SCRIPT.length) {
        // hold the finished call, then restart
        timer = setTimeout(() => {
          if (cancelled) return;
          setCount(0);
          schedule(0);
        }, 3800);
        return;
      }
      const s = SCRIPT[step];
      const showTyping = s.role === "aiva";
      if (showTyping) setTyping(true);
      timer = setTimeout(() => {
        if (cancelled) return;
        setTyping(false);
        setCount(step + 1);
        schedule(step + 1);
      }, s.pause);
    }

    schedule(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [count, typing]);

  const visible = SCRIPT.slice(0, count);

  return (
    <div className="card-glow mx-auto w-full max-w-md animate-floaty">
      <div className="!p-0 overflow-hidden">
        {/* phone header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-sm font-bold">
              AI
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0d17] bg-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-semibold">Bella Notte Trattoria</div>
              <div className="text-xs text-emerald-400">● Live call · AIVA answering</div>
            </div>
          </div>
          <Waveform />
        </div>

        {/* transcript */}
        <div ref={scrollRef} className="flex h-72 flex-col gap-3 overflow-y-auto p-5">
          {visible.map((s, i) =>
            s.role === "event" ? (
              <div
                key={i}
                className="animate-fade-up self-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-300"
              >
                {s.text}
              </div>
            ) : (
              <div
                key={i}
                className={`animate-fade-up max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  s.role === "caller"
                    ? "self-end rounded-br-md bg-brand-600/90 text-white"
                    : "self-start rounded-bl-md bg-white/[0.06] text-slate-200"
                }`}
              >
                {s.text}
              </div>
            )
          )}
          {typing && (
            <div className="typing-dots flex gap-1 self-start rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
