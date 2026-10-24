# Policy Evidence Check

A local release-evidence review demo using **actual Banyan Sapling inference**. It checks a release policy, a permission claim and synthetic approval/test records, then displays calibrated status, prediction set, secondary raw label and class scores. Every run has an inspectable JSON receipt. It is a review aid with no deployment control.

The primary task is identifying explicit rejection and contradictory approval evidence before release. Four predeclared deployment cases share one policy and claim. Seven earlier MFA/PHP fixtures remain under **Historical examples**, including their failed expectations and uncertain outputs. Sapling returns labels and scores; the app's review guidance is application-authored, not a model-generated explanation or an independent source-authenticity check.

## Primary release examples — actual results

| Case | Human reference | Calibrated status | Prediction set | Raw label |
| --- | --- | --- | --- | --- |
| Explicit rejection | violation | **violation** | violation only | violation |
| Conflicting approvals | inconsistent_context | **inconsistent_context** | inconsistent_context only | inconsistent_context |
| Approval plus passing tests | supported | unsure | All four labels | supported |
| Missing approval | insufficient_information | unsure | All four labels | violation |

The first two are demonstrated calibrated stop conditions. The positive case remains unsure, so these results do not establish reliable approval automation or four-class accuracy. Keep that limitation visible. The interface starts on rejection, then presents conflict and approved-but-unsure for the demo. Inputs and human references were committed before calls; see [the diagnostic report](diagnostics/deployment-approval/REPORT.md). Receipts 9–12 are copied unchanged into the primary receipt directory for playback.

## Policy v2 and heuristic review ordering

A versioned correction is documented in [the policy-v2 report](diagnostics/deployment-policy-v2/REPORT.md). The complete synthetic permission rule now uses if and only if: designated-owner approval, all tests PASS and no conflicting approval record. Exactly two additional attempts returned approved/unsure and rejected/singleton violation. The original case inputs and outputs were not rewritten.

The default UI now orders the original four release packets for human review using 100 times the sum of raw violation and inconsistent-context scores. These are explicitly heuristic points, not calibrated risk, safety or release permission. Calibrated status and prediction sets remain unchanged. Application-authored next steps identify what a reviewer should request or reconcile; they are not model-generated rationale. The original video-compatible view is available at `?view=original`.

There are fourteen saved application receipts: the original twelve and two policy-v2 results. The parent reports seven additional citation-diagnostic attempts outside this application record, making cumulative usage **21/21**, exhausted. The original main ledger stays 12/12 and the separate v2 ledger is 2/2; the citation count is reported accounting, not invented receipts. The finished video, seven-page PDF and evidence manifest describe the preserved twelve-call baseline at commit 445f1c44a90ff2b91066c512e3912a8247ec1120. No artifacts were silently regenerated.

## Run locally

Requires Node 22 or newer. No dependencies or model downloads.

```sh
npm start
```

Open **http://127.0.0.1:4321**. Set `PORT` to change the port. The server binds to localhost only. Selecting a case loads its exact inputs and any matching saved live receipt; **only pressing Verify sends inference**. Edited inputs clear the previous result. JSON receipts can be inspected and downloaded.

```sh
npm test
```

Tests use mocked model responses and make no external inference calls.

## Integration and authorization

The server posts the owner-supplied no-auth request format to the exact authorized Hugging Face endpoint. It sends three nonempty strings under `inputs.policy`, `inputs.evidence` and `inputs.claim`. The provider enforces the 16,384-token combined limit by rejection. The app never truncates inputs.

The original local build used no keys, credentials, paid services or private client data. The owner subsequently authorized publication, exactly three PHP-case attempts after the original five, and then exactly four predeclared deployment attempts. The total cap is **twelve calls**, all now used. The primary ledger contains all twelve entries; the diagnostic ledger is a historical record of those same attempts and must not be counted again. The limit and reservations are persisted in `receipts/call-ledger.json`; do not reset them or rerun cases to bypass authorization. There are no automatic retries. HTTP 401/402/403 from the provider persistently stops further live calls. A filesystem lock and ledger reload serialize reservations across instances sharing the same receipt directory; a stale lock after a crash blocks new calls pending inspection.

## Historical MFA results — 24 October 2026

| Synthetic case | Human reference | Calibrated status | Raw label | Prediction set |
| --- | --- | --- | --- | --- |
| Small MFA smoke | supported | unsure | supported | All four labels |
| Expired exception | violation | unsure | violation | All four labels |
| Current exception | supported | unsure | insufficient_information | All four labels |
| Missing account records | insufficient_information | unsure | insufficient_information | All four labels |
| Conflicting same-snapshot records | inconsistent_context | **inconsistent_context** | inconsistent_context | Singleton |

The conflicting-records case returned 99.9865% for `inconsistent_context`. The current-exception case did not match its human reference. These are observed outcomes from this small synthetic set, not accuracy claims. Do not present the raw label as the calibrated verdict. All five responses report `model: banyan-sapling` and include source/weights hashes, token usage and model timing; these identifiers are server-reported provenance, not an independent weights audit.

Receipts `receipt-01-*.json` through `receipt-12-*.json` contain exact inputs, complete raw responses, HTTP status and timing. The original smoke curl request and response are preserved; the published smoke headers omit provider-internal routing and request identifiers. `fixtures.json` contains four primary deployment cases and seven historical cases with separate human references. The original `FIXTURE_SPEC.md` retains an unrun scope-distractor idea.

## Historical PHP hosting follow-up

The three additional calls assess **CVE-2026-109618 only**, using dated public source context plus an invented `demo-shop.example` inventory and PHP Info observations. See [PHP_HOSTING_CASES.md](PHP_HOSTING_CASES.md) and `sources/php-hosting.json` for attribution, snapshot dates, the fetched CVE record hash and the exact evidence boundary. They make no claim that a real site is compromised or that PHP is safe against every vulnerability.

| Case | Human reference | Calibrated status | Raw label |
| --- | --- | --- | --- |
| Rollout only | insufficient_information | unsure | insufficient_information |
| Bound backport | supported | unsure | violation |
| Customer VPS | insufficient_information | unsure | violation |

All three returned all four labels in the prediction set. The backport case did not return the expected supported result, and the VPS raw label differed from its human reference. These outputs are retained without tuning or retries; raw violation is not a calibrated violation verdict.

## Scope and design record

`ARCHITECTURE_DECISION.md` records the confirmed integration and architecture before scaffolding. `POLICY_EVIDENCE_CHECK_PROPOSAL.md` preserves the earlier blocked-access preparation brief. The UI shows all submitted source records verbatim; source IDs are input labels, not citations selected by Sapling.

The app intentionally preserves uncertainty. The strongest demonstrated behavior is detecting internally contradictory evidence and refusing to turn uncertain cases into an automatic compliance pass.

## Demo assets and handoff

- `DEMO_SCRIPT.md`: approximately 100 seconds of accurate narration, including the failed human expectation.
- `screenshots/conflicting-desktop.jpg` and `screenshots/conflicting-result.jpg`: actual inconsistent-context receipt, with a singleton prediction set and provenance.
- `screenshots/expired-desktop.jpg`: actual calibrated unsure result despite the raw violation label.
- `VALIDATION.md`: test results, browser observations and the exact viewport limitation.

This app now lives in `sidequests/policy-evidence-check/` inside the team's one hackathon repository. Run the commands above from this directory. Paths in the server are relative to its own file. Preserve `receipts/` and its call ledger. See `MIGRATION.md` for the copy verification, sanitization and publication boundary. Future receipt files and screenshots are ignored until individually reviewed; changes to the already tracked call ledger and reviewed files still need review before committing.
