# Social Media App — Backend

## Overview

This repository contains the backend for the Social Media App project. It provides a scalable, modular REST/GraphQL API and real-time messaging features intended to support a modern social media client application. The backend is implemented in TypeScript and follows clean architecture principles, with separated modules for authentication, users, posts, comments, stories, chat, and real-time socket handling.

## Key Features

- User authentication and authorization (JWT-based).
- REST and GraphQL endpoints for flexible integrations.
- Real-time messaging and notifications via WebSockets.
- Post, comment, story, and chat management.
- File uploads using S3 and Firebase integrations for media handling.
- Rate limiting and request validation middleware.
- Email sending for verification and notifications.
- Redis support for caching and session/state helpers.
- Cron jobs for background tasks and maintenance.

## Architecture and Structure

The codebase is organized by domain modules under `src/module/` with shared utilities and services under `src/common/` and `src/DB/`.

- [src/app.ts](src/app.ts) — Application bootstrap and server start.
- [package.json](package.json) — NPM scripts and dependencies.
- [src/DB/DB.connection.ts](src/DB/DB.connection.ts) — Database connection and initialization helper.
- src/module/ — Domain modules (auth, user, posts, comment, story, chat, realTime, etc.).
- src/common/ — Middleware, utilities, enums, and security helpers.
- src/config/ — Configuration and environment-related utilities.

Notable modules:

- `auth` — Authentication flow, DTOs, validation and token handling.
- `user` — User business logic, profile management, and GraphQL integration.
- `posts` — Post creation, retrieval, and feed utilities.
- `comment` — Comment handling and related schemas.
- `chat` — Chat services, schema, and repository logic.
- `realTime` — Socket gateway and real-time message broadcasting ([src/module/realTime/socket.gateway.ts](src/module/realTime/socket.gateway.ts)).

## Technology Stack

- Node.js + TypeScript
- Express (HTTP) and WebSockets (real-time)
- MongoDB (Mongoose) for primary data storage
- Redis for caching and ephemeral state
- AWS S3 for file storage (or alternate S3-compatible provider)
- Firebase for push notifications and some media workflows
- Nodemailer for email delivery

## Environment & Configuration

Create a `.env` file at the project root or set environment variables in your deployment environment. Typical environment variables used by this project include:

- `PORT` — Server port (default: 3000)
- `NODE_ENV` — `development` | `production`
- `MONGO_URI` — MongoDB connection string
- `REDIS_URL` — Redis connection URL
- `JWT_SECRET` — Secret used to sign JWT tokens
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `S3_BUCKET_NAME` — S3 credentials
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` — SMTP credentials
- `FIREBASE_CREDENTIALS_PATH` — Path to Firebase service account JSON in `src/config/`

See configuration helpers in [src/config/config.services.ts](src/config/config.services.ts).

## Installation

Prerequisites: Node.js (>= 18 recommended), npm or yarn, MongoDB, Redis (optional for some features).

1. Install dependencies:

```bash
npm install
```

2. Create and populate environment variables (see "Environment & Configuration").

3. Start in development mode:

```bash
npm run dev
```

Common npm scripts (check `package.json` for exact names):

- `npm run dev` — Start development server with hot reload
- `npm start` — Start production server
- `npm run build` — Build TypeScript to JavaScript
- `npm test` — Run automated tests

## Database & Migrations

This project uses MongoDB with Mongoose schemas found in `src/DB/models/`. Connection logic is in [src/DB/DB.connection.ts](src/DB/DB.connection.ts). If you use seeded data or migrations, include migration scripts in a `scripts/` folder or use a migration tool such as `migrate-mongo`.

## Running Locally (Quick)

1. Ensure MongoDB is running and `MONGO_URI` points to the instance.
2. Ensure Redis is running if you plan to use caching features.
3. Populate `.env` with required secrets.
4. Run:

```bash
npm install
npm run dev
```

The API will be available at `http://localhost:${PORT || 3000}`.

## Testing

If tests are present, run them with:

```bash
npm test
```

Add unit and integration tests under a `test/` or `__tests__/` folder and use a test runner such as Jest or Mocha.

## Deployment

- Build the project: `npm run build`.
- Use a process manager (PM2) or containerize using Docker for production.
- Configure environment variables securely in your hosting platform (Heroku, AWS ECS, DigitalOcean, etc.).
- Ensure MongoDB and Redis are reachable from production environment.
- Set up S3 and email credentials and verify push notification (Firebase) settings.

## Observability & Monitoring

- Add logging and request tracing via the middleware in `src/common/middleware/logger.ts`.
- Monitor app health with readiness and liveness endpoints.
- Use centralized logging (e.g., ELK, Datadog) for production.

## Contributing

- Follow the repository code style (TypeScript, ESLint rules if present).
- Run linters and tests locally before opening a PR.
- Provide clear PR descriptions and link issues you fix.

## Security Considerations

- Keep `JWT_SECRET`, database credentials, and third-party API keys out of source control.
- Validate and sanitize all user input (see `src/common/middleware/validation.ts`).
- Rate-limit public endpoints (middleware `src/common/middleware/limiter.ts`).
- Secure file upload endpoints and validate file types and sizes.

## Useful Files

- [src/app.ts](src/app.ts)
- [package.json](package.json)
- [src/config/config.services.ts](src/config/config.services.ts)
- [src/DB/DB.connection.ts](src/DB/DB.connection.ts)
- [src/module/realTime/socket.gateway.ts](src/module/realTime/socket.gateway.ts)
- [src/common/middleware/validation.ts](src/common/middleware/validation.ts)
- [src/common/middleware/limiter.ts](src/common/middleware/limiter.ts)

## Contact

For questions about this repository, reach out to the project maintainers or open an issue.

---

This README is intended to provide a clear, actionable overview for new developers and maintainers. If you want, I can expand this into separate CONTRIBUTING, DEPLOYMENT, or ARCHITECTURE documents.
