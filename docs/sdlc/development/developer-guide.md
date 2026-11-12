# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `17142b5` · model `auto`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
Book lending - v1 is a two-app monorepo for a book lending service. The frontend is a Vite + React 19 single-page app (TypeScript, Tailwind 4, react-router) with sign-in, sign-up, dashboard, books list and book form screens. The backend is a FastAPI service using SQLAlchemy 2, Alembic migrations and PostgreSQL 16, with three tables: users, books and loans. The API covers email/password sign-up and sign-in with opaque bearer session tokens, book CRUD and search, borrowing with a 14-day due date, returning, and a current/overdue loans endpoint. Migrations and optional user seeding run automatically at backend startup. The SPA calls the API through `frontend/src/lib/api.ts`. Deployment is via a GitHub Actions workflow to AWS (backend image to ECR, frontend to Amplify). The READMEs are partly stale: the root README says the backend has only a health check, but the code has auth, books and loans routers.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js and npm (version not pinned in the manifests; the stack is React 19, Vite 6, Vitest 2, Playwright 1.48)
- Python 3.12 (matches backend/Dockerfile)
- PostgreSQL 16, or Docker with Docker Compose to run the bundled db service
- Chromium for Playwright e2e tests (installed via npm run test:e2e:install)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. cp .env.example .env   # then review ENVIRONMENT.md for the variables the project expects
2. docker compose up -d db   # PostgreSQL 16 on localhost:5432, user/password/db all 'app'
3. cd backend
4. python -m venv .venv && source .venv/bin/activate   # the Playwright config expects backend/.venv
5. pip install -r requirements.txt
6. export DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/app   # required; the backend is PostgreSQL-only
7. uvicorn app.main:app --reload   # migrations are applied on startup; API at http://localhost:8000
8. In a second terminal: cd frontend && npm install && npm run dev   # SPA at http://localhost:5173, calls http://localhost:8000 by default
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| db | `docker compose up -d db` | Starts the local PostgreSQL 16 container defined in docker-compose.yml. |
| backend dev | `cd backend && uvicorn app.main:app --reload` | Runs the FastAPI app with auto-reload. Applies Alembic migrations and seeds users (if configured) on startup. Health check: GET /health. |
| frontend dev | `cd frontend && npm run dev` | Starts the Vite dev server. |
| frontend build | `cd frontend && npm run build` | Bundles the SPA with vite build. This does not typecheck. |
| frontend preview | `cd frontend && npm run preview` | Serves the production build locally. |
| typecheck | `cd frontend && npm run typecheck` | Runs tsc --noEmit. |
| format | `cd frontend && npm run format` | Runs Prettier over the frontend. Use npm run format:check to only check. |
| backend docker image | `docker build -t book-lending-api ./backend` | Builds the backend image (python:3.12-slim, non-root user, uvicorn on port 8000, /health healthcheck). |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `.devcontainer/` | Dev container configuration. |
| `.github/workflows/` | deploy.yml: on push to main, builds and pushes the API image to ECR and deploys the frontend to AWS Amplify. |
| `.quorq/` | Quorq platform metadata (handoff.json, prepared.json). |
| `backend/` | FastAPI service: Dockerfile, alembic.ini, requirements.txt, pytest.ini, ruff.toml. |
| `backend/app/` | Application code: main.py (app, CORS, error shape, lifespan), config.py, database.py, models.py (User, Book, Loan), auth.py, security.py, migrate.py, seed.py, schemas.py. |
| `backend/app/routers/` | API routers: auth.py (/auth/signup, /auth/signin, /auth/signout) and books.py (books CRUD/search, borrow, /loans/me, return). |
| `backend/migrations/` | Alembic environment (env.py, script.py.mako). |
| `backend/migrations/versions/` | Schema migrations: 0001_initial_schema, 0002_loan_indexes. |
| `backend/scripts/` | Helper scripts, e.g. check_connections.py. |
| `backend/tests/` | pytest suite with shared conftest.py. |
| `backend/tests/unit/` | Unit tests for auth, books, data model, seed and related features. |
| `backend/tests/integration/` | Integration tests: health, signup, auth session, add/edit/delete book, data model schema. |
| `frontend/` | Vite + React + TypeScript SPA (package.json, vite.config.ts, tsconfig.json, eslint and prettier config). |
| `frontend/e2e/` | Playwright acceptance specs (auth, books) and support helpers (admin, db). |
| `frontend/src/` | App.tsx (shell and route table), main.tsx, index.css, and colocated Vitest tests. |
| `frontend/src/lib/` | api.ts (API client and session token handling), brand.ts, icons.tsx, navigate.ts, ui.tsx. |
| `frontend/src/screens/` | One module per screen: SignIn, SignUp, Dashboard, Books, BookForm. |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend errors share one JSON shape: {"detail": string, "errors": [{"field", "message"}]}. Validation failures return 422.
- Routers are grouped per feature under backend/app/routers/. The books router requires sign-in via a router-level get_current_user dependency.
- The schema changes only through Alembic migrations in backend/migrations/versions/, and models.py must be kept in step with them.
- Emails are stored lowercased, enforced by a DB check constraint. Session tokens are stored only as sha256 hashes.
- Overdue status is derived at read time (is_overdue) and not stored.
- Book writes use SELECT ... FOR UPDATE, locking the book first and then the loan, to keep copy counts consistent.
- Importing the backend never opens a database connection. Migrations and seeding run in the FastAPI lifespan.
- Backend style is enforced with ruff (ruff.toml); frontend style with ESLint and Prettier.
- The frontend uses the '@' alias for src/, one module per screen, and brand tokens as CSS variables (--brand-*).
- All frontend API calls go through apiFetch. It sends the bearer token from localStorage, and on a 401 (outside sign-in/sign-up) clears the token and redirects to /sign-in.
- Frontend tests sit beside the code in src/ (*.test.tsx). Playwright specs live in e2e/.
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend tests | `cd backend && pytest` | Runs the unit and integration tests under backend/tests. The tests assume PostgreSQL, so DATABASE_URL must point at a database. |
| backend lint | `cd backend && ruff check .` | Lints the backend. Use `ruff format .` to format. |
| frontend unit tests | `cd frontend && npm test` | Runs Vitest component tests under src/ (jsdom). |
| frontend lint | `cd frontend && npm run lint` | Runs ESLint over the frontend. `npm run lint:fix` applies auto-fixes. |
| e2e browser install | `cd frontend && npm run test:e2e:install` | Installs the Chromium browser Playwright needs. |
| e2e | `cd frontend && npm run test:e2e` | Runs the Playwright specs in e2e/. Without E2E_BASE_URL it boots the backend from ../backend/.venv on port 8000 and a built preview on port 4173. With E2E_BASE_URL set it targets that deployed URL. |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| The backend fails on startup or on the first request with a database connection error. | DATABASE_URL is unset or wrong. Without it the engine is a placeholder (postgresql+psycopg://). Start the db service with `docker compose up -d db` and export DATABASE_URL, e.g. postgresql+psycopg://app:app@localhost:5432/app. See ENVIRONMENT.md. |
| The browser blocks API calls with a CORS error. | By default the API allows only http://localhost:5173 and http://127.0.0.1:5173. Run the frontend on one of those origins, or set ALLOWED_ORIGINS (comma-separated) before starting the backend. |
| The frontend calls the wrong API host. | The API URL comes from VITE_API_BASE_URL at build or dev time, defaulting to http://localhost:8000. Set it and restart Vite or rebuild. |
| Authenticated screens keep redirecting to /sign-in. | Routes other than sign-in and sign-up require a session token in localStorage. Any 401 from the API clears the token and redirects. Sign in again, and check that the session has not expired. |
| `npm run build` succeeds but typechecking fails. | vite build does not typecheck. Run `npm run typecheck` and fix the errors it reports. |
| `npm run test:e2e` cannot start the backend, or Playwright cannot launch a browser. | The Playwright config runs `../backend/.venv/bin/python`, so create backend/.venv and install requirements.txt there. Run `npm run test:e2e:install` to fetch Chromium. DATABASE_URL must be set in the environment. |
| Port 5432 or 8000 is already in use. | Stop the conflicting local process (e.g. a local PostgreSQL), or change the port mapping in docker-compose.yml or the uvicorn --port argument and update DATABASE_URL or VITE_API_BASE_URL to match. |
<!-- sdlc:auto:end troubleshooting -->
