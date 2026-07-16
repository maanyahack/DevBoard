import { GitFork, Star, Circle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface GithubRepoPreview {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: string | null;
}

/** Typed fetch error that carries the HTTP status code for precise UX messaging. */
class FetchError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Extracts owner/repo from a GitHub URL.
 * Accepts: https://github.com/owner/repo or https://github.com/owner/repo/
 */
const GITHUB_URL_RE = /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?(?:[?#].*)?$/i;

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const m = GITHUB_URL_RE.exec(url.trim());
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

async function fetchRepoPreview(githubUrl: string): Promise<GithubRepoPreview> {
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) throw new FetchError(400, 'Invalid GitHub repository URL.');

  let response: Response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      { headers: { Accept: 'application/vnd.github.v3+json' } },
    );
  } catch {
    throw new FetchError(0, 'Network error');
  }

  if (response.status === 404) throw new FetchError(404, 'Repository not found.');
  if (!response.ok) throw new FetchError(response.status, `GitHub API error ${response.status}`);

  const raw = (await response.json()) as {
    full_name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    pushed_at: string | null;
  };

  return {
    fullName: raw.full_name,
    description: raw.description,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    language: raw.language,
    pushedAt: raw.pushed_at,
  };
}

function previewErrorMessage(error: unknown): string {
  if (error instanceof FetchError) {
    if (error.status === 400) return 'Invalid GitHub repository URL.';
    if (error.status === 404) return 'Repository not found.';
  }
  return 'Unable to fetch repository information.';
}

function formatPushedAt(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

/** Language → dot color (best-effort, falls back to slate). */
const languageColors: Record<string, string> = {
  TypeScript: 'text-blue-500',
  JavaScript: 'text-yellow-400',
  Python: 'text-sky-500',
  Rust: 'text-orange-600',
  Go: 'text-cyan-500',
  Java: 'text-red-500',
  'C#': 'text-purple-600',
  'C++': 'text-pink-600',
  Ruby: 'text-red-400',
  Swift: 'text-orange-400',
  Kotlin: 'text-purple-500',
  PHP: 'text-indigo-400',
  Dart: 'text-sky-400',
  Shell: 'text-emerald-500',
  HTML: 'text-orange-500',
  CSS: 'text-blue-400',
};

interface RepositoryPreviewProps {
  githubUrl: string | null;
}

export function RepositoryPreview({ githubUrl }: RepositoryPreviewProps) {
  const repoQuery = useQuery({
    queryKey: ['github-repo', githubUrl],
    enabled: Boolean(githubUrl),
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: () => fetchRepoPreview(githubUrl!),
  });

  if (!githubUrl) return null;

  if (repoQuery.isLoading) {
    return (
      <div className="mt-3 h-[60px] animate-pulse rounded-lg border border-slate-100 bg-slate-100/70 dark:border-slate-700 dark:bg-slate-700/30" />
    );
  }

  if (repoQuery.isError) {
    return (
      <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
        {previewErrorMessage(repoQuery.error)}
      </p>
    );
  }

  if (!repoQuery.data) return null;

  const repo = repoQuery.data;
  const pushedAt = formatPushedAt(repo.pushedAt);
  const langColor = repo.language
    ? (languageColors[repo.language] ?? 'text-slate-400')
    : null;

  return (
    <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-700/60 dark:bg-slate-700/20">
      <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-200">
        {repo.fullName}
      </p>
      {repo.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {repo.description}
        </p>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Star className="h-3 w-3" />
          {repo.stars.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <GitFork className="h-3 w-3" />
          {repo.forks.toLocaleString()}
        </span>
        {repo.language && langColor && (
          <span className="inline-flex items-center gap-1">
            <Circle className={`h-2.5 w-2.5 fill-current ${langColor}`} />
            {repo.language}
          </span>
        )}
        {pushedAt && <span>Updated {pushedAt}</span>}
      </div>
    </div>
  );
}
