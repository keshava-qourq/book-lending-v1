# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `45e392a` · model `auto`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
Book lending - v1 is a two-app repository for a book-lending product (users, books, loans). The frontend is a Vite + React 19 SPA (React Router, Tailwind 4, TypeScript) whose screens run on seeded sample data and are not yet wired to the API. The backend is a FastAPI service (SQLAlchemy 2, Pydantic 2) that currently exposes only a GET /health route. It has no models or routers yet. It defaults to a local SQLite database and can be pointed at PostgreSQL through DATABASE_URL. A docker-compose file provides a Postgres 16 service.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js and npm (React 19, Vite 6 and Vitest 2 are used; the exact version is not pinned in the files)
- Python 3.12 (the backend Dockerfile uses python:3.12-slim) and pip
- Docker with Compose (optional, only for the PostgreSQL service in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. cd frontend && npm install
2. cd backend && pip install -r requirements.txt
3. (Optional, PostgreSQL instead of the default SQLite) docker compose up -d db, then set DATABASE_URL to point at it, e.g. postgresql+psycopg://app:app@localhost:5432/app (credentials from docker-compose.yml; the psycopg driver is in requirements.txt)
4. (Optional, for Playwright e2e) the e2e config starts the API with backend/.venv/bin/python, so install the backend requirements into a virtualenv at backend/.venv first
5. (Optional, for Playwright e2e) cd frontend && npm run test:e2e:install
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| frontend dev | `cd frontend && npm run dev` | Starts the Vite dev server for the SPA. The backend CORS config allows http://localhost:5173 and http://127.0.0.1:5173 by default. |
| frontend build | `cd frontend && npm run build` | Bundles the app with Vite. It does not typecheck. |
| frontend preview | `cd frontend && npm run preview` | Serves the production build locally. |
| frontend typecheck | `cd frontend && npm run typecheck` | Runs tsc --noEmit. |
| frontend lint | `cd frontend && npm run lint` | Runs ESLint over the frontend (npm run lint:fix applies automatic fixes). |
| frontend format | `cd frontend && npm run format` | Formats the frontend with Prettier (npm run format:check only checks). |
| backend dev | `cd backend && uvicorn app.main:app --reload` | Runs the FastAPI service with auto-reload. It serves on port 8000 by default, with /health and the OpenAPI docs. |
| backend lint | `cd backend && ruff check .` | Lints the backend with Ruff. |
| backend format | `cd backend && ruff format .` | Formats the backend with Ruff. |
| database | `docker compose up -d db` | Starts the Postgres 16 container (user, password and database are all 'app', port 5432). |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `.devcontainer/` | Dev container configuration. |
| `.quorq/` | Platform handoff metadata (handoff.json). |
| `backend/` | FastAPI service: Dockerfile, requirements.txt, pytest.ini and ruff.toml. |
| `backend/app/` | Application code: main.py (app, CORS, lifespan, /health), database.py (engine, session, Base, get_db), models.py (empty), schemas.py (StubResponse). |
| `backend/app/routers/` | Reserved for generated routers, one per component that owns endpoints. Currently empty apart from __init__.py. |
| `backend/tests/` | pytest suite with shared fixtures in conftest.py. |
| `backend/tests/integration/` | Integration tests (currently test_health.py). |
| `backend/tests/unit/` | Unit tests (currently only a package marker). |
| `frontend/` | Vite + React SPA with its package.json, Vite, TypeScript, ESLint, Prettier and Playwright config. |
| `frontend/e2e/` | Playwright acceptance specs (example.spec.ts). |
| `frontend/e2e/support/` | Helpers for the e2e specs (admin.ts). |
| `frontend/src/` | SPA source: main.tsx entry, index.css, test-setup.ts. |
| `frontend/src/lib/` | Shared modules: api.ts (API client), ui.tsx and icons.tsx (component and icon vocabulary), navigate.ts. |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend: one router per architecture component under app/routers, with one route per endpoint in the API spec. Unimplemented routes return the typed StubResponse placeholder (status 'not_implemented') instead of raising.
- Backend: every SQLAlchemy model inherits Base from app/database.py. main.py imports app.models so tables register before Base.metadata.create_all runs in the lifespan startup hook (no migrations; the code says to replace this with Alembic).
- Backend: handlers get a request-scoped SQLAlchemy session through the get_db dependency.
- Backend configuration comes from environment variables: DATABASE_URL (default sqlite:///./app.db) and ALLOWED_ORIGINS (comma-separated; defaults to the Vite dev origins).
- Frontend: the '@' import alias maps to frontend/src (see vite.config.ts and tsconfig.json).
- Frontend: component tests live beside the components under src/ as *.test.ts(x) or *.spec.ts(x). Playwright specs live in e2e/ and are excluded from Vitest.
- Frontend: API calls go through apiFetch in src/lib/api.ts. It reads VITE_API_BASE_URL (default http://localhost:8000) and VITE_API_SECRET_KEY, and sends the stored session token (localStorage key 'session_token') as the Bearer token ahead of the shared secret.
- Frontend: TypeScript runs with strict on but noImplicitAny and strictNullChecks off. The README says screens still use seeded sample data and are meant to be wired to endpoints one at a time.
- Tooling: ESLint and Prettier for the frontend, Ruff for the backend.
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| frontend unit | `cd frontend && npm test` | Runs Vitest (vitest run --passWithNoTests) over src/**/*.{test,spec}.{ts,tsx} in jsdom. |
| frontend e2e | `cd frontend && npm run test:e2e` | Runs Playwright specs from e2e/. Without E2E_BASE_URL it starts the backend (backend/.venv) and builds and previews the frontend on port 4173; with E2E_BASE_URL set it runs against that deployed URL. |
| frontend e2e browser install | `cd frontend && npm run test:e2e:install` | Downloads the Chromium browser Playwright needs. |
| backend tests | `cd backend && pytest` | Runs the pytest suite in backend/tests (pytest.ini sets pythonpath to the backend directory). |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| pytest fails with 'No module named app'. | Run pytest from the backend/ directory. pytest.ini sets pythonpath = . relative to that folder. |
| The browser blocks API calls from the SPA with a CORS error. | Serve the frontend from http://localhost:5173 or http://127.0.0.1:5173 (the defaults), or set ALLOWED_ORIGINS to a comma-separated list of the frontend origin(s) before starting the backend. |
| The backend fails at startup with a database connection error. | Tables are created on startup, so DATABASE_URL must be reachable. Unset it to use the default local SQLite file, or start Postgres with 'docker compose up -d db' and set DATABASE_URL accordingly. |
| npm run build succeeds but npm run typecheck reports errors. | This is expected: the build does not typecheck. Run npm run typecheck and fix the reported types (the README mentions untyped useState({}) as a common cause). |
| Playwright e2e cannot start the backend (backend/.venv/bin/python not found). | The e2e config launches uvicorn from backend/.venv. Create a virtualenv at backend/.venv with the backend requirements installed, or set E2E_BASE_URL to run against an already deployed app. |
| Playwright reports that the browser executable is missing. | Run npm run test:e2e:install in frontend/. |
| Frontend screens show data that does not match the backend. | The screens currently render seeded sample data and the backend only implements /health. Wiring a screen to an endpoint through apiFetch in src/lib/api.ts is still to be done. |
<!-- sdlc:auto:end troubleshooting -->
