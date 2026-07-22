# Run doc — DevBoard (DevNest)

## Reproduce uncommitted environment files

1. Copy `client/.env` from the main checkout if missing:
   ```
   cp /Users/maanya/DEVBOARD/client/.env /Users/maanya/DEVBOARD/client/.env
   ```
   Required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

2. Copy `server/.env` from the main checkout if missing:
   ```
   cp /Users/maanya/DEVBOARD/server/.env /Users/maanya/DEVBOARD/server/.env
   ```
   Required vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`

## How to run the dev server

From the project root (`/Users/maanya/DEVBOARD`):

```bash
pnpm dev
```

This runs both the client (Vite on port 5173) and server (Express on port 4000) in parallel.

### Individual commands

- Client only: `pnpm dev:client`
- Server only: `pnpm dev:server`

### Checks

- Client: http://localhost:5173 (served by Vite)
- Server: http://localhost:4000/api/health (Express API)
