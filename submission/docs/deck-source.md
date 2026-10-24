# Policy Evidence Check submission deck

Team: SamuraiFlow. Evidence snapshot: 24 October 2026. Core application baseline: `8889f08d3ed439d040a22b750d46adf4d970862a`.

The seven-slide PDF is built by `build-deck.py`. Tables read the exact saved receipt files. The script validates receipt/fixture equality, predeclared fixture hashing, reported model hashes and the twelve-attempt exhausted global budget before building. It makes no network or model calls.

1. **Policy Evidence Check.** Release blockers with visible uncertainty. Twelve actual calls using synthetic release approval, MFA and PHP evidence.
2. **Release approval evidence.** Exact supplied claim and synthetic rejection evidence show why passing tests alone cannot establish release permission. The actual Sapling result is singleton violation.
3. **Sapling integration and receipt flow.** Policy/evidence/claim enter a local adapter. The adapter reserves budget, forwards exact strings and saves the raw response. Sapling provides the classification and uncertainty metadata. No fine-tuning or generated explanation.
4. **Deployment approval: four predeclared cases.** A table shows all four follow-up cases. Explicit rejection yields singleton violation and contradictory approvals yield singleton inconsistent context. Approval plus passing tests and missing approval remain unsure. Human references were fixed before execution and were not sent to the model. The app reviews evidence and does not enforce a deployment gate.
5. **Earlier MFA and PHP outcomes.** The original eight calls remain visible, including seven unsure results and one inconsistent-context singleton. PHP scope is CVE-2026-109618. All three PHP outputs remain unsure, and the bound-backport supported expectation failed.
6. **Observed behavior and limits.** Twelve total calls, nine uncertain responses, one violation singleton and two inconsistent-context singletons. Ten passed mocked tests. No general accuracy, production-readiness, security-certification or real-site remediation claim.
7. **Reproduce and inspect.** Verified repository and local commands. Exhausted twelve-call global budget. Synthetic data only. Public app/video links pending verification. SamuraiFlow registration/rules acceptance owner reported complete at 08:22 UTC, with no assertion of check-in or final submission completion.

## Source map

- `sidequests/policy-evidence-check/server.mjs`: exact adapter behavior and endpoint.
- `sidequests/policy-evidence-check/public/app.js`: status hierarchy and saved-receipt replay behavior.
- `sidequests/policy-evidence-check/fixtures.json`: eleven selectable synthetic cases and authored human expectations after the four deployment fixtures joined the original seven.
- `sidequests/policy-evidence-check/receipts/receipt-01-*.json` through `receipt-08-*.json`: exact model outputs and metadata.
- `sidequests/policy-evidence-check/receipts/call-ledger.json`: twelve used attempts against a twelve-attempt limit, retaining the original eight and the four authorized diagnostic follow-ups.
- `sidequests/policy-evidence-check/diagnostics/deployment-approval/`: four predeclared release-approval fixtures, their exact receipts, the global twelve-call ledger and results report. The diagnostic ledger already references the original eight entries; counts must not be summed.
- `sidequests/policy-evidence-check/PHP_HOSTING_CASES.md` and `sources/php-hosting.json`: dated attributed advisory context and fetched-record hash.
- `sidequests/policy-evidence-check/VALIDATION.md` and the existing mocked test suite: application checks and their limits.

The PDF includes clickable source links pinned to the original app baseline and diagnostic-results commit `42354a3db7b443bdbef64e1617f13df41f7f2c2b`. No speculative deployment URL or video URL is supplied. A later final link update should also update the docs and private submission drafts, then rerender and inspect the PDF again.
