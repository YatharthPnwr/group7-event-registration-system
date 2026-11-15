# Risk Register

Probability and impact use Low, Medium or High. The last column records what actually happened, reviewed on 15 Nov 2026.

| ID | Risk | Probability | Impact | Mitigation | Owner | What actually happened |
|---|---|---|---|---|---|---|
| R1 | 2-day sprints give thin burndown charts | High | Medium | Move items in real time, disclose the short sprints in the report | Dhanraj | **Happened.** Sprint 1 ran from 11 to 15 Nov and Sprint 2 on one day. The charts still tell a clear story because every move is timestamped. |
| R2 | Examiner questions Vitest as an xUnit tool | Medium | Medium | Ask faculty on Day 1, show the JUnit XML output | Dhanraj | Mitigated: CI publishes JUnit XML (`reports/junit.xml`). The faculty question was not confirmed in writing. |
| R3 | Only one person understands the code | Medium | High | Owner walkthrough per story, viva rehearsal on Day 5 | Yatharth | **Still open.** Most code was written by the tech lead with an AI assistant. Walkthroughs and rehearsal are planned before the viva. |
| R4 | Development laptop powers off under heavy load on battery | Medium | High | Stay plugged in, let CI run heavy jobs, commit often | Yatharth | Did not happen. Heavy builds ran on mains power, and tests ran in CI. |
| R5 | Gmail or Wi-Fi fails during the viva demo | Medium | High | Rehearsed offline Docker fallback with Mailpit | Yatharth | Mitigated: `docker compose up --build` runs the whole app offline. It was tested on an empty database on 15 Nov. The public Vercel deployment was deferred (EV-26). |
| R6 | Jira Free plan lacks a report | Low | Medium | Build the chart manually from exported data | Dhanraj | Did not happen. Burndown, burnup, velocity and sprint reports are all available on the Free plan. |
| R7 | Print shop closed on Sunday 15 Nov | Medium | High | Confirm on Saturday, otherwise print early Monday | Dhanraj | Open on 15 Nov: to be confirmed. |
| R8 | Scope too large for 2 sprints | Medium | Medium | Size Sprint 2 to Sprint 1 velocity, drop Should items first | Aarya | Sprint 1 completed 11 of 25 SP. Sprint 2 carried over the rest and dropped all Should and Could items except those needed by the brief. |
| R9 *(new)* | Jira cards moved ahead of the code | Not foreseen | High | Definition of Done requires a merged PR with CI green; GitHub for Jira shows code on each card | Scrum Master | **Happened twice** (EV-8 on 12 Nov, EV-9 on 14 Nov). Both went back to In Progress until their PRs were merged. |
| R10 *(new)* | Wrong Jira site timezone (+11 Sydney) | Not foreseen | Medium | Set the site default timezone to India | Yatharth | Found and fixed on 12 Nov. Sprint 1's end date was corrected to 13 Nov 13:00 IST. |
| R11 *(new)* | Work in progress not visible on the board | Not foreseen | Medium | Daily Scrum log every day; push work in progress as draft PRs | Scrum Master | **Happened on 13 and 14 Nov:** Aarya (EV-14) and Dhanraj (EV-9, EV-10, EV-13) worked on their stories, but none was merged until 15 Nov, so the burndown stayed flat. |
