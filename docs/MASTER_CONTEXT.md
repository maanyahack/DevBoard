# MASTER_CONTEXT.md

This document serves as a comprehensive handoff file containing factual developer-level context and architecture details of the DevBoard project.

---

## 1. Project Overview

- **Project Name:** `devboard`
- **Purpose:** A developer productivity platform containing placeholders/planned features for notes, tasks, projects, bookmarks, a knowledge vault, and code snippets.
- **Tech Stack:**
  - **Monorepo Manager:** `pnpm` workspaces.
  - **Frontend (`client/`):** React v19, TypeScript, Vite v6, Tailwind CSS v4, TanStack React Query v5, React Hook Form v7, React Router DOM v7, Supabase JS SDK v2 (client-side anon key wrapper).
  - **Backend (`server/`):** Node.js (>=20), Express v4, TypeScript, `tsx` watch (development runner), Supabase JS SDK v2 (server-side admin wrapper).
- **Package Manager:** `pnpm` (lockfile version `pnpm-lock.yaml`)
- **Current Version:** `0.1.0`

---

## 2. Folder Structure

Below is the complete folder tree excluding `node_modules`, `dist`, and `build` directories:

```
.
├── README.md
├── client
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── src
│   │   ├── App.tsx
│   │   ├── assets
│   │   ├── components
│   │   │   ├── layout
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── ProfileDropdown.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── navConfig.tsx
│   │   │   └── ui
│   │   │       ├── Button.tsx
│   │   │       ├── FullPageSpinner.tsx
│   │   │       └── Input.tsx
│   │   ├── context
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── features
│   │   │   ├── auth
│   │   │   │   ├── components
│   │   │   │   │   └── AuthLayout.tsx
│   │   │   │   └── schemas.ts
│   │   │   ├── landing
│   │   │   │   └── components
│   │   │   │       ├── CTASection.tsx
│   │   │   │       ├── FeatureSection.tsx
│   │   │   │       ├── Footer.tsx
│   │   │   │       ├── Hero.tsx
│   │   │   │       └── LandingNav.tsx
│   │   │   └── profile
│   │   │       └── schema.ts
│   │   ├── hooks
│   │   ├── index.css
│   │   ├── lib
│   │   │   ├── queryClient.ts
│   │   │   └── supabase.ts
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ModulePlaceholder.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── routes
│   │   │   ├── AppRouter.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublicOnlyRoute.tsx
│   │   ├── types
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── server
    ├── eslint.config.js
    ├── package.json
    ├── src
    │   ├── app.ts
    │   ├── config
    │   │   ├── env.ts
    │   │   └── supabase.ts
    │   ├── controllers
    │   │   ├── health.controller.ts
    │   │   └── notes.controller.ts
    │   ├── index.ts
    │   ├── middleware
    │   │   ├── auth.middleware.ts
    │   │   └── error.middleware.ts
    │   ├── routes
    │   │   ├── health.routes.ts
    │   │   ├── index.ts
    │   │   └── notes.routes.ts
    │   ├── services
    │   │   ├── auth.service.ts
    │   │   └── notes.service.ts
    │   └── types
    └── tsconfig.json
```

---

## 3. Frontend

The frontend is a single-page application built on React, Vite, and Tailwind CSS.

### Pages
- **`LandingPage.tsx`:** The public home page that presents the tool sections to guest visitors. Renders `LandingNav`, `Hero`, `FeatureSection`, `CTASection`, and `Footer`.
- **`LoginPage.tsx`:** Center card screen for credentials login. Uses react-hook-form bound to zod schemas for handling authentication fields.
- **`SignupPage.tsx`:** Sign-up form mapping display name, email, and password. Supports awaiting email verification status indicators.
- **`ForgotPasswordPage.tsx`:** Initiates email recovery request workflow.
- **`ResetPasswordPage.tsx`:** Target page containing inputs to modify user passwords via recovery session.
- **`DashboardPage.tsx`:** Layout entry page displaying metrics widgets for core productivity modules.
- **`ProfilePage.tsx`:** Provides visual input fields to modify display name and avatar URL.
- **`SettingsPage.tsx`:** Custom settings to toggle between Light and Dark mode options.
- **`ModulePlaceholder.tsx`:** Reusable landing template that maps routes for pending features (Notes, Tasks, Projects, Bookmarks, Knowledge, Snippets).

