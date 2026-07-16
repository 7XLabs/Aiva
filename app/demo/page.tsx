"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Waveform from "@/components/Waveform";
import type { Business } from "@/lib/types";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const SPEECH_LOCALES: Record<string, string> = {
  en: "en-US", hi: "hi-IN", es: "es-ES", fr: "fr-FR",
  de: "de-DE", it: "it-IT", pt: "pt-BR", ja: "ja-JP",
};

const TYPE_EMOJI: Record<string, string> = {
  clinic: "🏥", salon: "💇", restaurant: "🍕", hotel: "🏨",
};

// One-tap conversation starters, tailored per business type.
const QUICK_PROMPTS: Record<string, string[]> = {
  clinic: [
    "I'd like to book a checkup tomorrow at 3pm",
    "Do you accept walk-ins?",
    "What times are free on Friday?",
  ],
  salon: [
    "Can I get a haircut this Saturday?",
    "How much is hair coloring?",
    "I need to reschedule my appointment",
  ],
  restaurant: [
    "I'd like to order two margherita pizzas for pickup",
    "Do you have vegan options?",
    "Table for four tonight at 8?",
  ],
  hotel: [
    "Do you have a king room this weekend?",
    "What time is check-in?",
    "¿Hablan español?",
  ],
};

export default function DemoPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("biz_clinic");
  const [lang, setLang] = useState("en");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [ending, setEnding] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const callIdRef = useRef<string>(`web_${Date.now().toString(36)}`);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => r.json())
      .then(setBusinesses)
      .catch(() => {});
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) setVoiceSupported(false);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, thinking]);

  // Escape stops the mic and playback; "/" focuses the composer.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        recognitionRef.current?.stop();
        setListening(false);
        window.speechSynthesis?.cancel();
      }
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const business = businesses.find((b) => b.id === businessId);

  function speakIn(text: string, langCode: string) {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = SPEECH_LOCALES[langCode] ?? "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {
      // speech synthesis unavailable — text is still shown
    }
  }

  async function send(message: string) {
    const text = message.trim();
    if (!text || thinking) return;
    setInput("");
    const history = turns;
    setTurns((t) => [...t, { role: "user", content: text }]);
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          history,
          message: text,
          callId: callIdRef.current,
        }),
      });
      const data = await res.json();
      const reply: string =
        data.reply ?? "Sorry, something went wrong. Please try again.";
      // Follow the agent's language switch so browser TTS/STT match.
      if (data.language && SPEECH_LOCALES[data.language]) setLang(data.language);
      setTurns((t) => [...t, { role: "assistant", content: reply }]);
      speakIn(reply, data.language ?? lang);
    } catch {
      setTurns((t) => [
        ...t,
        { role: "assistant", content: "Connection error — please try again." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function startListening() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = SPEECH_LOCALES[lang] ?? "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      send(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function reset() {
    setTurns([]);
    setInsight(null);
    callIdRef.current = `web_${Date.now().toString(36)}`;
    window.speechSynthesis?.cancel();
  }

  // Hang up: triggers the same post-call intelligence a phone call gets.
  async function endCall() {
    if (turns.length === 0 || ending) return;
    setEnding(true);
    setInsight(null);
    try {
      const res = await fetch("/api/calls/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: callIdRef.current }),
      });
      const call = await res.json();
      if (res.ok && call.summary) {
        setInsight(
          `📋 ${call.summary} · sentiment: ${call.sentiment ?? "n/a"}` +
            (call.upsellOpportunity ? ` · 💡 ${call.upsellOpportunity}` : "")
        );
      } else {
        setInsight("Call saved to the dashboard.");
      }
    } catch {
      setInsight("Call saved to the dashboard.");
    } finally {
      setEnding(false);
      callIdRef.current = `web_${Date.now().toString(36)}`;
      setTurns([]);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container-page relative py-12">
        <div className="orb left-[-8%] top-[5%] h-80 w-80 animate-orb bg-brand-600/30" aria-hidden />
        <div className="orb right-[-8%] bottom-[10%] h-80 w-80 animate-orb bg-purple-600/25 [animation-delay:-10s]" aria-hidden />

        <div className="relative mb-10 text-center">
          <p className="eyebrow">Live demo</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Talk to AIVA.
          </h1>
          <p className="mt-3 text-slate-400">
            Pick a business, then speak or type — AIVA handles the rest.
          </p>
        </div>

        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 flex flex-wrap gap-3">
            <select
              value={businessId}
              onChange={(e) => {
                setBusinessId(e.target.value);
                reset();
              }}
              className="min-w-52 flex-1 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {TYPE_EMOJI[b.type] ?? "📞"} {b.name}
                </option>
              ))}
            </select>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500"
            >
              {Object.keys(SPEECH_LOCALES).map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={endCall}
              disabled={turns.length === 0 || ending}
              className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-40"
              title="Hang up and run post-call analysis"
            >
              {ending ? "Analyzing…" : "☎️ End call"}
            </button>
            <button onClick={reset} className="btn-secondary !px-4 !py-2 text-sm">
              Reset
            </button>
          </div>

          {insight && (
            <div className="mb-4 animate-fade-up rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-3 text-sm leading-relaxed text-brand-200">
              {insight}
            </div>
          )}

          {/* phone frame */}
          <div className="card-glow">
            <div className="!p-0 overflow-hidden">
              {/* call header */}
              <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-lg">
                    {business ? TYPE_EMOJI[business.type] ?? "📞" : "📞"}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0d17] ${
                        turns.length > 0 ? "bg-emerald-400" : "bg-slate-500"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {business?.name ?? "Loading…"}
                    </div>
                    <div
                      className={`text-xs ${
                        turns.length > 0 ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {thinking
                        ? "AIVA is thinking…"
                        : listening
                        ? "Listening to you…"
                        : turns.length > 0
                        ? "● On call with AIVA"
                        : "Ready to answer"}
                    </div>
                  </div>
                </div>
                {(thinking || listening || turns.length > 0) && <Waveform />}
              </div>

              {/* transcript */}
              <div
                className="flex h-[400px] flex-col gap-3 overflow-y-auto p-5"
                aria-live="polite"
                aria-label="Conversation transcript"
              >
                {turns.length === 0 && (
                  <div className="m-auto text-center text-slate-500">
                    <div className="animate-floaty text-5xl">🎙️</div>
                    <p className="mt-4 text-sm">
                      {business
                        ? `You're calling ${business.name}. Say hello!`
                        : "Loading businesses…"}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600">
                      Try: &quot;I&apos;d like to book an appointment tomorrow at 3pm&quot;
                    </p>
                  </div>
                )}
                {turns.map((t, i) => (
                  <div
                    key={i}
                    className={`animate-fade-up max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      t.role === "user"
                        ? "self-end rounded-br-md bg-brand-600/90 text-white"
                        : "self-start rounded-bl-md bg-white/[0.06] text-slate-100"
                    }`}
                  >
                    {t.content}
                  </div>
                ))}
                {thinking && (
                  <div className="typing-dots flex gap-1 self-start rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* quick prompts */}
              {turns.length === 0 && business && (
                <div className="flex flex-wrap gap-2 border-t border-white/5 px-4 pt-3">
                  {(QUICK_PROMPTS[business.type] ?? []).map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-brand-500/60 hover:text-white"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* composer */}
              <form
                className="flex gap-3 border-t border-white/5 bg-white/[0.02] p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={listening ? stopListening : startListening}
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl transition-all duration-300 ${
                      listening
                        ? "pulse-ring bg-red-500"
                        : "bg-gradient-to-br from-brand-400 to-brand-600 hover:scale-105"
                    }`}
                    title={listening ? "Stop listening" : "Speak"}
                  >
                    <span className="relative z-10">{listening ? "⏹" : "🎙️"}</span>
                  </button>
                )}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? "Listening…" : "Or type your message… (press / to focus)"}
                  className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
                <button type="submit" className="btn-primary !px-5" disabled={thinking}>
                  Send
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Bookings and orders made here appear live in the{" "}
            <Link href="/dashboard" className="text-brand-400 hover:underline">
              dashboard
            </Link>
            {" "}— hang up to see AIVA&apos;s post-call analysis.
          </p>
        </div>
      </main>
    </>
  );
}
