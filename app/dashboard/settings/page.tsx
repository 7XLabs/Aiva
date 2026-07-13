"use client";

import { useEffect, useState } from "react";
import type { Business } from "@/lib/types";

export default function SettingsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

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
