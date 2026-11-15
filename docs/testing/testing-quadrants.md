# Agile Testing Quadrants

The quadrants (Brian Marick, popularised by Lisa Crispin and Janet Gregory) sort tests on two axes. One axis asks whether a test is **technology-facing or business-facing**. The other asks whether it **supports the team** while building, or **critiques the product** after it is built.

| | Supports the team | Critiques the product |
|---|---|---|
| **Business-facing** | **Q2: functional and story tests.** Acceptance criteria written as Given/When/Then on every story, checked on every PR. Selenium suite (`tests/e2e`) automates the main student path in headless Chrome. | **Q3: exploratory testing and UAT.** Manual checks in Chrome at the end of each story (screenshots in `evidence/screenshots`), and the Sprint Reviews. |
| **Technology-facing** | **Q1: unit and integration tests.** Vitest unit tests (two modules built by TDD: registration rules and confirmation email), plus integration tests on a real Postgres, including concurrent registrations. All run in CI on every PR. | **Q4: performance, security and reliability.** Concurrency tests (two students racing for the last seat, double-click cancel), bcrypt password hashing, timing-safe login, httpOnly signed session cookies, SMTP-failure handling. |

## Where each artefact lives

| Quadrant | Evidence | Result (15 Nov 2026) |
|---|---|---|
| Q1 | `tests/unit`, `tests/integration`, JUnit XML and coverage in CI artifacts, TDD outputs in `evidence/tdd` | 44 unit and 7 integration tests passing. Business-logic coverage 99% of lines. |
| Q2 | Acceptance criteria in each Jira story and PR. `tests/e2e/smoke.test.mjs` with Page Objects. Selenium HTML report artifact. | 4 of 4 Selenium tests passing in CI. Required check on `main`. |
| Q3 | Screenshots of each feature, sprint review notes | Found and fixed 2 defects: the dev-server reload loop, and the empty SMTP failure reason. |
| Q4 | `tests/integration/registration-concurrency.test.ts`, `src/infrastructure/sessionToken.ts`, `AuthService.logIn` | Exactly one winner for the last seat; a double cancel frees one seat. Sessions reject tampered or expired tokens. |

**Not done:** a load test and a Lighthouse or `npm audit` pass. These are noted as future work.
