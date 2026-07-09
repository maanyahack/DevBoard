/**
 * Reusable placeholder for modules whose functionality lands in later
 * milestones. Keeps sidebar navigation fully working (active states, no dead
 * links) without implementing any feature logic yet.
 */
export default function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {title} arrives in a future milestone. The navigation and layout are ready for it.
        </p>
      </div>
    </div>
  );
}
