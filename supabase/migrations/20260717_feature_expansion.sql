-- Feature Expansion: task project links, global search sources, activity timeline, and notes metadata.

alter table if exists public.tasks
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table if exists public.notes
  add column if not exists category text not null default 'General',
  add column if not exists is_pinned boolean not null default false;

create index if not exists tasks_user_project_idx
  on public.tasks (user_id, project_id);

create index if not exists tasks_user_due_date_idx
  on public.tasks (user_id, due_date);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (
    type in (
      'project_created',
      'task_created',
      'task_completed',
      'note_created',
      'bookmark_added',
      'knowledge_entry_created',
      'ai_summary_generated',
      'ai_tasks_generated'
    )
  ),
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activities_user_created_at_idx
  on public.activities (user_id, created_at desc);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookmarks_user_updated_at_idx
  on public.bookmarks (user_id, updated_at desc);

create table if not exists public.knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_entries_user_updated_at_idx
  on public.knowledge_entries (user_id, updated_at desc);
