import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const previewResults = [
  { label: 'Note', title: 'Sprint planning notes', tint: 'text-indigo-600 bg-indigo-50' },
  { label: 'Task', title: 'Fix auth redirect bug', tint: 'text-amber-600 bg-amber-50' },
  { label: 'Snippet', title: 'useDebounce.ts', tint: 'text-emerald-600 bg-emerald-50' },
];

function CommandPalettePreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/40">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <svg
            className="h-4 w-4 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-sm text-slate-400">Search everything…</span>
          <kbd className="ml-auto rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-500">
            ⌘K
          </kbd>
        </div>
        <ul className="p-2">
          {previewResults.map((r) => (
            <li
              key={r.title}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-slate-50"
            >
              <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${r.tint}`}>
                {r.label}
              </span>
              <span className="text-slate-700">{r.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="bg-dot-grid relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-medium text-indigo-600">
            Built for developers
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Every note, task, and snippet — on one board.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-slate-600">
            DevBoard pulls the scattered pieces of your workflow — notes, tasks, projects,
            bookmarks, files, and code snippets — into one fast workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button className="px-6 py-3">Get started free</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-6 py-3">
                Log in
              </Button>
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-slate-400">No credit card required.</p>
        </div>
        <CommandPalettePreview />
      </div>
    </section>
  );
}
