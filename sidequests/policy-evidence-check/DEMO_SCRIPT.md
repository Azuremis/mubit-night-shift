# Policy Evidence Check — 100-second demo

Use the local app at http://127.0.0.1:4321, or port 4322 if the original build server occupies 4321. The app's saved-live-run label must remain visible when replaying receipts. All eight authorized calls are recorded and the budget is exhausted; replay saved receipts only.

## 0–15 seconds: problem and actual integration

“Security reviews often arrive with a reassuring summary. This app sends the actual policy, claim and source records to Banyan Sapling. These vendor accounts are synthetic. Sapling does the semantic verification; the app preserves its uncertainty and its exact response.”

Show the whole screen and case buttons.

## 15–40 seconds: calibrated inconsistency

Select **Conflicting records**. Show the two authoritative exports at the same snapshot: vendor-06 has MFA true in one and false in the other, with neither source superseding the other.

“The live Sapling response identified inconsistent context with a singleton prediction set. The result is saved with its inputs, timestamp, HTTP status, model timing and the model's reported weights hash.”

Show the saved-live-run label, calibrated status, prediction set and provenance. The returned class probability was approximately 99.9865%; do not describe that as independently established correctness.

## 40–65 seconds: a misleading summary does not become a pass

Select **Expired exception**. Show the 100% summary and EX-204 expiry before the snapshot.

“The raw classifier leans toward violation. But the calibrated status is unsure, so this is a human-review case. The app leads with that status instead of automatically passing or failing the claim.”

## 65–85 seconds: honest limitation

Select **Current exception**, then **Missing records**.

“Changing the expiry alone did not produce the supported result we expected. Missing records also remain unsure. These are the real outputs, not rewritten answers. Sapling supplies labels and scores, not explanations or external source verification.”

## 85–100 seconds: inspectable evidence

Open **Inspect exact request & raw response** on the conflicting-records case.

“Every result can be checked against the exact request and downloaded as JSON. This is an evidence review aid: detect contradictory context, retain uncertainty, and keep the source records beside the decision.”

End on the actual result. The owner has authorized the shared public hackathon repository. Social/Discord submission and rule acceptance remain separate actions.

## Screenshots

The screenshot set is an alternative challenge deliverable to a video, subject to the parent confirming the challenge's final submission format. Captures show the app displaying saved responses from actual endpoint calls; they are not fresh inference at capture time. Use the conflicting-records and expired-exception screenshots together so the uncertainty behavior is visible.

## Optional PHP follow-up

Select the three PHP cases to compare a fleet announcement, an invented asset-bound backport observation and a customer-managed VPS outside the rollout. Scope the narration to CVE-2026-109618. All actual calibrated results are unsure; the backport and VPS raw labels are violation. Explain that the backport case failed its human expectation, and do not turn a missing-proof case or secondary raw label into a claim about a real compromised website. `PHP_HOSTING_CASES.md` records sources and limits.
