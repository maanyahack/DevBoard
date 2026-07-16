import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Task, TaskEditableFields, TaskPriority, TaskStatus } from '@/features/tasks/types';

interface TaskModalProps {
  task?: Task | null; isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (fields: TaskEditableFields) => void;
}

const emptyFields: TaskEditableFields = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: null,
  sortOrder: 0,
};

export function TaskModal({ task, isOpen, isSaving = false, onClose, onSave }: TaskModalProps) {
  const [fields, setFields] = useState<TaskEditableFields>(emptyFields);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setFields(
      task
        ? {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            sortOrder: task.sortOrder,
          }
        : emptyFields,
    );
    setTitleError('');
  }, [isOpen, task]);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedFields = {
      ...fields,
      title: fields.title.trim(),
      description: fields.description.trim(),
    };

    if (!normalizedFields.title) {
      setTitleError('Title is required.');
      return;
    }

    onSave(normalizedFields);
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {task ? 'Edit task' : 'Create task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label="Close task editor"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <Input
            id="task-title"
            label="Title"
            value={fields.title}
            onChange={(event) => {
              setFields((current) => ({ ...current, title: event.target.value }));
              setTitleError('');
            }}
            placeholder="Plan the next sprint"
            error={titleError}
            autoFocus
          />

          <div className="grid gap-5 sm:grid-cols-3">
            <SelectField
              id="task-status"
              label="Status"
              value={fields.status}
              onChange={(value) =>
                setFields((current) => ({ ...current, status: value as TaskStatus }))
              }
              options={[
                ['todo', 'Todo'],
                ['in_progress', 'In Progress'],
                ['done', 'Done'],
              ]}
            />
            <SelectField
              id="task-priority"
              label="Priority"
              value={fields.priority}
              onChange={(value) =>
                setFields((current) => ({ ...current, priority: value as TaskPriority }))
              }
              options={[
                ['low', 'Low'],
                ['medium', 'Medium'],
                ['high', 'High'],
              ]}
            />
            <Input
              id="task-due-date"
              label="Due date"
              type="date"
              value={fields.dueDate ?? ''}
              onChange={(event) =>
                setFields((current) => ({ ...current, dueDate: event.target.value || null }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>
            <textarea
              id="task-description"
              value={fields.description}
              onChange={(event) =>
                setFields((current) => ({ ...current, description: event.target.value }))
              }
              rows={5}
              placeholder="Add useful context..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {task ? 'Save changes' : 'Create task'}
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
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
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
