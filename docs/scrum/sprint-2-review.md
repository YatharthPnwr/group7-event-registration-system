# Sprint 2 Review

> Draft prepared from the Jira and GitHub records on 15 Nov 2026. The team adds stakeholder feedback during the review.

**Held:** Sun 15 Nov 2026 **Sprint goal met?** **Yes**, 25 of 25 SP.

## Results

| | Story points |
|---|---|
| Committed | 25 |
| Completed | 25 |
| Not Done | 0 |

## Increment demonstrated (release v1.0.0)

| Story | PR | What was shown |
|---|---|---|
| EV-11 Browse upcoming events | #4 | Events list, soonest first, with seats left and a Full badge |
| EV-9 Log in and log out with roles | #5 | Students to Events, admins to the Admin dashboard, generic login error, students blocked from /admin |
| EV-10 Admin creates an event | #6 | Create-event form with validation (past date, deadline after start, capacity below 1) |
| EV-13 View and cancel my registrations | #7 | My registrations; cancel frees the seat; register again afterwards |
| EV-15 Confirmation email (TDD 2) | #8 | Email in Mailpit with title, date, venue and registration ID; FAILED logged when the mail server is down |
| EV-17 Admin views registrations | #9 | Registrants with status and email status, "confirmed / capacity" |
| EV-14 Selenium smoke test | #10 | 4 headless-Chrome tests passing in CI, HTML report |
| EV-22 Docker setup | #11 | `docker compose up --build` running the whole app offline on an empty database |

## Backlog changes

- **EV-26** (new, 3 SP): deploy to a public URL with Vercel and Neon, split out of EV-22, which delivered only the Docker part.
- Remaining future work: EV-16 resend confirmation, EV-18 admin removes a registration, EV-19 edit or cancel an event, EV-20 search and filter UI, EV-21 full Selenium regression, EV-23 CSV export, EV-24 cancellation email, EV-25 waitlist, EV-26 public deployment.
- _Stakeholder feedback: to be added by the team._
