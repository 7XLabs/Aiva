"use client";

import { useEffect, useState } from "react";
import type { Business } from "@/lib/types";
import type { FaqSuggestion } from "@/lib/faqSuggest";

export default function SettingsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<FaqSuggestion[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestNote, setSuggestNote] = useState<string | null>(null);

  async function fetchSuggestions() {
    if (!selected) return;
    setSuggesting(true);
    setSuggestNote(null);
    try {
      const res = await fetch(`/api/faq-suggestions?businessId=${selected.id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setSuggestions(data.suggestions);
      if (data.suggestions.length === 0) {
        setSuggestNote("No gaps found — your FAQs cover what callers ask. 🎉");
      }
    } catch (e) {
      setSuggestNote(e instanceof Error ? e.message : "Suggestion failed");
    } finally {
      setSuggesting(false);
    }
  }

  function acceptSuggestion(s: FaqSuggestion) {
    if (!selected) return;
    update({
      faqs: [
        ...selected.faqs,
        { id: `f_${Date.now()}`, question: s.question, answer: s.draft_answer },
      ],
    });
    setSuggestions((list) => list.filter((x) => x.question !== s.question));
  }

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => r.json())
      .then((list: Business[]) => {
        setBusinesses(list);
        setSelected(list[0] ?? null);
      })
      .catch(() => {});
  }, []);

  function update(patch: Partial<Business>) {
    if (!selected) return;
    setSelected({ ...selected, ...patch });
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/businesses/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      if (res.ok) {
        setSavedAt(Date.now());
        setBusinesses((bs) =>
          bs.map((b) => (b.id === selected.id ? selected : b))
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (!selected) {
    return <div className="text-sm text-slate-400">Loading…</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Knowledge</h1>
          <p className="mt-1 text-sm text-slate-400">
            Teach AIVA live — changes apply to the very next call.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selected.id}
            onChange={(e) =>
              setSelected(businesses.find((b) => b.id === e.target.value) ?? null)
            }
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <a
            href={`/api/businesses/${selected.id}/export`}
            className="btn-secondary !px-3 !py-2 text-xs"
            title="Download this configuration as JSON"
          >
            ⬇ Export
          </a>
          <label className="btn-secondary cursor-pointer !px-3 !py-2 text-xs" title="Import a config JSON as a new business">
            ⬆ Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const body = await file.text();
                  const res = await fetch("/api/businesses/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body,
                  });
                  const created = await res.json();
                  if (!res.ok) throw new Error(created.error ?? "import failed");
                  setBusinesses((bs) => [...bs, created]);
                  setSelected(created);
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Import failed");
                } finally {
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold">Basics</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Business name" value={selected.name} onChange={(v) => update({ name: v })} />
          <Field label="Hours" value={selected.hours} onChange={(v) => update({ hours: v })} />
          <Field label="Phone" value={selected.phone} onChange={(v) => update({ phone: v })} />
          <Field label="Address" value={selected.address} onChange={(v) => update({ address: v })} />
          <Field
            label="Staff transfer number (optional)"
            value={selected.staffPhone ?? ""}
            onChange={(v) => update({ staffPhone: v || undefined })}
          />
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold">Voice &amp; announcements</h2>
        <div className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="text-slate-400">
              Custom greeting (optional — use {"{name}"} for the business name)
            </span>
            <input
              value={selected.greeting ?? ""}
              onChange={(e) => update({ greeting: e.target.value || undefined })}
              placeholder={`Thank you for calling ${selected.name}. This is AIVA…`}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">
              Announcement — read to every caller while set
            </span>
            <input
              value={selected.announcement ?? ""}
              onChange={(e) =>
                update({ announcement: e.target.value || undefined })
              }
              placeholder="We close at 3 PM this Friday for staff training."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">
              Outbound webhook URL — AIVA POSTs booking/order/callback events here
              (Zapier, n8n, your backend)
            </span>
            <input
              value={selected.webhookUrl ?? ""}
              onChange={(e) => update({ webhookUrl: e.target.value || undefined })}
              placeholder="https://hooks.zapier.com/…"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">
              Holiday closures — comma-separated dates (YYYY-MM-DD), never bookable
            </span>
            <input
              value={(selected.holidays ?? []).join(", ")}
              onChange={(e) =>
                update({
                  holidays: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)),
                })
              }
              placeholder="2026-12-25, 2027-01-01"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold">Languages AIVA answers in</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["en", "hi", "es", "fr", "de", "it", "pt", "ja"].map((code) => {
            const active = selected.languages.includes(code);
            return (
              <button
                key={code}
                onClick={() =>
                  update({
                    languages: active
                      ? selected.languages.filter((l) => l !== code)
                      : [...selected.languages, code],
                  })
                }
                className={`rounded-full border px-4 py-1.5 text-sm uppercase transition ${
                  active
                    ? "border-brand-500/60 bg-brand-500/20 text-brand-200"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Services</h2>
          <button
            className="text-sm text-brand-400 hover:underline"
            onClick={() =>
              update({
                services: [
                  ...selected.services,
                  { id: `svc_${Date.now()}`, name: "New service", durationMinutes: 30, price: 0 },
                ],
              })
            }
          >
            + Add service
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {selected.services.map((s, i) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3">
              <input
                value={s.name}
                onChange={(e) => {
                  const services = [...selected.services];
                  services[i] = { ...s, name: e.target.value };
                  update({ services });
                }}
                className="min-w-40 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={s.durationMinutes}
                onChange={(e) => {
                  const services = [...selected.services];
                  services[i] = { ...s, durationMinutes: Number(e.target.value) };
                  update({ services });
                }}
                className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                title="Duration (min)"
              />
              <input
                type="number"
                value={s.price}
                onChange={(e) => {
                  const services = [...selected.services];
                  services[i] = { ...s, price: Number(e.target.value) };
                  update({ services });
                }}
                className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                title="Price"
              />
              <button
                className="text-slate-500 hover:text-red-400"
                onClick={() =>
                  update({ services: selected.services.filter((x) => x.id !== s.id) })
                }
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {selected.menu && (
        <div className="card mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Menu</h2>
            <button
              className="text-sm text-brand-400 hover:underline"
              onClick={() =>
                update({
                  menu: [
                    ...(selected.menu ?? []),
                    {
                      id: `m_${Date.now()}`,
                      name: "New item",
                      description: "",
                      price: 0,
                      category: "Mains",
                      available: true,
                    },
                  ],
                })
              }
            >
              + Add item
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {selected.menu.map((m, i) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3">
                <input
                  value={m.name}
                  onChange={(e) => {
                    const menu = [...selected.menu!];
                    menu[i] = { ...m, name: e.target.value };
                    update({ menu });
                  }}
                  className="min-w-40 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={m.price}
                  onChange={(e) => {
                    const menu = [...selected.menu!];
                    menu[i] = { ...m, price: Number(e.target.value) };
                    update({ menu });
                  }}
                  className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  title="Price"
                />
                <button
                  onClick={() => {
                    const menu = [...selected.menu!];
                    menu[i] = { ...m, available: !m.available };
                    update({ menu });
                  }}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                    m.available
                      ? "border-emerald-500/40 text-emerald-300"
                      : "border-slate-600 text-slate-500"
                  }`}
                  title="Toggle availability — 86'd items are refused on calls"
                >
                  {m.available ? "available" : "86'd"}
                </button>
                <button
                  className="text-slate-500 hover:text-red-400"
                  onClick={() =>
                    update({ menu: selected.menu!.filter((x) => x.id !== m.id) })
                  }
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">FAQs</h2>
          <button
            className="text-sm text-brand-400 hover:underline"
            onClick={() =>
              update({
                faqs: [
                  ...selected.faqs,
                  { id: `f_${Date.now()}`, question: "New question?", answer: "" },
                ],
              })
            }
          >
            + Add FAQ
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {selected.faqs.map((f, i) => (
            <div key={f.id} className="rounded-xl border border-slate-800 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <input
                    value={f.question}
                    onChange={(e) => {
                      const faqs = [...selected.faqs];
                      faqs[i] = { ...f, question: e.target.value };
                      update({ faqs });
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium"
                  />
                  <textarea
                    value={f.answer}
                    rows={2}
                    onChange={(e) => {
                      const faqs = [...selected.faqs];
                      faqs[i] = { ...f, answer: e.target.value };
                      update({ faqs });
                    }}
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300"
                  />
                </div>
                <button
                  className="text-slate-500 hover:text-red-400"
                  onClick={() =>
                    update({ faqs: selected.faqs.filter((x) => x.id !== f.id) })
                  }
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-6 border-amber-500/30">
        <h2 className="font-semibold">📢 Emergency broadcast</h2>
        <p className="mt-1 text-xs text-slate-500">
          Text everyone with an appointment today — closures, delays, weather.
          One message per customer.
        </p>
        <BroadcastForm businessId={selected.id} />
      </div>

      <div className="card mt-6 border-brand-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">🧠 FAQs AIVA thinks you&apos;re missing</h2>
            <p className="mt-1 text-xs text-slate-500">
              Mined from real calls it couldn&apos;t fully answer. Accept to add —
              then edit any [FILL IN] placeholders above.
            </p>
          </div>
          <button
            onClick={fetchSuggestions}
            disabled={suggesting}
            className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-50"
          >
            {suggesting ? "Mining call history…" : "Find knowledge gaps"}
          </button>
        </div>
        {suggestNote && <p className="mt-3 text-sm text-slate-400">{suggestNote}</p>}
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            {suggestions.map((s) => (
              <div key={s.question} className="animate-fade-up rounded-xl border border-slate-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{s.question}</div>
                    <p className="mt-1 text-sm text-slate-400">{s.draft_answer}</p>
                    <p className="mt-2 text-xs text-slate-600">↳ {s.evidence}</p>
                  </div>
                  <button
                    onClick={() => acceptSuggestion(s)}
                    className="btn-primary shrink-0 !px-3 !py-1.5 text-xs"
                  >
                    + Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-3">
        {savedAt && Date.now() - savedAt < 4000 && (
          <span className="text-sm text-emerald-400">Saved ✓</span>
        )}
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function BroadcastForm({ businessId }: { businessId: string }) {
  const [message, setMessage] = useState("");
  const [scope, setScope] = useState<"today" | "tomorrow" | "both">("today");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send() {
    if (!message.trim() || busy) return;
    if (!confirm(`Text every customer with an appointment (${scope})?`)) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, message, scope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setResult(
        `Matched ${data.matched} customer${data.matched === 1 ? "" : "s"}, sent ${data.sent} SMS${
          data.sent === 0 ? " (Twilio not configured?)" : ""
        }.`
      );
      setMessage("");
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Broadcast failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="We're closing at 2 PM today due to a power outage."
        className="min-w-64 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
      />
      <select
        value={scope}
        onChange={(e) => setScope(e.target.value as typeof scope)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
      >
        <option value="today">Today&apos;s appointments</option>
        <option value="tomorrow">Tomorrow&apos;s</option>
        <option value="both">Both days</option>
      </select>
      <button
        onClick={send}
        disabled={busy || !message.trim()}
        className="btn-secondary !border-amber-500/40 !px-4 !py-2 text-sm !text-amber-300 disabled:opacity-40"
      >
        {busy ? "Sending…" : "Send broadcast"}
      </button>
      {result && <p className="w-full text-xs text-slate-400">{result}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
      />
    </label>
  );
}
