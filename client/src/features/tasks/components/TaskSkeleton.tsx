export function TaskSkeleton() {
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700" />
          </div>
          <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          </div>
          <div className="mt-6 h-px bg-slate-100 dark:bg-slate-700" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}