### Components
- **Layout:**
  - `DashboardLayout.tsx`: Shell wrapper defining layout rules, sidebar menu toggles, and page viewport outlets.
  - `Navbar.tsx`: Sticky top header layout including page controls, notification icon mockups, search entry, and profile dropdowns.
  - `Sidebar.tsx`: Navigation bar hosting menu configurations with desktop and mobile animations.
  - `ProfileDropdown.tsx`: Dropdown rendering custom metadata settings (initials, avatar) and triggering the logout session.
  - `navConfig.tsx`: Holds standard list of path routes and inline SVG icon definitions for menu layouts.
- **UI:**
  - `Button.tsx`: Customizable button component mapping loader parameters and styles.
  - `Input.tsx`: Custom labeled wrapper forwarding input elements and validating form field errors.
  - `FullPageSpinner.tsx`: Full viewport loader overlay shown during authorization state checks.

### Context
- **`AuthContext.tsx`:** Tracks active session state, propagates metadata changes, and exposes auth hooks (`signIn`, `signUp`, `signOut`, `sendPasswordReset`, `updatePassword`, `updateProfile`) referencing the Supabase client-side helper.
- **`ThemeContext.tsx`:** Handles dark-mode switching, class toggles on HTML documents, and state synchronization across local storage sessions.

### Hooks
- *None (folder is present but empty).*

### Services
- *No local HTTP network services. Auth operations interact directly with Supabase via `@supabase/supabase-js`.*

### Routing
Configured in `client/src/routes/AppRouter.tsx` using `react-router-dom` (v7). Handled by routes:
- **Public Routes:**
  - `/` (Landing Page)
  - `/reset-password` (Unguarded recovery action destination)
- **Public-Only Routes (Redirects authenticated users to `/dashboard`):**
  - `/login`
  - `/signup`
  - `/forgot-password`
- **Protected Routes (Redirects unauthenticated users to `/login`):**
  - `/dashboard`
  - `/notes` (Placeholder)
  - `/tasks` (Placeholder)
  - `/projects` (Placeholder)
  - `/bookmarks` (Placeholder)
  - `/knowledge` (Placeholder)
  - `/snippets` (Placeholder)
  - `/profile`
  - `/settings`

### Features Implemented
- Local storage theme caching with CSS media preferences validation.
- Responsive sidebar navigation toggle control.
- Credentials validation matching form layout schemas.
- Persistent user profile configuration using Supabase user metadata features.

---

## 4. Backend

The backend is built using Node.js, Express, and TypeScript.

### Folder Structure
```
server
├── eslint.config.js
├── package.json
├── src
│   ├── app.ts
│   ├── config
│   │   ├── env.ts
│   │   └── supabase.ts
│   ├── controllers
│   │   ├── health.controller.ts
│   │   └── notes.controller.ts
│   ├── index.ts
│   ├── middleware
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes
│   │   ├── health.routes.ts
│   │   ├── index.ts
│   │   └── notes.routes.ts
│   ├── services
│   │   ├── auth.service.ts
│   │   └── notes.service.ts
│   └── types
└── tsconfig.json
```

### Routes
Mounted under the `/api` namespace:
- `/health` -> `health.routes.ts`
- `/notes` -> `notes.routes.ts`

### Controllers
- **`health.controller.ts`:** Returns JSON payload confirming service availability status and machine timestamp.
- **`notes.controller.ts`:** Processes requests for CRUD actions (`getNotes`, `postNote`, `putNote`, `deleteNoteById`), verifying parameters via Zod parse checks.

