# Predeclared deployment-approval applicability diagnostic

Four simple synthetic cases share one policy and claim. Their human reference answers in fixtures.json and predeclared.json were written before any diagnostic call. The fixture SHA256 freezes the inputs before execution. Human references are not sent to the model.

| Case | Predeclared human reference |
| --- | --- |
| Approval plus passing tests | supported |
| Explicit rejection | violation |
| Missing approval | insufficient_information |
| Contradictory equally authoritative approvals | inconsistent_context |

Run exactly once per case against the same owner-supplied no-auth Sapling endpoint. Maximum four additional attempts, no retries, no tuning or calibration changes. The global authorization expands from eight recorded attempts to twelve. This directory holds new receipts 9–12 and a ledger referencing the original eight; the active app and its original exhausted ledger remain unchanged.

A story pivot requires meaningful actual classification. The original conflicting-records success alone is not proof of general usefulness. If all four calibrated responses are unsure, stop and inspect returned calibration metadata without overriding the verdict.

## Completed run

Exactly four requests completed with HTTP 200. Explicit rejection returned calibrated `violation` with a singleton set; contradictory approvals returned calibrated `inconsistent_context` with a singleton set. Approval plus passing tests and missing approval both remained `unsure` with all four labels. See `REPORT.md`, `results.json` and receipts 9–12. The global twelve-call limit is exhausted. The active UI remains unchanged pending the parent's story decision.
