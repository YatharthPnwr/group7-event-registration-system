# Agile Testing Quadrants

The quadrants (Brian Marick, popularised by Lisa Crispin and Janet Gregory) sort tests on two axes. One axis asks whether a test is **technology-facing or business-facing**. The other asks whether it **supports the team** while building, or **critiques the product** after it is built.

| | Supports the team | Critiques the product |
|---|---|---|
| **Business-facing** | **Q2: functional and story tests.** Acceptance criteria on every user story, and the Selenium browser suite that checks them (`tests/e2e`). Mostly automated. | **Q3: exploratory testing and UAT.** Exploratory session (`exploratory-session.md`) and stakeholder feedback at Sprint Reviews. Manual. |
| **Technology-facing** | **Q1: unit and integration tests.** Vitest unit tests written by TDD for `RegistrationService` and `NotificationService`, plus the integration test for concurrent last-seat registration. Automated in CI. | **Q4: performance and security.** Lighthouse report on the live site and `npm audit` for vulnerable dependencies. Tool-driven. |

## Where each artefact lives

| Quadrant | Evidence | Result |
|---|---|---|
| Q1 | Vitest JUnit XML and coverage (CI artifact) | ____ tests, ____ % coverage |
| Q2 | Selenium HTML report (CI artifact) | ____ / 10 scenarios passing |
| Q3 | `exploratory-session.md`, sprint review notes | ____ bugs found |
| Q4 | `lighthouse-report.html`, `npm-audit.txt` | Performance ____, high-severity vulnerabilities ____ |
