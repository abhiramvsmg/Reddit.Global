# Reddit.Global - AI-Powered Social Media Platform

Full-stack Reddit-style social platform built with FastAPI, SQLAlchemy, JWT auth, PostgreSQL-ready persistence, Next.js, Tailwind CSS, and AI-assisted publishing/moderation.

This project is designed for appraisal as a realistic global product foundation: it has auth, communities, posts, voting, nested discussions, AI metadata, moderation workflows, profile pages, deployment config, and tests.

## Current Status

This repository contains the full source code. It is not a hosted public app by default; when you run it locally, the backend starts on `http://localhost:8000` and the frontend starts on `http://localhost:3000`.

Other users can use it by forking or cloning the repo, installing dependencies, and running both apps locally. They can also deploy their own copy to services such as Render/Railway for the backend and Vercel for the frontend.

## Repository

```text
https://github.com/abhiramvsmg/Reddit.Global
```

## Fork Or Clone

To make your own copy on GitHub:

1. Open `https://github.com/abhiramvsmg/Reddit.Global`.
2. Click **Fork**.
3. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/Reddit.Global.git
cd Reddit.Global
```

To clone this repository directly:

```bash
git clone https://github.com/abhiramvsmg/Reddit.Global.git
cd Reddit.Global
```

To contribute changes from a fork:

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Describe your change"
git push -u origin feature/your-feature-name
```

Then open a pull request on GitHub.

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm
- Git

## What Is Included

- User signup/login with JWT bearer tokens
- User profiles with avatar, bio, and role
- Protected community, post, vote, comment, and AI-assist actions
- Communities with unique slugs
- Community detail pages with banner support
- Text, image URL, and link posts
- Cloudinary signed image upload flow
- Upvote/downvote logic with one vote per user per post
- Comments and post detail API support
- Sorting by newest or top voted
- Paginated feeds with search
- Nested comments for discussion depth
- AI summaries, tags, language detection, toxicity score, and moderation status
- Admin/moderator review queue
- Dedicated post, community, and user profile routes
- PostgreSQL-ready configuration with SQLite as the local zero-config default
- AI provider boundary for future model integration
- Alembic migration scaffold for production database evolution

## Project Structure

```text
backend/
  app/
    api/          FastAPI routers
    core/         config and security
    models/       SQLAlchemy models
    schemas/      Pydantic request/response models
    services/     domain helpers and AI hook
frontend/
  app/            Next.js app router pages
  components/     React UI components
  lib/            API client and shared types
```

## Architecture

```text
Next.js + Tailwind UI
        |
        v
FastAPI REST API
        |
        +--> Auth/Profile/Community/Post/Vote/Comment Routers
        |
        +--> AI Service Boundary
        |       local heuristic mode
        |       provider mode through AI_BASE_URL + AI_API_KEY
        |
        +--> Upload Signature Service
        |       Cloudinary direct browser upload
        |
        v
SQLAlchemy ORM
        |
        v
PostgreSQL in production / SQLite for local demo
```

## Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Swagger docs are available at `http://localhost:8000/docs`.

For local setup, copy `backend/.env.example` to `backend/.env` only if you want to customize settings:

```bash
cp backend/.env.example backend/.env
```

Without that file, the backend uses SQLite as a zero-config local database. For PostgreSQL, set `DATABASE_URL` in `backend/.env`.

For production migrations:

```bash
cd backend
alembic upgrade head
```

Set `AUTO_CREATE_TABLES=false` in production so Alembic, not app startup, owns schema changes.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

For local setup, the frontend uses `http://localhost:8000` by default. To point it at another backend, copy `frontend/.env.example` to `frontend/.env.local` and edit:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Run The Full App Locally

Open two terminals:

Terminal 1:

```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.

## API Summary

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/{username}`
- `PATCH /api/users/me`
- `POST /api/communities`
- `GET /api/communities`
- `GET /api/communities/{slug}`
- `POST /api/posts`
- `GET /api/posts?sort=date|votes`
- `GET /api/posts/{id}`
- `GET /api/communities/{slug}/posts?sort=date|votes`
- `POST /api/votes`
- `POST /api/comments`
- `GET /api/posts/{id}/comments`
- `POST /api/ai/post-assist`
- `POST /api/ai/moderate`
- `GET /api/moderation/queue`
- `PATCH /api/moderation/posts/{id}`
- `POST /api/uploads/cloudinary-signature`

Feed endpoints return a paginated object:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "has_next": false
}
```

Use `q` on `/api/posts` for search, and `page` / `page_size` on feed endpoints for pagination.

## AI Integration Strategy

The app currently ships with a deterministic local AI layer so the MVP works without external accounts:

- Post assist improves title casing, summarizes content, detects language, and creates tags.
- Moderation assigns `approved`, `review`, or `blocked` with a toxicity score.
- Posts store AI metadata so the frontend can render trust and discovery signals.

For production, replace the internals of `backend/app/services/ai.py` with your model provider call while preserving the response schemas. Configure provider settings through:

```bash
AI_PROVIDER=local
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=production-model
```

If `AI_PROVIDER` is not `local` and `AI_BASE_URL` / `AI_API_KEY` are set, the service attempts an OpenAI-compatible `/chat/completions` call and falls back to local mode if the provider fails.

## Security Decisions

- Passwords are hashed with bcrypt through Passlib.
- JWT bearer auth protects write routes.
- The first registered user becomes `admin`; later users are regular users.
- Moderator-only endpoints require `admin` or `moderator` role.
- Votes are unique per user/post.
- CORS is environment-configurable for deployed frontend domains.
- Cloudinary uploads use short-lived signed upload parameters; secrets stay in the backend.

## Appraisal Highlights

- Real product flows: signup, create community, create post, vote, comment, reply, search, profile, moderation.
- AI is visible in the UI through summaries, tags, language, moderation status, and toxicity score.
- The architecture separates routers, schemas, services, models, and config.
- The project includes tests and production deployment config.
- Dynamic frontend routes demonstrate product depth:
  - `/posts/[id]`
  - `/r/[slug]`
  - `/u/[username]`

## Testing

```bash
cd backend
.venv\Scripts\activate
python -m pytest -q

cd ../frontend
npm run build
```

## Deployment Notes

- Backend: deploy `backend` to Render or Railway with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Frontend: deploy `frontend` to Vercel and set `NEXT_PUBLIC_API_URL` to the backend URL.
- Set a strong `JWT_SECRET` in production.
- Use managed PostgreSQL for production data.
- Configure Cloudinary env vars to enable browser image uploads.
- Use `render.yaml` and `frontend/vercel.json` as deployment starting points.

## Next Global-Level Upgrades

- Add model-backed duplicate-post detection, translation, recommendations, and semantic search.
- Add upload transformations, malware scanning, and CDN image presets.
- Add Redis caching, rate limiting, observability, and background AI jobs.
- Add Playwright coverage for browser-level flows.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
