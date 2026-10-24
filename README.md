# Mubit Night Shift

SamuraiFlow's repository for the Mubit hackathon project and its sidequests. The initial code was built during the event on 24 October 2026.

## Policy Evidence Check

[Policy Evidence Check](sidequests/policy-evidence-check/README.md) reviews synthetic release evidence using Banyan Sapling. Its primary examples identify an explicit rejection and conflicting approvals before release, while inconclusive results remain in human review. It displays calibrated status and exact saved request/response receipts; it does not control deployment. Seven earlier MFA/PHP cases and all their results remain available as historical examples.

Twelve recorded calls returned nine calibrated `unsure` results, one `violation` and two `inconsistent_context` results. The approved release remained unsure despite its supported human reference. These exploratory cases preserve their failures and do not establish accuracy or reliable approval automation.

Requires Node 22 or newer; no dependencies or build step.

```sh
git clone https://github.com/Azuremis/mubit-night-shift.git
cd mubit-night-shift/sidequests/policy-evidence-check
npm test
npm start
```

Open http://127.0.0.1:4321. If that port is already in use, run `PORT=4322 npm start` and open http://127.0.0.1:4322. The server binds only to localhost. Selecting fixtures and inspecting saved receipts makes no model calls. All **twelve authorized attempts are recorded and the budget is exhausted**, so Verify is disabled. Preserve the ledger; do not reset it to make new calls.

- [Validation](sidequests/policy-evidence-check/VALIDATION.md)
- [Predeclared deployment cases and actual results](sidequests/policy-evidence-check/diagnostics/deployment-approval/REPORT.md)
- [Documentation overview](submission/docs/README.md)
- [Setup, replay and tests](submission/docs/SETUP.md)
- [Local API and upstream contract](submission/docs/API.md)
- [All recorded results and provenance](submission/docs/EVIDENCE.md)
- [Data handling and limits](submission/docs/DATA_AND_LIMITS.md)
- [Submission PDF](submission/output/pdf/policy-evidence-check-submission.pdf)
- [Demo script](sidequests/policy-evidence-check/DEMO_SCRIPT.md)
- [PHP hosting cases and attributed sources](sidequests/policy-evidence-check/PHP_HOSTING_CASES.md)
- [Reviewed screenshots](sidequests/policy-evidence-check/screenshots/)
- [Migration and privacy review](sidequests/policy-evidence-check/MIGRATION.md)

## Public repository boundary

Only reviewed sidequest code, synthetic fixtures, receipts, screenshots and documentation belong in this repository. Existing local session data and research are excluded by `.gitignore`. Keep credentials, private client data, agent configuration and future unreviewed runtime outputs out of commits. Review the staged file list before every push; ignore rules do not remove already tracked files.

The existing `/model-card-clean/` and `/research/` directories stay local. Private submission drafts and QA intermediates remain in ignored `.local/` directories. Public app and video links are added only after verification. Social publication and final challenge submission remain separate actions.