### Services
- **`auth.service.ts`:** Validates JWT signature keys against remote Supabase servers and returns validated user identifiers.
- **`notes.service.ts`:** Exposes client methods that perform select, insert, update, and delete queries on the `notes` table using the admin client.

### Middleware
- **`auth.middleware.ts`:** Exposes `requireAuth` logic parsing Bearer tokens and assigning authenticated user records to Request metadata.
- **`error.middleware.ts`:** Centralizes application execution errors, returning formatted errors for Zod validation errors and custom `HttpError` handlers.

### Config
- **`env.ts`:** Confirms the validity of environment configurations at startup.
- **`supabase.ts`:** Initializes the admin-privileged client configuration bypassing Row Level Security.

### Utilities
- *None.*

---

## 5. Database

The database is built on PostgreSQL hosted via Supabase.

### Tables & Columns

#### Table: `notes`
Stores note records created by developers.
- `id`: UUID (Primary Key, uniquely identifies a note)
- `user_id`: UUID (Foreign Key pointing to `auth.users(id)`)
- `title`: VARCHAR/TEXT (Maximum length 200 characters, required)
- `content`: TEXT (Maximum length 20,000 characters, optional)
- `created_at`: TIMESTAMPTZ (Date/time when created)
- `updated_at`: TIMESTAMPTZ (Date/time when last modified)

### Relationships
- `notes.user_id` -> `auth.users(id)` (Many-to-One relationship to the Supabase built-in auth schema).

### Indexes
- No indexes are explicitly defined in the codebase. Standard index structures (Primary Key index on `notes.id` and Foreign Key index on `notes.user_id`) are expected.

### RLS Policies
- No custom RLS policies are represented in the codebase.
- The backend Express application relies on the administrative client SDK (`supabaseAdmin`) using the `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS policies entirely.

---

## 6. Authentication

The authentication architecture is split between client-side Supabase authentication and server-side JWT verification:

```
[Client App]                        [Supabase Auth]                       [Express API]
     │                                     │                                    │
     ├─(1) signInWithPassword ────────────>│                                    │
     │  (Credentials verification)         │                                    │
     │                                     │                                    │
     │<─(2) Returns Session Token (JWT)────┤                                    │
     │  (Stored in LocalStorage)           │                                    │
     │                                     │                                    │
     ├─(3) Request + Header ───────────────┼───────────────────────────────────>│
     │  (Authorization: Bearer <token>)    │                                    │
     │                                     │                                    │
     │                                     │<─(4) getUserFromToken(token)───────┤
     │                                     │  (Validate signature & expiry)     │
     │                                     │                                    │
     │                                     │──(5) Returns User Context ────────>│
     │                                     │                                    │
     │<─(6) Returns HTTP Response ─────────┼────────────────────────────────────┤
