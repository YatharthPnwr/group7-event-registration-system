# Story label to Jira key mapping

Filled after the CSV import on Wed 11 Nov 2026. Epics: EV-1 Accounts, EV-2 Events, EV-3 Registration, EV-4 Admin Management, EV-5 Notifications, EV-6 Platform. Each Jira summary starts with its US label, so the mapping is easy to read from the backlog.

| Label | Story | Jira key |
|---|---|---|
| US-01 | Sign up | EV-8 |
| US-02 | Log in and log out with roles | EV-9 |
| US-03 | Admin creates an event | EV-10 |
| US-04 | Browse upcoming events | EV-11 |
| US-05 | Admin edits or cancels an event | EV-19 |
| US-06 | Search and filter events | EV-20 |
| US-07 | Register for an event | EV-12 |
| US-08 | View and cancel my registrations | EV-13 |
| US-09 | Admin views registrations per event | EV-17 |
| US-10 | Admin removes a registration | EV-18 |
| US-11 | Export registrations as CSV | EV-23 |
| US-12 | Confirmation email on registration | EV-15 |
| US-13 | Admin resends a confirmation | EV-16 |
| US-14 | Email when an event is cancelled | EV-24 |
| US-15 | Repository and CI pipeline | EV-7 |
| US-16 | Selenium smoke test | EV-14 |
| US-17 | Full Selenium regression suite | EV-21 |
| US-18 | Docker setup and deployment | EV-22 |
| US-19 | Waitlist with auto-promotion | EV-25 |

## Importing `backlog-import.csv`

1. Open Settings (gear icon), then System, then External System Import, then CSV.
2. Upload `backlog-import.csv` and choose the space `EV`.
3. Map these columns:
   - Work item ID → Work item ID
   - Work type → Work type
   - Summary → Summary
   - Description → Description
   - Priority → Priority
   - both Labels columns → Labels
   - Parent → Parent
4. Run the import, then check that 6 epics and 19 stories exist, each story under its epic.

The CSV holds no story points on purpose. Type them in after Planning Poker.
