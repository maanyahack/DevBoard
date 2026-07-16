import {
  Archive,
  CheckCircle2,
  ExternalLink,
  FolderKanban,
  Pencil,
  Rocket,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  projectStatusLabels,
  type Project,
  type ProjectStatus,
} from '@/features/projects/types';
import { RepositoryPreview } from '@/features/projects/components/RepositoryPreview';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onGenerateTasks?: (project: Project) => void;
}

const statusStyles: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-700/60 dark:text-slate-300 dark:ring-slate-400/20',
  active: 'bg-sky-50 text-sky-700 ring-sky-500/15 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  archived: 'bg-amber-50 text-amber-700 ring-amber-500/15 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
};

const statusIcons = {
  planning: FolderKanban,
  active: Rocket,
  completed: CheckCircle2,
  archived: Archive,
};

export function ProjectCard({ project, isSelected, selectionMode, onSelect, onEdit, onDelete, onGenerateTasks }: ProjectCardProps) {
  const StatusIcon = statusIcons[project.status];

  return (
    <article
      className={`group relative rounded-xl border bg-white p-5 shadow-sm transition-all duration-150 dark:bg-slate-800 ${
        isSelected
          ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500'
          : 'border-slate-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-md dark:border-slate-700/80 dark:hover:border-slate-600 dark:hover:shadow-black/20'
      }`}
    >
      {/* Checkbox */}
      <label
        className={`absolute left-3 top-3 z-10 flex h-5 w-5 cursor-pointer items-center justify-center transition-opacity duration-150 ${
          selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-label={isSelected ? 'Deselect project' : 'Select project'}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(project.id)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          onClick={(e) => e.stopPropagation()}
        />
      </label>

      {/* Header */}
      <div className={`flex items-start justify-between gap-4 ${selectionMode ? 'pl-7' : ''}`}>
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[project.status]}`}
          >
            <StatusIcon className="h-3 w-3" />
            {projectStatusLabels[project.status]}
          </span>
          <h2 className="mt-2.5 line-clamp-2 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {project.name}
          </h2>
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {onGenerateTasks && (
            <button
              type="button"
              onClick={() => onGenerateTasks(project)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
              aria-label="Generate tasks with AI"
              title="Generate tasks with AI"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label="Edit project"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(project)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            aria-label="Delete project"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-3 min-h-[3.5rem] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {project.description || 'No description yet.'}
      </p>

      {/* GitHub section */}
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700/60">
        {project.githubUrl ? (
          <>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 transition-colors duration-150 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              GitHub Repository
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <RepositoryPreview githubUrl={project.githubUrl} />
          </>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">No repository linked.</p>
        )}
      </div>
    </article>
  );
}
