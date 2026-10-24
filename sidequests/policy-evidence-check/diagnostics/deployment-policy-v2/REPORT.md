# Policy v2 correction and review-priority update

The two cases and human references were frozen before calls in commit `9ba42e4`. Fixture SHA256: `95f192d7512f85dbbe5b7c2c2a3ea7282e48685fe3d1bae237e08eeb5dc2e808`.

The complete synthetic-world rule now says permission holds **if and only if** designated-owner approval, all required tests PASS and no conflicting approval record are present. It explicitly grants permission when all conditions hold and separately defines rejection, missing evidence and conflicting records. The approved/rejected pair differs only in the designated owner's decision.

| Corrected case | Frozen reference | Actual calibrated status | Raw label | Prediction set | Raw score |
| --- | --- | --- | --- | --- | --- |
| Approved | supported | unsure | supported | All four labels | supported 0.8832464767163353 |
| Rejected | violation | violation | violation only | violation 0.994153949395177 |

Removing the necessary/sufficient ambiguity did not resolve the approved-case uncertainty. No model-bug or reliability claim follows. Both requests returned HTTP 200 without retries or changed model/calibration parameters. Complete inputs and responses remain in this directory's receipts; copies in the primary receipt directory are byte-identical. Local diagnostic calls 1 and 2 correspond to cumulative attempts 20 and 21, as recorded in results.json; the existing twelve primary receipt files are unchanged.

## Cumulative accounting

The parent reported nineteen prior attempts: twelve main and seven in a separate citation diagnostic. This diagnostic used exactly two additional attempts. Cumulative usage is **21/21**, exhausted. Its local ledger is **2/2**, while the original main ledger remains **12/12**. These are separate scopes, not three totals to add together. The seven citation requests are reported accounting and are not fabricated into this directory as receipts.

## Review workflow

The UI now offers a clearly labeled heuristic review order for the four original release packets. Points equal `100 * (raw violation score + raw inconsistent_context score)`, highest first. There is no tuned cutoff, probability-of-harm claim, calibrated-risk estimate or release authority. The calibrated status and prediction set remain unchanged and visually primary. Low priority does not grant permission.

Each release case has an application-authored next step: obtain the missing owner decision, reconcile conflicting records, resolve the rejection, or manually review approval/test evidence. These are workflow prompts, not model-generated explanations or invented source citations. Exact source evidence and raw receipts remain visible.

The original four-case view is retained at `?view=original`, with heuristic ordering and policy-v2 controls hidden. The original fixtures' three submitted strings, their receipts, finished video and seven-page PDF are preserved. The PDF/video document the twelve-call baseline; this additive correction is documented separately. No further inference is authorized.
