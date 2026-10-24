# Policy Evidence Check — release-evidence demo

Use the stable local app at http://127.0.0.1:4322 (or port 4321 when starting a fresh server there). This is playback of actual saved Sapling responses, not new live inference. All twelve authorized attempts are used; Verify is disabled. Keep the saved-run badge visible.

## 0–15 seconds: the review problem

“Before a release, someone needs to check that the evidence actually permits it. This demo compares a deployment policy, a permission claim and a synthetic release packet. Banyan Sapling returns the calibrated result; this app keeps the exact request and response beside the record. It does not control deployment.”

## 15–40 seconds: explicit rejection

Open **Explicit rejection**. Show that tests passed but the release approver rejected r-42.

“The claim says this release is permitted. Passing tests do not override the rejection. The actual Sapling response is a calibrated violation with a singleton prediction set. That is a stop condition for the review.”

## 40–65 seconds: conflicting approvals

Select **Conflicting approvals**. Show approval and rejection at the same time, with equal authority and no precedence.

“The packet contains two incompatible approval records. Sapling returned calibrated inconsistent context with a singleton prediction set. Resolve the records before deciding to release.”

## 65–85 seconds: disclose the boundary

Select **Approved · human review**.

“This packet has approval and passing tests, so our predeclared reference was supported. Sapling still returned unsure. The raw supported label is secondary; the app requests human review. This demo shows two calibrated stop conditions, not reliable approval automation.”

## 85–105 seconds: inspect the evidence

Open **Inspect exact request & raw response**. Show the receipt timestamp, model, HTTP status, one attempt, prediction set and provider-reported provenance. Optionally show **Missing approval**, which also remained unsure and had an unexpected raw violation label.

“Four cases used the same policy and claim, with references frozen before the calls. Every response is preserved, including the failures. Earlier MFA and PHP cases remain in Historical examples. The useful boundary here is detecting explicit rejection and conflicting approval evidence while keeping unresolved cases with a reviewer.”

End with the shared repository URL: https://github.com/Azuremis/mubit-night-shift. Social publication and challenge submission remain separate actions.

## Capture notes

- Primary inputs: fixtures.json, first four entries. Historical cases follow.
- Rejected receipt: receipts/receipt-10-57703127.json.
- Conflict receipt: receipts/receipt-12-4b4880cc.json.
- Approved-but-unsure receipt: receipts/receipt-09-7526370d.json.
- Missing-approval receipt: receipts/receipt-11-40fdad1a.json.
- Exact predeclared diagnostic: diagnostics/deployment-approval/.
- Original screenshots show historical MFA/PHP UI; current release-evidence captures are produced by the submission/video worker.
