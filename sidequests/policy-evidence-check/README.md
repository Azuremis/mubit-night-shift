# Policy Evidence Check

A local security-review demo using **actual Banyan Sapling inference**. It checks a policy, a claim and synthetic source records, then displays the calibrated status, prediction set, secondary raw label and class scores. Every run has an inspectable JSON receipt.

The semantic task: distinguish policy exceptions, missing proof, contradictory records and vulnerability-specific hosting remediation evidence. Seven fixtures include the four original MFA cases and three PHP cases with invented website records and dated public advisories. Sapling returns labels and scores; this app does not generate explanations or independently verify source authenticity.

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

The original local build used no keys, credentials, paid services or private client data. The owner subsequently authorized publication and exactly three additional PHP-case attempts after the five original calls. The updated total cap is **eight calls**, all now used. The limit and attempt reservations are persisted in `receipts/call-ledger.json`; do not reset them or rerun cases to bypass authorization. There are no automatic retries. HTTP 401/402/403 from the provider persistently stops further live calls. A filesystem lock and ledger reload serialize reservations across instances sharing the same receipt directory; a stale lock after a crash blocks new calls pending inspection.

## Actual live results — 24 October 2026

| Synthetic case | Human reference | Calibrated status | Raw label | Prediction set |
| --- | --- | --- | --- | --- |
| Small MFA smoke | supported | unsure | supported | All four labels |
| Expired exception | violation | unsure | violation | All four labels |
| Current exception | supported | unsure | insufficient_information | All four labels |
| Missing account records | insufficient_information | unsure | insufficient_information | All four labels |
| Conflicting same-snapshot records | inconsistent_context | **inconsistent_context** | inconsistent_context | Singleton |

The conflicting-records case returned 99.9865% for `inconsistent_context`. The current-exception case did not match its human reference. These are observed outcomes from this small synthetic set, not accuracy claims. Do not present the raw label as the calibrated verdict. All five responses report `model: banyan-sapling` and include source/weights hashes, token usage and model timing; these identifiers are server-reported provenance, not an independent weights audit.

Receipts `receipt-01-*.json` through `receipt-08-*.json` contain exact inputs, complete raw responses, HTTP status and timing. The original smoke curl request and response are preserved; the published smoke headers omit provider-internal routing and request identifiers. `fixtures.json` contains seven cases and separate human references. The original `FIXTURE_SPEC.md` retains an unrun scope-distractor idea.

## PHP hosting follow-up

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
