"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Business } from "@/lib/types";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const SPEECH_LOCALES: Record<string, string> = {
  en: "en-US", hi: "hi-IN", es: "es-ES", fr: "fr-FR",
  de: "de-DE", it: "it-IT", pt: "pt-BR", ja: "ja-JP",
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

  const business = businesses.find((b) => b.id === businessId);

  function speak(text: string) {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = SPEECH_LOCALES[lang] ?? "en-US";
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
      setTurns((t) => [...t, { role: "assistant", content: reply }]);
      speak(reply);
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
      <main className="container-page py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Talk to AIVA</h1>
          <p className="mt-2 text-slate-400">
            Pick a business, then speak or type — AIVA handles the rest.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex flex-wrap gap-3">
            <select
              value={businessId}
              onChange={(e) => {
                setBusinessId(e.target.value);
                reset();
              }}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.type})
                </option>
              ))}
            </select>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm"
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
            <div className="mb-4 rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
              {insight}
            </div>
          )}

          <div className="card flex h-[420px] flex-col overflow-y-auto">
            {turns.length === 0 && (
              <div className="m-auto text-center text-slate-500">
                <div className="text-4xl">📞</div>
                <p className="mt-3 text-sm">
                  {business
                    ? `You're calling ${business.name}. Say hello!`
                    : "Loading businesses…"}
                </p>
                <p className="mt-1 text-xs">
                  Try: &quot;I&apos;d like to book an appointment tomorrow at 3pm&quot;
                </p>
              </div>
            )}
            {turns.map((t, i) => (
              <div
                key={i}
                className={`mb-3 max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  t.role === "user"
                    ? "self-end bg-brand-600 text-white"
                    : "self-start bg-slate-800 text-slate-100"
                }`}
              >
                {t.content}
              </div>
            ))}
            {thinking && (
              <div className="mb-3 self-start rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-400">
                AIVA is thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="mt-4 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            {voiceSupported && (
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl transition ${
                  listening
                    ? "pulse-ring bg-red-500"
                    : "bg-brand-500 hover:bg-brand-400"
                }`}
                title={listening ? "Stop listening" : "Speak"}
              >
                <span className="relative z-10">{listening ? "⏹" : "🎙️"}</span>
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Or type your message…"}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
            <button type="submit" className="btn-primary !px-5" disabled={thinking}>
              Send
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Bookings and orders made here appear live in the{" "}
            <Link href="/dashboard" className="text-brand-400 hover:underline">
              dashboard
            </Link>
            .
          </p>
        </div>
      </main>
    </>
  );
}
