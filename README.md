# DevBoard

A developer productivity platform (notes, tasks, projects, bookmarks, knowledge vault, snippets).

Monorepo managed with **pnpm workspaces**.

## Packages
- `client/` — React + TypeScript + Vite + Tailwind frontend
- `server/` — Node + Express + TypeScript backend

## Getting started
```bash
corepack enable pnpm       # activate pnpm (ships with Node)
pnpm install               # install all workspaces
pnpm dev                   # run client + server together
```

See each package's `.env.example` for required environment variables.
