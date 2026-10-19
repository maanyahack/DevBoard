# DevBoard - PROJECT_CONTEXT.md

> Single Source of Truth for every AI working on this repository.

---

# 1. Project Overview

**Project Name:** DevBoard

DevBoard is an AI-powered Developer Productivity Platform built for software developers.

The application helps users manage:

- Projects
- Tasks
- Notes
- Dashboard
- AI Productivity Features

The goal is to become a lightweight combination of:

- Notion
- Linear
- GitHub Projects
- Raycast

---

# 2. Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- React Hook Form
- Zod
- Lucide React
- Supabase JS SDK

## Backend

- Express
- TypeScript
- Supabase Admin SDK
- Zod
- Gemini API

## Database

- Supabase PostgreSQL

## Authentication

- Supabase Auth

## Package Manager

- pnpm Monorepo

---

# 3. Current Modules

## Authentication ✅

Completed

Features

- Login
- Signup
- Forgot Password
- Reset Password
- Protected Routes
- User Profile
- Theme Support

---

## Notes ✅

Completed

Features

- CRUD
- Search
- Categories
- Pin Notes
- AI Note Summarization
- Copy AI Summary

---

## Tasks ✅

Completed

Features

- CRUD
- Priority
- Status
- Due Date
- Bulk Import
- Dashboard Integration

---

## Projects ✅

Completed

Features

- CRUD
- Project Status
- GitHub Repository Link
- Repository Preview
- Tech Stack Tags
- Resource Links
- AI Task Generation
- AI Task Preview
- Bulk Import to Tasks

---

## Dashboard ✅

Completed

Features

- Statistics
- Recent Notes
- Recent Tasks
- Active Projects
- Quick Actions
- AI Dashboard Insights

---

# 4. AI Features

Completed

✅ Gemini Backend Integration

---

✅ AI Project Task Generation

Workflow

Project

↓

Generate Tasks with AI

↓

Preview Generated Tasks

↓

Bulk Import into Tasks

---

✅ AI Note Summarization

Workflow

Note

↓

Summarize with AI

↓

Summary Modal

↓

Copy Summary

---

✅ AI Dashboard Insights

Workflow

Dashboard

↓

Generate AI Insights

↓

Productivity Summary

↓

Recommendations

---

# 5. Database Tables

Existing Tables

- notes
- tasks
- projects

Every table includes

- UUID primary key
- user_id
- created_at
- updated_at
- Row Level Security
- CRUD policies
- Indexes

Projects additionally include

- tech_stack
- resource_links

---

# 6. Backend Architecture

Architecture

Routes

↓

Controllers

↓

Services

↓

Supabase

Rules

- Controllers stay thin.
- Business logic belongs in services.
- Validation always uses Zod.
- Authentication uses requireAuth middleware.
- Never access Supabase directly from controllers.

## AI

Reuse:

`server/src/services/ai.service.ts`

Never create another AI service.

---

# 7. Frontend Architecture

Pages

Responsible only for UI coordination.

Business logic

Move into feature hooks whenever pages become large.

Components

Reusable.

Keep styling consistent.

State

React Query

Mutations

Always invalidate affected queries.

Examples

Creating Tasks

↓

Invalidate

- tasks
- dashboard

Creating Notes

↓

Invalidate

- notes
- dashboard

Creating Projects

↓

Invalidate

- projects
- dashboard

Bulk Import

↓

Invalidate

- tasks
- dashboard

---

# 8. Coding Rules

Always

- Use TypeScript.
- Use existing architecture.
- Reuse existing components.
- Keep code readable.
- Prefer modifying existing files.
- Keep pages reasonably small.
- Prefer hooks/services over large page components.

Never

- Use `any`.
- Rewrite working code.
- Create duplicate services.
- Introduce unnecessary abstractions.
- Break existing workflows.

---

# 9. AI Development Rules

Before writing code

Always

1. Read this file completely.
2. List files to modify.
3. Explain why each file is needed.
4. Wait for approval.

After implementation

Always provide

1. Files changed
2. Testing steps
3. Git commit message

Never

- Redesign the project.
- Regenerate unrelated files.
- Create duplicate functionality.
- Modify architecture without approval.

---

# 10. Git Workflow

Every completed feature

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

Update PROJECT_CONTEXT.md (only after major milestones)

Commit style

`feat(scope): description`

Examples

```
feat(notes): add AI note summarization

feat(ai): generate project tasks

feat(projects): add repository preview

fix(tasks): resolve bulk import bug

docs: update project context
```

---

# 11. Current Progress

Foundation

✅ Complete

Authentication

✅ Complete

Notes

✅ Complete

Tasks

✅ Complete

Projects

✅ Complete

Dashboard

✅ Complete

Gemini Backend

✅ Complete

AI Project Task Generation

✅ Complete

AI Note Summarization

✅ Complete

AI Dashboard Insights

✅ Complete

GitHub Integration

✅ Complete

UI / UX Polish

🚧 In Progress

---

# 12. Current Milestone

## Milestone 8

### UI / UX Polish

Completed

- Authentication
- Notes
- Tasks
- Projects
- Dashboard
- AI Assistant
- GitHub Integration

Current Focus

Improve the existing UI to feel like a modern SaaS product.

This phase is visual only.

No backend changes.

No database changes.

No new features.

Only improve

- Visual hierarchy
- Spacing
- Typography
- Hover states
- Focus states
- Shadows
- Consistency
- Responsiveness
- User experience

---

# 13. Remaining Roadmap

## Phase 1

UI / UX Polish

- Dashboard polish
- Notes polish
- Tasks polish
- Projects polish
- Better navigation
- Better buttons
- Better inputs
- Better cards
- Better badges
- Better loading states
- Better empty states
- Better responsive layouts

---

## Phase 2

Production Ready

- Performance improvements
- Accessibility improvements
- Final testing
- README
- Screenshots
- Demo video
- Deployment

---

# 14. Design Philosophy

DevBoard should feel like a modern SaaS application.

Design inspiration

- Notion
- Linear
- GitHub
- Raycast
- Vercel Dashboard

UI Principles

- Minimal
- Clean
- Fast
- Spacious
- Professional
- Consistent
- Accessible

Avoid

- Heavy gradients
- Clutter
- Generic templates
- Unnecessary animations
- Feature bloat

The application should evolve through polish, not redesign.

Every improvement should preserve existing workflows while making the interface feel more premium and cohesive.

---

# 15. Polish Rules

UI polish must **not**

- Change navigation
- Add new features
- Modify backend APIs
- Modify database schema
- Redesign application workflows

UI polish **may**

- Improve spacing
- Improve typography
- Improve visual hierarchy
- Improve shadows
- Improve hover and focus states
- Improve responsiveness
- Improve loading states
- Improve empty states
- Improve consistency across modules

---

# 16. Source of Truth

This document is the primary reference for every AI assistant.

Before every task

1. Read this document completely.
2. Treat it as the single source of truth.
3. Continue from the current milestone.
4. Preserve the existing architecture.
5. Do not redesign working systems.
6. Reuse existing patterns whenever possible.
7. Update this document only after completing a major milestone or architectural change.

If implementation and documentation differ, update this document so it matches the implementation.