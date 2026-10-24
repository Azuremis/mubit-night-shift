# Deployment-approval diagnostic results

Four reference answers and inputs were frozen before requests in commit `ccfccad`, with fixture SHA256 `9b36f1c2df9181aacf670d3743285ee789535b7351d3ff8f896fd0a567e65179`. One identical policy and claim were used across the four synthetic cases. Reference answers were not sent to Sapling. No inputs, model parameters or calibration settings were changed after seeing results.

| Case | Predeclared human reference | Calibrated status | Raw label | Prediction set | Receipt |
| --- | --- | --- | --- | --- | --- |
| Approval plus passing tests | supported | unsure | supported | All four labels | receipt-09-7526370d |
| Explicit rejection | violation | violation | violation | violation only | receipt-10-57703127 |
| Missing approval | insufficient_information | unsure | violation | All four labels | receipt-11-40fdad1a |
| Contradictory approvals | inconsistent_context | inconsistent_context | inconsistent_context | inconsistent_context only | receipt-12-4b4880cc |

All four requests returned HTTP 200, `model: banyan-sapling`, `fallback_used: false` and zero generated tokens. Complete raw responses and exact submitted inputs are preserved in the four receipt files. There were no retries, additional model requests or edits to turn raw labels into calibrated verdicts.

## Interpretation

This is a stronger bounded example than the PHP cases: it demonstrates two distinct calibrated stop conditions, an explicit policy rejection and mutually inconsistent approval records. A candidate problem is reviewing a release evidence packet before deployment and identifying those stop conditions. The app itself does not enforce a deployment gate or deploy anything.

The approved case did not yield a calibrated supported verdict, and missing approval did not yield its expected raw class. Therefore these results do not demonstrate reliable approval automation or four-class accuracy. A defensible demo shows rejected → conflicting → approved-but-unsure, openly retaining human review for the latter. The parent subsequently approved this narrow story and the corresponding primary UI integration; the original results remain unchanged.

## Returned calibration metadata

Rejection and contradiction returned `status_provenance: conformal_singleton`, `conformal_singleton: true` and singleton prediction sets. The approved and missing cases returned `status_provenance: multiple_conformal_labels`, `conformal_singleton: false` and all four labels in both set fields. Each response also reports `empty_set_policy: rounded_argmax`; none of these sets was empty. No calibration threshold or quantile was exposed in these JSON responses. No provider parameters were changed or guessed.

## Budget and scope

The approved expansion was four attempts after the original eight, for a global total of **12/12**, now exhausted. This directory's ledger carries forward the eight earlier entries by reference and holds the four new entries. Do not add the two ledger counts together. At diagnostic completion, the active app's original eight-of-eight ledger, seven fixtures, server and UI were unchanged. After the parent's integration decision, all twelve entries and exact receipt copies became available in the primary UI, with four primary cases and seven historical cases. That integration made no additional provider requests.

Frozen fixture hashing, exact receipt/input matching, ledger counts and a credential/private-path scan passed. All data is synthetic. Other workers' deployment and submission files were not modified. The runner refuses to rerun once any new diagnostic attempt has been reserved.
