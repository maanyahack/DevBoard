export function DashboardSkeleton() {
  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="h-5 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((__, itemIndex) => (
                <div
                  key={itemIndex}
                  className="h-12 animate-pulse rounded bg-slate-100 dark:bg-slate-700"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
