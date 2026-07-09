import { useAuth } from '@/context/AuthContext';

const modules = [
  { label: 'Notes', hint: 'Capture ideas and docs' },
  { label: 'Tasks', hint: 'Track what is next' },
  { label: 'Projects', hint: 'Organize your work' },
  { label: 'Bookmarks', hint: 'Save useful links' },
  { label: 'Knowledge Vault', hint: 'Store your files' },
  { label: 'Snippets', hint: 'Reuse your code' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = (user?.user_metadata?.display_name as string | undefined) ?? user?.email;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Welcome back, {displayName}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Here is your workspace. Each module lights up as we build it in the next milestones.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <div
            key={module.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {module.label}
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                0
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{module.hint}</p>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">No items yet</p>
          </div>
        ))}
      </div>
    </div>
  );
}
