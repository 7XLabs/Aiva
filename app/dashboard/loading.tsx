export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-slate-800/80" />
      <div className="h-4 w-72 rounded bg-slate-800/60" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-800/50" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-800/40" />
        ))}
      </div>
    </div>
  );
}
