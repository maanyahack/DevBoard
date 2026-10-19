import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Task } from '@/features/tasks/types';
import { taskPriorityLabels, taskStatusLabels } from '@/features/tasks/types';
import { dueDateKey, formatCalendarKey } from '@/features/tasks/utils';

interface TaskCalendarProps {
  tasks: Task[];
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthStart(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function buildMonthDays(month: Date): Date[] {
  const start = monthStart(month);
  const firstGridDay = new Date(start);
  firstGridDay.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDay);
    date.setDate(firstGridDay.getDate() + index);
    return date;
  });
}

function formatMonth(value: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(value);
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const todayKey = formatCalendarKey(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()));
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const tasksByDay = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const key = dueDateKey(task.dueDate);
      if (!key) return;
      grouped.set(key, [...(grouped.get(key) ?? []), task]);
    });
    return grouped;
  }, [tasks]);

  const days = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const selectedTasks = tasksByDay.get(selectedDate) ?? [];

  function moveMonth(delta: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function showToday() {
    const today = new Date();
    setVisibleMonth(monthStart(today));
    setSelectedDate(formatCalendarKey(today));
  }

  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="floating-card rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-black/10 dark:hover:shadow-black/25">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {formatMonth(visibleMonth)}
          </h2>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => moveMonth(-1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={showToday}>
              Today
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => moveMonth(1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:border-slate-700/60 dark:text-slate-500">
          {weekdayLabels.map((label) => (
            <div key={label} className="px-2 py-3">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = formatCalendarKey(day);
            const dayTasks = tasksByDay.get(key) ?? [];
            const inMonth = day.getMonth() === visibleMonth.getMonth();
            const selected = selectedDate === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(key)}
                className={`pressable min-h-24 cursor-pointer border-b border-r border-slate-100 p-2 text-left last:border-r-0 dark:border-slate-700/60 ${
                  selected
                    ? 'bg-emerald-50/70 dark:bg-emerald-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                } ${inMonth ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'}`}
              >
                <span className={`text-xs font-semibold ${key === todayKey ? 'text-emerald-600 dark:text-emerald-300' : ''}`}>
                  {day.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <p key={task.id} className="truncate rounded bg-slate-100 px-1.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {task.title}
                      </p>
                    ))}
                    {dayTasks.length > 2 && (
                      <p className="text-[11px] font-medium text-slate-400">+{dayTasks.length - 2} more</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="floating-card rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-black/10 dark:hover:shadow-black/25">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Due {selectedDate}
        </p>
        {selectedTasks.length > 0 ? (
          <div className="stagger-list mt-4 space-y-3">
            {selectedTasks.map((task) => (
              <div key={task.id} className="stagger-item rounded-lg border border-slate-100 p-3 dark:border-slate-700/70">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <CircleDot className="h-3 w-3" />
                    {taskPriorityLabels[task.priority]}
                  </span>
                  <span>{taskStatusLabels[task.status]}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">No tasks due this day.</p>
        )}
      </aside>
    </div>
  );
}
