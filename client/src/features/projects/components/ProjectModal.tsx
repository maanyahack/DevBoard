import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type {
  Project,
  ProjectEditableFields,
  ProjectStatus,
} from '@/features/projects/types';

interface ProjectModalProps {
  project?: Project | null;
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (fields: ProjectEditableFields) => void;
}

const emptyFields: ProjectEditableFields = {
  name: '',
  description: '',
  status: 'planning',
  githubUrl: null,
  sortOrder: 0,
};

export function ProjectModal({
  project,
  isOpen,
  isSaving = false,
  onClose,
  onSave,
}: ProjectModalProps) {
  const [fields, setFields] = useState<ProjectEditableFields>(emptyFields);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setFields(
      project
        ? {
            name: project.name,
            description: project.description,
            status: project.status,
            githubUrl: project.githubUrl,
            sortOrder: project.sortOrder,
          }
        : emptyFields,
    );
    setNameError('');
  }, [isOpen, project]);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedFields = {
      ...fields,
      name: fields.name.trim(),
      description: fields.description.trim(),
      githubUrl: fields.githubUrl?.trim() || null,
    };

    if (!normalizedFields.name) {
      setNameError('Project name is required.');
      return;
    }

    onSave(normalizedFields);
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {project ? 'Edit project' : 'Create project'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label="Close project editor"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <Input
            id="project-name"
            label="Project name"
            value={fields.name}
            onChange={(event) => {
              setFields((current) => ({ ...current, name: event.target.value }));
              setNameError('');
            }}
            placeholder="DevBoard Core"
            error={nameError}
            autoFocus
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="project-status"
              label="Status"
              value={fields.status}
              onChange={(value) =>
                setFields((current) => ({ ...current, status: value as ProjectStatus }))
              }
              options={[
                ['planning', 'Planning'],
                ['active', 'Active'],
                ['completed', 'Completed'],
                ['archived', 'Archived'],
              ]}
            />
            <Input
              id="project-github-url"
              label="GitHub repository"
              value={fields.githubUrl ?? ''}
              onChange={(event) =>
                setFields((current) => ({ ...current, githubUrl: event.target.value || null }))
              }
              placeholder="https://github.com/org/repo"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>
            <textarea
              id="project-description"
              value={fields.description}
              onChange={(event) =>
                setFields((current) => ({ ...current, description: event.target.value }))
              }
              rows={5}
              placeholder="Add project context..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {project ? 'Save changes' : 'Create project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
