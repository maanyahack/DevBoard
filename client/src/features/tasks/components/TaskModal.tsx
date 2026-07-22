import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, requireToken } from '@/lib/api';
import type { Project } from '@/features/projects/types';
import type { Task, TaskEditableFields, TaskPriority, TaskStatus } from '@/features/tasks/types';

interface TaskModalProps {
  task?: Task | null;
  isOpen: boolean;
  isSaving?: boolean;
  projects?: Project[];
  onClose: () => void;
  onSave: (fields: TaskEditableFields) => void;
}

const emptyFields: TaskEditableFields = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: null,
  projectId: null,
  sortOrder: 0,
};

interface AiSuggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
}

interface SuggestResponse {
  suggestion: AiSuggestion;
}

export function TaskModal({
  task,
  isOpen,
  isSaving = false,
  projects = [],
  onClose,
  onSave,
}: TaskModalProps) {
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const [fields, setFields] = useState<TaskEditableFields>(emptyFields);
  const [titleError, setTitleError] = useState('');

  // AI panel state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const promptRef = useRef<HTMLTextAreaElement>(null);

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
            projectId: task.projectId,
            sortOrder: task.sortOrder,
          }
        : emptyFields,
    );
    setTitleError('');
    setShowAiPanel(false);
    setAiPrompt('');
    setAiError('');
  }, [isOpen, task]);

  // Focus the prompt textarea when the AI panel opens
  useEffect(() => {
    if (showAiPanel && promptRef.current) {
      promptRef.current.focus();
    }
  }, [showAiPanel]);

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

  async function handleAiGenerate() {
    const trimmed = aiPrompt.trim();
    if (!trimmed) return;

    setIsGenerating(true);
    setAiError('');

    try {
      const selectedProject = fields.projectId
        ? projects.find((p) => p.id === fields.projectId)
        : undefined;

      const body: Record<string, string> = { prompt: trimmed };
      if (selectedProject) {
        body.projectName = selectedProject.name;
        if (selectedProject.description) body.projectDescription = selectedProject.description;
      }

      const { suggestion } = await apiRequest<SuggestResponse>(
        '/api/tasks/suggest',
        requireToken(accessToken),
        { method: 'POST', body: JSON.stringify(body) },
      );

      setFields((current) => ({
        ...current,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        status: suggestion.status ?? current.status,
      }));
      setTitleError('');
      setShowAiPanel(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  // Only show AI button on create (not edit)
  const isCreating = !task;

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {task ? 'Edit task' : 'Create task'}
            </h2>
            {isCreating && (
              <button
                type="button"
                id="ai-fill-toggle"
                onClick={() => { setShowAiPanel((v) => !v); setAiError(''); }}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  showAiPanel
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-violet-500/15 dark:hover:text-violet-300'
                }`}
                title="Fill with AI"
                aria-expanded={showAiPanel}
              >
                <Sparkles className="h-3 w-3" />
                Fill with AI
              </button>
            )}
          </div>
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

        {/* AI Panel */}
        {showAiPanel && (
          <div className="border-b border-violet-100 bg-violet-50/60 px-6 py-4 dark:border-violet-500/20 dark:bg-violet-500/10">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                AI Task Assistant
              </span>
            </div>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Describe what you need to do and AI will fill in the task details for you.
            </p>
            <textarea
              ref={promptRef}
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  void handleAiGenerate();
                }
              }}
              rows={3}
              placeholder="e.g. Set up CI pipeline for automated testing with GitHub Actions..."
              className="w-full resize-none rounded-lg border border-violet-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-violet-300 dark:border-violet-500/30 dark:bg-slate-700/50 dark:text-slate-100"
              disabled={isGenerating}
            />
            {aiError && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{aiError}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <button
                id="ai-generate-btn"
                type="button"
                onClick={() => void handleAiGenerate()}
                disabled={isGenerating || !aiPrompt.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Generate
                  </>
                )}
              </button>
              <span className="text-xs text-slate-400">or ⌘↵</span>
              <button
                type="button"
                onClick={() => setShowAiPanel(false)}
                className="ml-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Form */}
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
            autoFocus={!showAiPanel}
          />

          <div className="grid gap-5 sm:grid-cols-4">
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
            <SelectField
              id="task-project"
              label="Project"
              value={fields.projectId ?? ''}
              onChange={(value) =>
                setFields((current) => ({ ...current, projectId: value || null }))
              }
              options={[
                ['', 'No project'],
                ...projects.map((project) => [project.id, project.name] as [string, string]),
              ]}
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
