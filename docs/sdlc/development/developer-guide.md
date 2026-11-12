# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `632c7a4` · model `auto`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
Book lending - v1 is a two-app repository for a book-lending tool (sign-up/sign-in, book CRUD, borrowing with a 14-day due date, returns, and a dashboard of current and overdue loans). The frontend is a Vite + React 19 + TypeScript SPA styled with Tailwind, using react-router-dom. Its screens (SignIn, SignUp, Dashboard, Books, BookForm) currently render seeded sample data. frontend/src/lib/api.ts is the seam for real API calls but is not used by any screen yet. The backend is a FastAPI service with SQLAlchemy and Pydantic. Right now it only exposes GET /health. models.py declares no tables, and schemas.py holds only a StubResponse placeholder. The database defaults to local SQLite and can be pointed at PostgreSQL through DATABASE_URL. A GitHub Actions workflow builds and deploys the app (a backend image to ECR, the frontend to AWS Amplify).
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js and npm (a version supported by Vite 6 / React 19; the manifests do not pin one)
- Python 3.12 (the version used by backend/Dockerfile) and pip
- Docker with Docker Compose (optional, only for the local PostgreSQL 16 service in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. cd frontend && npm install
2. cd backend && pip install -r requirements.txt
3. (Optional, for Playwright e2e) The Playwright config starts the API with backend/.venv/bin/python, so install the backend requirements into a virtualenv at backend/.venv: cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt
4. (Optional) Start PostgreSQL: docker compose up -d db, then set DATABASE_URL for the backend. See .env.example for the project's environment variables. Without DATABASE_URL the backend uses sqlite:///./app.db.
5. (Optional) To point the frontend at a non-default API, set VITE_API_BASE_URL (default http://localhost:8000) and VITE_API_SECRET_KEY when building or running it.
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| frontend dev | `cd frontend && npm run dev` | Starts the Vite dev server for the SPA (the backend's default dev CORS origins are http://localhost:5173 and http://127.0.0.1:5173). |
| frontend build | `cd frontend && npm run build` | Bundles the app with vite build. This does not typecheck. |
| frontend preview | `cd frontend && npm run preview` | Serves the production build locally. |
| backend dev | `cd backend && uvicorn app.main:app --reload` | Runs the FastAPI service with auto-reload on port 8000. Tables are created from the models at startup. Health check: GET /health. |
| database | `docker compose up -d db` | Starts a local PostgreSQL 16 container (user, password and database all 'app', port 5432). |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `.devcontainer/` | Dev container configuration (devcontainer.json). |
| `.github/workflows/` | GitHub Actions deploy workflow (deploy.yml): builds and pushes the API image and builds and publishes the frontend to AWS Amplify on push to main. |
| `.quorq/` | Quorq platform handoff metadata (handoff.json). |
| `backend/` | FastAPI service: Dockerfile, requirements.txt, pytest.ini, ruff.toml. |
| `backend/app/` | Application code: main.py (app, CORS, lifespan, /health), database.py (engine, session, Base, get_db), models.py (no tables yet), schemas.py (StubResponse). |
| `backend/app/routers/` | Reserved for generated routers, one per component that owns endpoints. Currently empty apart from __init__.py. |
| `backend/tests/` | Pytest suite with conftest.py. |
| `backend/tests/integration/` | Integration tests (test_health.py). |
| `backend/tests/unit/` | Unit tests (currently only __init__.py). |
| `frontend/` | Vite + React SPA: package.json, vite.config.ts, tsconfig.json, eslint and prettier config, Playwright config. |
| `frontend/e2e/` | Playwright acceptance tests (example.spec.ts). |
| `frontend/e2e/support/` | Helpers shared by the e2e specs (admin.ts). |
| `frontend/src/` | App entry (main.tsx), route table and shell (App.tsx), global CSS, Vitest setup and component tests. |
| `frontend/src/lib/` | Shared modules: api.ts (API base URL, bearer token handling, apiFetch), brand.ts, icons.tsx, navigate.ts, ui.tsx. |
| `frontend/src/screens/` | One module per approved screen: SignIn, SignUp, Dashboard, Books, BookForm. |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Frontend imports use the '@' alias for frontend/src (configured in vite.config.ts and tsconfig.json), e.g. import App from "@/App".
- One module per screen in src/screens/. Routes are declared in App.tsx; the shell menu wraps /dashboard, /books and /book-form, while /sign-in and /sign-up sit outside it and unknown paths redirect to /sign-in.
- Styling uses Tailwind plus brand CSS variables (var(--brand-*)) defined in src/index.css and src/lib/brand.ts.
- Component tests live beside the components (src/**/*.test.tsx) and run under Vitest with jsdom. Playwright specs live separately in e2e/.
- TypeScript is strict, but noImplicitAny and strictNullChecks are off in tsconfig.json.
- Frontend formatting uses Prettier and linting uses ESLint (flat config). Backend linting and formatting use Ruff (ruff.toml).
- The backend creates tables from SQLAlchemy models at startup (lifespan) instead of using migrations. Models inherit Base from app/database.py, and main.py imports app.models so they register.
- Routes are intended to be organised as one router per component, with unimplemented routes returning the typed StubResponse placeholder. The only real route today is GET /health.
- Backend configuration comes from environment variables: DATABASE_URL (default sqlite:///./app.db) and ALLOWED_ORIGINS (comma-separated; defaults to the Vite dev origins).
- The frontend API client (apiFetch) sends 'Authorization: Bearer <session token from localStorage, else VITE_API_SECRET_KEY>' and joins the base URL and path with exactly one slash.
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| frontend unit | `cd frontend && npm run test` | Runs Vitest component tests once (vitest run --passWithNoTests) over src/**/*.{test,spec}.{ts,tsx}. |
| frontend e2e install | `cd frontend && npm run test:e2e:install` | Installs the Playwright Chromium browser (needed once before e2e). |
| frontend e2e | `cd frontend && npm run test:e2e` | Runs Playwright tests from e2e/. Without E2E_BASE_URL it starts the backend (via backend/.venv) and builds and serves the frontend on port 4173. With E2E_BASE_URL set it tests that deployed URL. |
| frontend typecheck | `cd frontend && npm run typecheck` | Runs tsc --noEmit. The build does not do this. |
| frontend lint | `cd frontend && npm run lint` | Runs ESLint over the frontend. Use npm run lint:fix to auto-fix and npm run format:check to verify Prettier formatting. |
| backend tests | `cd backend && pytest` | Runs the pytest suite in backend/tests (pytest.ini sets pythonpath to the backend directory). |
| backend lint | `cd backend && ruff check .` | Lints the backend with Ruff. Use ruff format . to format. |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| `npm run build` succeeds but `npm run typecheck` reports errors. | This is expected. vite build does not typecheck, and the generated screens may contain untyped state (e.g. useState({})). Run npm run typecheck and fix the errors before relying on it. |
| pytest fails with `ModuleNotFoundError: No module named 'app'`. | Run pytest from the backend/ directory so pytest.ini's `pythonpath = .` applies. |
| The browser blocks API calls with a CORS error. | Set ALLOWED_ORIGINS (comma-separated) to the frontend's origin when starting the backend. By default only http://localhost:5173 and http://127.0.0.1:5173 are allowed. |
| The backend fails at startup with a database connection error. | If DATABASE_URL is set, make sure that server is running (for Postgres: docker compose up -d db). Unset DATABASE_URL to use the default local SQLite file app.db. |
| Playwright e2e cannot start the backend (e.g. backend/.venv/bin/python not found). | Create a virtualenv at backend/.venv and install backend/requirements.txt into it, or set E2E_BASE_URL to run the tests against an already-running deployment. |
| Playwright says the browser is not installed. | Run npm run test:e2e:install in frontend/. |
| The app shows sample data and signing in does not call the API. | This is expected. The screens run on seeded sample data and api.ts is not wired into them yet. The backend only implements GET /health. |
| `docker compose up` fails because port 5432 is already in use. | Stop the local PostgreSQL that is using 5432, or change the host port mapping for the db service in docker-compose.yml. |
<!-- sdlc:auto:end troubleshooting -->
