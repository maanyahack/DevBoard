import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Task } from '@/features/tasks/types';

interface DeleteConfirmationModalProps {
  task: Task | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  task,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-4">
          <span className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-500/10 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Delete task
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This will remove “{task.title}” from your task list.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            isLoading={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
