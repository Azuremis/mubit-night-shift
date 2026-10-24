# Mubit Night Shift

One repository for the Mubit hackathon project and its sidequests. The initial code was built during the event on 24 October 2026.

## Policy Evidence Check

[Policy Evidence Check](sidequests/policy-evidence-check/README.md) compares a policy, claim and synthetic security records using Banyan Sapling. The UI preserves calibrated uncertainty and displays exact saved request/response receipts.

Requires Node 22 or newer; no dependencies or build step.

```sh
cd sidequests/policy-evidence-check
npm test
npm start
```

Open http://127.0.0.1:4321. If that port is already in use, run `PORT=4322 npm start` and open http://127.0.0.1:4322. The server binds only to localhost. Selecting fixtures and inspecting saved receipts makes no model calls. All **eight authorized attempts are recorded and the budget is exhausted**, so Verify is disabled. Preserve the ledger; do not reset it to make new calls.

- [Validation](sidequests/policy-evidence-check/VALIDATION.md)
- [Demo script](sidequests/policy-evidence-check/DEMO_SCRIPT.md)
- [PHP hosting cases and attributed sources](sidequests/policy-evidence-check/PHP_HOSTING_CASES.md)
- [Reviewed screenshots](sidequests/policy-evidence-check/screenshots/)
- [Migration and privacy review](sidequests/policy-evidence-check/MIGRATION.md)

## Public repository boundary

Only reviewed sidequest code, synthetic fixtures, receipts, screenshots and documentation belong in this repository. Existing local session data and research are excluded by `.gitignore`. Keep credentials, private client data, agent configuration and future unreviewed runtime outputs out of commits. Review the staged file list before every push; ignore rules do not remove already tracked files.
