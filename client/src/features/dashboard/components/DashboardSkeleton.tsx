export function DashboardSkeleton() {
  return (
    <div className="mt-8 space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]"
          >
            <div className="skeleton h-3 w-24 rounded" />
            <div className="mt-4 skeleton h-8 w-14 rounded" />
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-7 w-36 rounded-lg" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
        </div>
      </div>

      {/* Data panels */}
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]"
          >
            <div className="border-b border-[var(--border-subtle)] px-5 py-3.5">
              <div className="skeleton h-3 w-28 rounded" />
            </div>
            <div className="space-y-2 p-5">
              {Array.from({ length: 3 }).map((__, itemIndex) => (
                <div
                  key={itemIndex}
                  className="skeleton h-14 rounded-lg"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
