# Validation evidence

## Original endpoint calls

At the original build, five total: one benign smoke plus four synthetic cases. All HTTP 200; all report model banyan-sapling, fallback_used false, generated_tokens 0, and matching source/weights SHA256 values. Exact receipts are under receipts/. No retries or debug calls were made.

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

## Bounded Astra review and fixes

One Astra review inspected commit `480b15552b247790b122209a6289d0fafeb07ae8` without edits or provider calls. It found two substantive defects: independent instances could race the shared ledger, and a request awaiting its body could miss a provider-access stop applied in the meantime.

The server now holds an exclusive receipt-directory lock across ledger reload, reservation, provider request and final persistence. It checks the persisted access stop and limit after reading the body while locked. Exclusive ledger initialization avoids overwriting another instance's new ledger. A lower persisted limit remains binding even if another instance has a higher configured maximum. A crash leaves a lock that blocks further calls pending inspection of the pending receipt; it does not silently resume or reset spending.

Two targeted mocked tests reproduce the cross-instance budget race and slow-upload access-stop race. The final suite passed **10 tests, 0 failures**, including the original eight. No second broad review was run.

## Approved PHP follow-up — exact three attempts

The owner approved one attempt per new PHP fixture after the five original calls, with no tuning or retries. The ledger records this authorization and all original entries; its total cap is eight and all eight attempts are now used. The three additional provider responses were HTTP 200, `model: banyan-sapling`, `fallback_used: false`, `generated_tokens: 0`, and the same source/weights hashes as the original responses.

| Fixture | Receipt | Human reference | Calibrated status | Raw label | Model ms |
| --- | --- | --- | --- | --- | --- |
| PHP rollout only | receipt-06-5eccb84f | insufficient_information | unsure | insufficient_information | 1091.9 |
| PHP bound backport | receipt-07-2b877d47 | supported | unsure | violation | 1099.5 |
| PHP customer VPS | receipt-08-2c178f30 | insufficient_information | unsure | violation | 1094.4 |

All three prediction sets contain all four classes. The backport case did not yield its expected supported result, and the VPS raw label differs from its human reference. These outcomes are preserved without modifying inputs or retrying. A raw violation is not a calibrated violation verdict, and none of the fixtures establishes compromise of a real site.

Scope is **CVE-2026-109618 only**. Attributed public advisory context and the actual fetched CVE hash/minimal factual metadata are in `PHP_HOSTING_CASES.md` and `sources/php-hosting.json`; all asset inventories and runtime observations are invented.

Final checks: all 16 JSON files parsed; all eight ledger entries match saved receipt IDs/outcomes; each PHP request matches its fixture exactly; source backup hashes remain unchanged; server/UI syntax and the text credential/private-path scan pass. The migrated browser loaded all seven cases and the eight-of-eight budget with Verify disabled. Its PHP backport case showed the saved unsure result, secondary raw violation and separately expanded supported human reference. A full-page browser capture was taken at this point. The inspected browser warning/error log was empty. No further provider calls were made for UI checks.


## Deployment-primary integration

Four predeclared deployment attempts brought the authorized total to twelve. Their frozen inputs, human references, returned calibration metadata and results are in diagnostics/deployment-approval/REPORT.md. Explicit rejection returned a calibrated singleton violation; contradictory approvals returned a calibrated singleton inconsistent_context. Approval and missing approval remained unsure with all four labels. The original cases and all failed expectations are retained.

After the parent approved this direction, the four deployment cases became the primary selector, ordered rejection, conflict, approved/human review and missing approval. Seven MFA/PHP cases moved into a clearly labeled collapsed historical section. All twelve original receipt payloads are available in the primary receipt directory; diagnostic receipt copies are byte-identical. The primary ledger preserves all twelve calls and their authorizations, and both default server limit and displayed budget are 12/12 with no remaining attempts.

The ten mocked tests passed again after integration (10 passed, 0 failed), with server/UI syntax checks passing. A data check matched all eleven fixtures to their exact saved receipt inputs and verified all twelve ledger entries and copied diagnostic receipts. Browser smoke verified the default calibrated violation, conflict singleton and approved-but-unsure result; approved raw supported remains secondary and the UI requests human review. The inspected warning/error log was empty. Integration and UI verification made no new provider requests. The app provides review guidance only and has no production deployment control.


## Public documentation and PDF integration review

The finished public documentation was merged with the current root README without changing video or Netlify files. Relative documentation links and all 23 source hashes in submission/docs/evidence-manifest.json were verified. The seven-page submission PDF was rendered and every page visually inspected; layout, tables, page numbering and source labels were legible without clipping or overlap. Extracted text and PDF metadata were reviewed for credentials/private paths; the PDF has no JavaScript, forms or encryption. Its reviewed SHA256 is decc281f5e00f18cb793a6ede8e74cdf1b6ee153adaeeccc364264097b075360.

The public text privacy scan passed. The private draft and QA directories .local/submission-drafts/ and .local/submission-qa/ are covered by the existing .local/ ignore rule. The root README proposal and unfinished video files were not selected for publication. The stable local browser also verified the historical-case dropdown, preserved original contradiction receipt and expanded exact rejection request/response view. No additional provider requests were made.
