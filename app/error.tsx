"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-6xl">📴</div>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
        The line dropped.
      </h1>
      <p className="mt-3 max-w-md text-slate-400">
        Something went wrong on our end. AIVA has logged it — try again.
      </p>
      <button onClick={reset} className="btn-primary mt-8">
        Redial
      </button>
    </main>
  );
}
