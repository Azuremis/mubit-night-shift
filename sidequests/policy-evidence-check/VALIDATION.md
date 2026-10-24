# Validation evidence

## Actual endpoint calls

Five total: one benign smoke plus four synthetic cases. All HTTP 200; all report model banyan-sapling, fallback_used false, generated_tokens 0, and matching source/weights SHA256 values. Exact receipts are under receipts/. No retries or debug calls were made.

| Call | Case | Calibrated status | Raw label | Model ms |
| --- | --- | --- | --- | --- |
| 1 | Smoke | unsure | supported | 981.4 |
| 2 | Expired exception | unsure | violation | 1119.0 |
| 3 | Current exception | unsure | insufficient_information | 1116.0 |
| 4 | Missing records | unsure | insufficient_information | 1053.9 |
| 5 | Conflicting records | inconsistent_context | inconsistent_context | 1103.1 |

Only call 5 returned a singleton prediction set. Calls 1–4 returned all four classes. The current-exception case failed the human reference. This set is too small for accuracy claims.

## Automated checks

`node --test test/*.test.mjs`: 8 passed, 0 failed. The tests cover exact outgoing request shape and endpoint, calibrated-status preservation, nonempty/bounded inputs, full response receipts, persisted budget after restart, unexpected payment/auth stops, transport/schema errors without retry, one in-flight request and reservation-before-network, cross-origin rejection and static-file boundaries. All model responses in tests are mocked; no test consumed external inference.

`node --check server.mjs`, `node --check public/app.js` and JSON parsing of all project JSON files passed.

## Browser checks

- The actual local app loaded its fixtures, saved live receipts and five-of-seven budget.
- Case selection showed the matching real receipt and supplied source text, including the singleton inconsistent_context result.
- Editing the claim cleared the previous result and fixture reference instead of showing stale model output.
- The original case restored its saved live receipt without a network inference request.
- Browser console reported no errors or warnings at the inspected point.
- Narrow responsive layout stacked the panels and case cards. Requested viewport width 390; this in-app browser reported an actual CSS viewport width of 582. At that actual width the page width equaled the viewport, with no horizontal overflow. Do not claim a verified 390-pixel viewport from this check.

Screenshots are captured from the original local browser session. At the end of the original build, no public deployment, repository publication, social post, Discord submission or rule acceptance had occurred. The owner subsequently authorized the shared public repository.

## Verification after repository migration — 24 October 2026

- The existing eight tests passed from `sidequests/policy-evidence-check/` (8 passed, 0 failed). The initial sandbox run blocked localhost sockets; the rerun with localhost access passed. All upstream model responses remained mocked.
- Server/UI syntax checks and parsing of all 11 existing JSON files passed. The additional migration manifest is also JSON-validated.
- The migrated server was started on http://127.0.0.1:4322 after test verification. The original source server on port 4321 was left running.
- Browser smoke: the expired case loaded its saved `unsure` receipt; choosing Conflicting records showed the saved singleton `inconsistent_context` receipt; editing the claim cleared that result; choosing Conflicting records again restored it. The inspected browser warning/error log was empty.
- Verify was never pressed. The copied call ledger remains byte-identical to the original: five used of seven total; no additional endpoint calls or paid/model calls were made during migration.
- All 29 source files were hash-matched before publication edits. The source backup remains intact. Server, UI, tests, fixtures, five exact model receipts, ledger and screenshots are unchanged; the manifest records documentation, ignore-rule and smoke-header edits.
- Text credential/private-path scanning and visual review of all five screenshots passed. JPEG metadata contains only a standard JFIF marker, without EXIF/GPS/comment metadata. The smoke header copy removes provider routing/request identifiers.

Privacy exclusions and sanitization are documented in `MIGRATION.md`. Publication checks must confirm that only the reviewed root files and this sidequest appear in the index and history; `.gitignore` alone does not untrack data.
