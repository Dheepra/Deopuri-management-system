# Deopuri Management System

Spring Boot 4 backend + Vite/React 19 frontend for medical-shop management.

## Repository layout

```
deopuri/
├── backend/        Spring Boot multi-module Maven project (api, service, app)
├── frontend/       Vite + React 19 + Tailwind v4 single-page app
├── docs/           API docs and ADRs
├── package.json    Root orchestrator (concurrently runs both apps)
└── README.md
```

## Prerequisites

- **Java 21** (use `sdkman` or your platform's installer)
- **Node 20+** and **npm 10+**
- **MySQL 8** running locally on `:3306` (or set `DB_URL`)

The Maven wrapper (`backend/mvnw`) and npm bring everything else.

## One-time setup

```bash
git clone <repo>
cd deopuri
npm install        # installs concurrently at root, then runs `npm install` inside frontend/ automatically (postinstall)
```

That single command pulls both backend tooling (via the Maven wrapper, on demand) and the frontend's `node_modules`.

## Running locally

```bash
npm run dev
```

Starts both apps in parallel with **prefixed, color-coded logs**:

- `BACKEND` (green) — Spring Boot on `http://localhost:8080`
- `FRONTEND` (blue) — Vite dev server on `http://localhost:5173`

The frontend proxies any request beginning with `/api` to the backend (configured in [frontend/vite.config.js](frontend/vite.config.js)), so CORS is irrelevant in dev.

Press `Ctrl+C` once to stop both processes (concurrently propagates SIGINT to both children).

### Windows (cmd.exe / PowerShell)

`./mvnw` doesn't resolve under `cmd.exe`. Use the `:win` variants:

```cmd
npm install
npm run backend:win
:: in another terminal
npm run frontend
```

Or, for one-command parallel runs on Windows, change the `backend` script in [package.json](package.json) to call `mvnw.cmd` and re-run `npm run dev`.

## Required environment

The backend reads these env vars (with safe defaults in `application-dev.properties`):

| Variable | Default in dev | Notes |
|---|---|---|
| `JWT_SECRET` | dev-only fallback | **Must** be ≥ 32 chars in prod; otherwise the app refuses to start |
| `DB_URL` | `jdbc:mysql://localhost:3306/deopuri?createDatabaseIfNotExist=true` | |
| `DB_USERNAME` | `root` | |
| `DB_PASSWORD` | `root` (dev) | Override in prod |
| `SPRING_PROFILES_ACTIVE` | `dev` | Set to `prod` to disable verbose logging and `ddl-auto=update` |
| `JPA_DDL_AUTO` | `update` (dev) / `validate` (prod) | |

For a clean prod-like local run:

```bash
JWT_SECRET=$(openssl rand -hex 32) \
DB_PASSWORD=yoursecret \
SPRING_PROFILES_ACTIVE=prod \
npm run dev
```

## Useful scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start backend + frontend together |
| `npm run backend` | Backend only (`./mvnw spring-boot:run`) |
| `npm run frontend` | Frontend only (`vite`) |
| `npm run build` | Build backend (`./mvnw package`) then frontend (`vite build`) |
| `npm run test:backend` | Run JUnit tests in all backend modules |
| `npm run lint:frontend` | Run ESLint over the frontend |
| `npm run clean` | Remove all `target/`, `dist/`, and `node_modules/` |

## Production build

```bash
npm run build
```

Produces:

- `backend/deopuri-app/target/deopuri-app-0.0.1-SNAPSHOT.jar` — executable Spring Boot fat jar
- `frontend/dist/` — static assets to serve via any CDN or behind Nginx

Run the backend jar with:

```bash
JWT_SECRET=... DB_URL=... java -jar backend/deopuri-app/target/deopuri-app-0.0.1-SNAPSHOT.jar
```

## Troubleshooting

- **`Address already in use 8080` / `5173`** — Kill the stale process: `lsof -ti:8080 | xargs kill -9` (or `:5173`).
- **`jwt.secret must be configured`** — Export `JWT_SECRET` or rely on the dev profile.
- **MySQL connection refused** — Start MySQL or point `DB_URL` to your instance.
- **Maven wrapper denied (`./mvnw`)** — `chmod +x backend/mvnw`.
