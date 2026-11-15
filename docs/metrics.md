# Metrics

All numbers come from Jira (sprint and velocity reports, work item history), GitHub (pull requests, Actions runs) and the test tools. Collected on Sun 15 Nov 2026.

## Velocity and commitment

| Sprint | Window (IST) | Planned at planning | Commitment recorded by Jira | Completed (velocity) | Completion | Not completed |
|---|---|---|---|---|---|---|
| Sprint 1 | started 11 Nov 06:30, planned end 13 Nov 13:00, completed 15 Nov 11:31 | 25 SP (8 stories) | 0 SP | **11 SP** (EV-7, EV-8, EV-12) | 44% of plan | 14 SP (EV-9, EV-10, EV-11, EV-13, EV-14) carried into Sprint 2 |
| Sprint 2 | 15 Nov 11:31 to 23:00, completed 15 Nov 12:22 | 25 SP (8 stories) | 25 SP | **25 SP** | 100% | 0 |
| **Average** | | | | **18 SP** | | |

**Why Jira shows a Sprint 1 commitment of 0:** the sprint was started at 06:30 on 11 Nov while it was still empty, and all eight stories were dragged in afterwards. Jira counts only the work present at the moment of starting, so the velocity chart shows commitment 0 and completed 11.

**Release burnup:** total backlog 61 SP at the start (19 stories), 64 SP after EV-26 (public deployment) was split out at the Sprint 2 review. Delivered 11 SP after Sprint 1 and 36 SP after Sprint 2. 28 SP remain as future work.

Charts: `evidence/charts/sprint1-burndown.png`, `sprint2-burndown.png`, `velocity.png`, `release-burnup.png`. Jira's own velocity report: `evidence/screenshots/2026-11-15_jira-velocity-report.jpg`.

## Reading the charts

- **Sprint 1 burndown:** scope jumps from 0 to 25 at about 09:40 on 11 Nov when the stories were added. Remaining work dropped to 22 when EV-7 was done (11 Nov 16:18) and to 19 when EV-8 was done (12 Nov). From 12 to 15 Nov the line stays nearly flat because no further story reached Done: on 13 and 14 Nov Aarya was working on EV-14 and Dhanraj on EV-9, EV-10 and EV-13, and none of these was merged until 15 Nov. EV-12 was merged on 12 Nov, but its card was moved to Done only on 15 Nov (drop to 11). The dip to 16 on 14 Nov is EV-9 being moved to Done before its PR merged; it went back to In Progress on 15 Nov, leaving 14 at close.
- **Sprint 2 burndown:** no scope change. Remaining work fell in two steps, 25 → 14 at 11:55 when PRs #4–#7 merged and 14 → 0 at 12:21 when PRs #8–#11 merged. All four Sprint 1 leftovers were nearly finished when Sprint 2 started, which is why the sprint closed within an hour.
- **Velocity:** 11 then 25, average 18. Sprint 2 is not evidence of a sustainable pace of 25 a day. It reflects stories that were already in progress in Sprint 1 and were merged early in Sprint 2.
- **Burnup:** the scope line rises once, by 3 SP, when the public deployment was split into its own story. That is honest re-scoping, not creep.

## Quality

| Metric | Value | Source |
|---|---|---|
| Unit tests | 44, all passing | Vitest (`reports/junit.xml` in CI) |
| Integration tests (real Postgres) | 7, all passing | Vitest integration config |
| Selenium end-to-end tests | 4, all passing in CI | Mocha + selenium-webdriver, HTML report |
| Line coverage, business logic (`src/services`, `src/domain`) | 99.0% lines, 99.2% statements, 90.2% branches | Vitest V8 coverage |
| Line coverage, whole `src` (unit tests only) | 47.6% | Database and route code are covered by the integration and Selenium tests instead |
| CI runs | 20 succeeded, 0 failed, 3 cancelled (superseded by a newer push) | GitHub Actions |
| Pull requests merged | 11 | GitHub |
| PR open-to-merge time | median 13 min, longest 3 h 27 min (PR #3) | GitHub |
| Commits on main | 40 | git |
| Code size | 1,954 lines in `src`, 1,003 lines of tests | `wc -l` |
| Defects found after merge | 2: a dev-server reload loop (fixed by pinning `turbopack.root`) and an empty failure reason for refused SMTP connections (fixed in EV-15) | Commit history |

## Interpretation

1. **Finished work, not effort, moves the burndown.** Aarya and Dhanraj worked on their stories on 13 and 14 Nov, but none was merged until 15 Nov, so the chart is flat on those days. Smaller stories, and pushing work in progress as draft PRs each day, would make that work visible on the board.
2. **The Definition of Done keeps the board accurate.** Twice, cards reached Done before their PR was merged (EV-8 on 12 Nov, EV-9 on 14 Nov). Both went back to In Progress until the merge, and the burndown shows the corrections. The Definition of Done ("merged with CI green") is what caught it.
3. **Automation held quality steady while pace varied.** Every merge passed lint, typecheck, unit, integration and (from PR #10) Selenium checks, and no failing build reached main.
4. **Sprint planning order matters.** Starting the sprint before adding the stories made Jira record a commitment of 0 for Sprint 1, which hides the planned 25 from the velocity chart. Sprint 2 was planned first and started second, and its chart is correct.
