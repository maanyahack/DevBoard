import { Archive, CheckCircle2, ExternalLink, FolderKanban, Pencil, Rocket, Trash2 } from 'lucide-react';
import {
  projectStatusLabels,
  type Project,
  type ProjectStatus,
} from '@/features/projects/types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusStyles: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  active: 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
  archived: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
};

const statusIcons = {
  planning: FolderKanban,
  active: Rocket,
  completed: CheckCircle2,
  archived: Archive,
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const StatusIcon = statusIcons[project.status];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {projectStatusLabels[project.status]}
          </span>
          <h2 className="mt-3 line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            {project.name}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label="Edit project"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(project)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            aria-label="Delete project"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {project.description || 'No description yet.'}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            GitHub Repository
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">No repository linked</p>
        )}
      </div>
    </article>
  );
}