```

### Steps of the Flow:
1. **Login & Session Generation:** The user enters credentials on the frontend, which invokes `signInWithPassword` directly against the Supabase API. Supabase returns a session object containing an Access Token (JWT).
2. **Session Storage:** The client SDK stores the session token in the browser's `localStorage` and automatically sets up background timers to refresh tokens prior to expiration.
3. **Protected API Requests:** For requests to the Express server, the client must attach the access token to the HTTP headers: `Authorization: Bearer <token>`.
4. **Server Validation Middleware:**
   - The server routes request through `requireAuth`.
   - The token is parsed from the `Authorization` header.
   - The server calls `supabaseAdmin.auth.getUser(token)` to validate the signature and expiration status.
5. **Request Decoration:** If valid, the validated `User` object is assigned to the request (`req.user`) and the request proceeds to the controller. If invalid, the server rejects the request with `401 Unauthorized`.

---

## 7. API Endpoints

### Health check

- **Method:** `GET`
- **Route:** `/api/health`
- **Request Body:** None
- **Response:**
  - Status `200 OK`
  - Body:
    ```json
    {
      "status": "ok",
      "service": "devboard-server",
      "timestamp": "2026-07-09T03:41:55Z"
    }
    ```
- **Authentication:** None

---

### Fetch Notes

- **Method:** `GET`
- **Route:** `/api/notes`
- **Request Body:** None
- **Response:**
  - Status `200 OK`
  - Body:
    ```json
    {
      "notes": [
        {
          "id": "c6a23730-a889-4b66-85c3-2677581abbf6",
          "title": "Example Note",
          "content": "This is a note body.",
          "createdAt": "2026-07-09T03:41:55Z",
          "updatedAt": "2026-07-09T03:41:55Z"
        }
      ]
    }
    ```
- **Authentication:** Required (Bearer token)

---

### Create Note

- **Method:** `POST`
- **Route:** `/api/notes`
- **Request Body:**
  ```json
  {
    "title": "My Note Title",
    "content": "Content of my note (optional)"
  }
  ```
- **Response:**
  - Status `201 Created`
  - Body:
    ```json
    {
      "note": {
        "id": "c6a23730-a889-4b66-85c3-2677581abbf6",
        "title": "My Note Title",
        "content": "Content of my note (optional)",
        "createdAt": "2026-07-09T03:41:55Z",
        "updatedAt": "2026-07-09T03:41:55Z"
      }
    }
    ```
- **Authentication:** Required (Bearer token)

---

### Update Note

- **Method:** `PUT`
- **Route:** `/api/notes/:id`
- **Request Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content text"
  }
  ```
- **Response:**
  - Status `200 OK`
  - Body:
    ```json
    {
      "note": {
        "id": "c6a23730-a889-4b66-85c3-2677581abbf6",
        "title": "Updated Title",
        "content": "Updated content text",
        "createdAt": "2026-07-09T03:41:55Z",
        "updatedAt": "2026-07-09T03:41:55Z"
      }
    }
    ```
- **Authentication:** Required (Bearer token)

---

### Delete Note

- **Method:** `DELETE`
- **Route:** `/api/notes/:id`
- **Request Body:** None
- **Response:**
  - Status `204 No Content`
  - Body: None
- **Authentication:** Required (Bearer token)

---

## 8. Environment Variables

