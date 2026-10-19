# DevBoard

**An AI-powered developer productivity workspace** — manage your notes, tasks, projects, bookmarks, knowledge vault, and code snippets in one place.

> **v0.8.0** · Milestone 2 in progress (Notes module) · pnpm monorepo

---

## Features

| Module | Status |
|---|---|
| 🔐 Authentication (login, signup, forgot/reset password) | ✅ Complete |
| 📊 Dashboard (stats, recent items, quick actions, AI insights) | ✅ Complete |
| 📝 Notes (CRUD, search, pin, categories, AI summarization) | ✅ Complete |
| ✅ Tasks (CRUD, priority, status, due dates) | ✅ Complete |
| 📁 Projects (CRUD, GitHub link, tech stack tags, AI task gen) | ✅ Complete |
| 🤖 AI Assistant (Gemini — note summaries, task gen, insights) | ✅ Complete |
| 🔗 GitHub Integration (repo linking & metadata preview) | ✅ Complete |
| 🔖 Bookmarks | ⬜ Planned |
| 🧠 Knowledge Vault | ⬜ Planned |
| `</>` Code Snippets | ⬜ Planned |

---

## Tech Stack

### Frontend (`client/`)
- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** — utility-first styling
- **TanStack React Query v5** — server state & caching
- **React Hook Form v7** + **Zod** — form handling & validation
- **React Router DOM v7** — client-side routing
- **Supabase JS SDK v2** — auth & client-side queries

### Backend (`server/`)
- **Node.js ≥ 20** + **Express v4** + **TypeScript**
- **Supabase JS SDK v2** (service role — bypasses RLS)
- **Zod** — request validation
- **tsx** — dev runner with watch mode

### Infrastructure
- **Supabase** — PostgreSQL database + Auth
- **Gemini API** — AI features
- **pnpm workspaces** — monorepo management

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm (`corepack enable pnpm` or `npm i -g pnpm`)

### Install

```bash
git clone <repo-url>
cd devboard
pnpm install
```

### Environment Variables

**`client/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:4000
```

**`server/.env`**
```env
PORT=4000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### Run

```bash
pnpm dev              # runs client + server in parallel
pnpm dev:client       # client only (Vite → localhost:5173)
pnpm dev:server       # server only (Express → localhost:4000)
```

**Verify:**
- App → [http://localhost:5173](http://localhost:5173)
- API health → [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## Project Structure

```
devboard/
├── client/              # React + Vite frontend
│   └── src/
│       ├── components/  # Shared layout & UI components
│       ├── context/     # AuthContext, ThemeContext
│       ├── features/    # Auth, landing, profile features
│       ├── pages/       # Route-level page components
│       └── routes/      # AppRouter, route guards
├── server/              # Express backend
│   └── src/
│       ├── config/      # Env validation, Supabase admin client
│       ├── controllers/ # Request handlers
│       ├── middleware/   # Auth (JWT) + error handling
│       ├── routes/      # API route definitions
│       └── services/    # DB operations (notes, auth)
├── docs/                # Project documentation & context
└── supabase/            # Supabase config
```

---

## API Reference

All routes are prefixed with `/api`.

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Service health check |
| `GET` | `/api/notes` | ✅ Bearer | List all user notes |
| `POST` | `/api/notes` | ✅ Bearer | Create a note |
| `PUT` | `/api/notes/:id` | ✅ Bearer | Update a note |
| `DELETE` | `/api/notes/:id` | ✅ Bearer | Delete a note |

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start client + server concurrently |
| `pnpm build` | Build both packages for production |
| `pnpm lint` | Lint all workspaces |
| `pnpm format` | Format all files with Prettier |

---

## Design Inspiration

DevBoard is designed to feel like a modern SaaS product, inspired by **Notion**, **Linear**, **GitHub**, **Raycast**, and the **Vercel Dashboard**. The UI aims to be minimal, clean, fast, and professional.

---

## Roadmap

- [x] Milestone 1 — Foundation & Authentication
- [x] Milestone 2 — Notes Module *(search, pin, categories in progress)*
- [x] Milestone 3 — Tasks Module
- [x] Milestone 4 — Projects Module
- [x] Milestone 5 — Dashboard & AI
- [ ] Milestone 6 — Bookmarks & Code Snippets
- [ ] Milestone 7 — Knowledge Vault
- [ ] Milestone 8 — Developer Profiles
- [ ] Milestone 9 — Analytics
- [ ] Milestone 10 — Deployment & Docs

---

## License

Private project — not open source.
