# Event Registration System

CSE706 Agile and Scrum, end-semester project, Group 7.

Students register for college and tech events. Admins manage registrations and send confirmation emails.

## Scrum team

| Role | Member |
|---|---|
| Product Owner + Developer | Aarya Abhijit Dongre |
| Scrum Master + Developer | Dhanraj Milind Shitole |
| Developer, tech lead | Yatharth Singh Panwar |

## Sprints

- Sprint 1: Wed 11 Nov 2026 12:00 to Fri 13 Nov 13:00
- Sprint 2: Fri 13 Nov 16:00 to Sun 15 Nov 13:00

## How we work

- Every change goes through a pull request with 1 approval and green CI.
- Branch names and PR titles start with the Jira key, for example `EV-8-sign-up`.
- Merge with a merge commit, never squash, so the TDD red, green and refactor commits stay visible.

## Docs

- `docs/01-vision.md`: product vision, Definition of Done, working agreement
- `docs/jira/`: Product Backlog import file and the story-to-Jira-key map
- `docs/scrum/`: planning, daily scrums, reviews, retrospectives, pairing and code review notes
- `docs/testing/`: Agile Testing Quadrants and exploratory testing
- `docs/metrics.md`, `docs/risks.md`: velocity, quality metrics and risk register

## Run the whole app with Docker (offline demo)

Needs only Docker.

```bash
docker compose up --build
```

- App: http://localhost:3000 (migrations and demo events are applied on start)
- Emails: http://localhost:8025 (Mailpit catches every confirmation)
- Admin login: `admin@events.local` / `admin-demo-123` (local demo only)

## Develop locally

Needs Node.js 22 and Docker.

```bash
npm install
cp .env.example .env
docker compose up -d db mail   # Postgres on port 5433, Mailpit inbox on http://localhost:8025
npx prisma migrate dev         # create the tables
npm run db:seed                # demo events and the admin account
npm run dev                    # http://localhost:3000
```

## Checks

| Command | What it does |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, including Next.js route types |
| `npm test` | Vitest unit tests, writes `reports/junit.xml` |
| `npm run test:coverage` | Unit tests with a coverage report in `coverage/` |
| `npm run test:integration` | Integration tests against Postgres (needs `DATABASE_URL`) |
| `npm run test:e2e` | Selenium tests in headless Chrome against `BASE_URL`, HTML report in `reports/e2e/` |

GitHub Actions runs all of these on every pull request, then applies the migrations to a fresh Postgres and builds the app.