### Frontend (`client/`)
Exposed to Vite bundle:
- `VITE_SUPABASE_URL`: The API URL of the Supabase project instance (e.g. `https://xxx.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: The public anonymous key used by client requests to connect to Supabase services.
- `VITE_API_URL`: The target URL pointing to the Express server API (e.g. `http://localhost:4000`).

### Backend (`server/`)
Bypasses client visibility:
- `PORT`: Network port for Express listener (defaults to `4000`).
- `CLIENT_URL`: The origin URL of the running client application (used to configure CORS policies).
- `SUPABASE_URL`: The base API URL of the Supabase project instance.
- `SUPABASE_ANON_KEY`: The standard public anon key of the Supabase instance.
- `SUPABASE_SERVICE_ROLE_KEY`: Privileged key allowing database overrides (bypasses RLS). Must NEVER be sent to the browser.

---

## 9. Current Progress

### Completed Features
- Monorepo folder setup, workspaces settings, and task runners using `pnpm`.
- Frontend design layouts: sidebar navigation, header menu controls, and dropdown actions.
- Client authentication interface (Login, Sign-Up, Forgot Password, Reset Password) mapping local session caching via Supabase SDK.
- ThemeContext mapping light and dark states directly persisted inside localStorage.
- Validation patterns inside pages referencing Zod and React Hook Form.
- Express server configuration: setup of route mapping, centralized error handler middleware, and user context verification checks.
- Backend Notes CRUD endpoints (`GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id`).

### Pending Features
- Frontend client network logic (the frontend currently does not perform any HTTP requests to the backend server).
- Implementing UI components for Notes module (presently a `ModulePlaceholder`).
- Implementing UI/Backend components for Tasks, Projects, Bookmarks, Knowledge Vault, and Snippets modules.
- Deploying configuration files for production hosting.

### Current Milestone
- Milestone 1: Establishing the core monorepo foundation, setting up authentication, layout styling, and verifying initial backend API routes.

### Current Task
- Documenting the existing codebase for handoff to another AI assistant.

---

## 10. Development Rules

### Architecture
- Keep UI concerns isolated within the frontend package (`client/`) and resource querying rules within the backend server package (`server/`).
- Use monorepo tools to execute parallel workspace runners (i.e. `pnpm dev`).

### Coding Conventions
- **TypeScript:** Strict type checking across files. Avoid the `any` keyword.
- **Frontend CSS:** Tailwind CSS v4 is configured. Do not write raw style blocks when utility styles are sufficient. Ensure dark modes use the custom variant class (`html.dark`).
- **Form Handling:** Use `react-hook-form` resolved with Zod schema definitions.
- **Backend Error Handling:** Controllers must catch errors inside `try/catch` and direct them to `next(error)` so they execute within the centralized `errorHandler` middleware. Use `HttpError` classes to trigger specific HTTP response codes.
- **Database Safety:** Ensure server-side operations bypass client-side database rules using the admin helper, but implement route middleware checks to verify user ownership boundaries.

---

## 11. Important Files

- **[`package.json`](file:///Users/maanya/DEVBOARD/package.json) (Root):** Monorepo workspace settings configuration.
- **[`AuthContext.tsx`](file:///Users/maanya/DEVBOARD/client/src/context/AuthContext.tsx) (Client):** Implements state management for auth operations and maps local token refresh states.
- **[`ThemeContext.tsx`](file:///Users/maanya/DEVBOARD/client/src/context/ThemeContext.tsx) (Client):** Persists preferences across rendering updates.
- **[`AppRouter.tsx`](file:///Users/maanya/DEVBOARD/client/src/routes/AppRouter.tsx) (Client):** Holds the application's page routes and route protection filters.
- **[`app.ts`](file:///Users/maanya/DEVBOARD/server/src/app.ts) (Server):** Configures application middlewares (CORS, parser) and sets up the central routing and error handlers.
- **[`auth.middleware.ts`](file:///Users/maanya/DEVBOARD/server/src/middleware/auth.middleware.ts) (Server):** Handles JWT parsing and enforces access permissions.
- **[`notes.service.ts`](file:///Users/maanya/DEVBOARD/server/src/services/notes.service.ts) (Server):** Defines raw DB operations matching SQL schemas.

---

## 12. Known Issues

- **Client-Server Disconnect:** No frontend component implements network requests targeting the backend server (VITE_API_URL is only typed, not used).
- **Placeholder Modules:** Every core feature screen (Notes, Tasks, etc.) is a placeholder page.
- **Metadata Identity Lockout:** The profile page saves updates to Supabase metadata attributes (`display_name`, `avatar_url`) directly, but the changes do not propagate to any user backend profile database tables.
- **Local DB Schema:** The database contains no migrations or SQL schemas inside the repository files. Database schema mappings must be inferred from service data definitions.

---

# 13. Project Roadmap

## ✅ Milestone 1 - Foundation & Authentication (Completed)

### Completed
- Project setup (pnpm monorepo)
- React + Vite + TypeScript
- Express + TypeScript backend
- Tailwind CSS setup
- Supabase integration
- Authentication (Login, Signup, Forgot Password, Reset Password)
- Protected routes
- Landing page
- Dashboard layout
- Profile page
- Settings page
- Theme support
- Health API

Status: COMPLETE

---

## 🚧 Milestone 2 - Notes Module (In Progress)

### ✅ Task 2.1
- Notes database schema
- Notes table
- RLS policies
- Trigger
- Indexes

Status: COMPLETE

### ✅ Task 2.2
- Notes backend CRUD API
- Authentication middleware
- Validation
- Controllers
- Services
- Routes

Status: COMPLETE

### ⬜ Task 2.3
Frontend Notes UI

Pending

### ⬜ Task 2.4
Connect frontend to backend

Pending

### ⬜ Task 2.5
Search, Pin, Categories

Pending

### ⬜ Task 2.6
Notes polish and UX improvements

Pending

---

## Milestone 3

Tasks Module

Not Started

---

## Milestone 4

Projects Module

Not Started

---

## Milestone 5

Bookmarks + Code Snippets

Not Started

---

## Milestone 6

Knowledge Vault

Not Started

---

## Milestone 7

Developer Profiles

Not Started

---

## Milestone 8

Dashboard Analytics

Not Started

---

## Milestone 9

Customization & Polish

Not Started

---

## Milestone 10

Deployment
Documentation
README
Demo
Testing

Not Started

---

# 14. Current Project Status

Current Version

v0.2

Current Milestone

Milestone 2

Current Task

Task 2.3
Build the Notes frontend UI.

Next Task

Task 2.4
Connect Notes UI with backend CRUD API.

---

# 15. AI Development Rules

These rules MUST be followed by every AI working on this repository.

## Architecture

- Respect the existing architecture.
- Do not redesign working systems.
- Extend existing code instead of replacing it.
- Prefer modifying existing files over creating new ones.
- Create a new file only when there is no logical place for the code.

---

## Folder Structure

Keep the folder structure simple.

Avoid unnecessary folders.

Avoid enterprise-style abstractions.

Do not create placeholder files.

---

## Code Style

- Use TypeScript.
- Never use any.
- Keep components small.
- Prefer readability over clever code.
- Write reusable code only when it is actually reused.

---

## Backend

Controllers should stay thin.

Business logic belongs inside services.

Validation should use Zod.

Authentication should use the existing middleware.

---

## Frontend

Use existing UI components.

Keep styling with Tailwind.

Do not introduce another CSS framework.

---

## Database

Never change the schema without updating documentation.

Every schema change should include:

- SQL migration
- Documentation update

---

## Token Usage

Keep responses concise.

Only implement the requested task.

Do not generate future features.

Do not rewrite unrelated code.

---

# 16. Prompt Rules

Every future AI prompt should assume:

- The project already compiles.
- Existing code works unless stated otherwise.
- Only modify files required for the current task.
- Never regenerate the entire project.
- Do not refactor unrelated modules.

Every response should finish with:

1. Files changed
2. How to test
3. Git commit message

---

# 17. Design Philosophy

DevBoard should feel like a modern SaaS product.

Design inspiration:

- Notion
- Linear
- GitHub
- Raycast
- Vercel Dashboard

UI principles:

- Minimal
- Clean
- Fast
- Spacious
- Professional

Avoid:

- Flashy animations
- Heavy gradients
- Clutter
- Overly rounded UI
- Generic templates

---

# 18. Git Workflow

Every completed task should follow:

Build

↓

Run

↓

Test

↓

Review

↓

Git Commit

↓

Update MASTER_CONTEXT.md

↓

Move to next task

Commit message format:

feat(scope): description

Examples:

feat(notes): add backend CRUD

feat(notes): build notes UI

feat(tasks): implement task service

fix(auth): resolve session refresh bug

docs: update project context

---

# 19. Known Future Improvements

These are intentionally postponed.

- Rich text editor
- Markdown preview
- Drag & drop notes
- Folders
- Tags
- Note sharing
- AI assistant
- GitHub integration
- Calendar integration
- Offline mode
- Notifications

Do not implement these unless explicitly requested.

---

# 20. Source of Truth

This document is the primary source of truth for the project.

Every AI assistant must:

1. Read this file first.
2. Continue from the current milestone.
3. Preserve the existing architecture.
4. Avoid unnecessary redesigns.
5. Update this document after completing a task.

If the implementation conflicts with this document, the implementation takes precedence, and this file should be updated accordingly.