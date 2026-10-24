# Recorded results and provenance

> Version note: the original twelve-call record, PDF, video and evidence manifest below are preserved as the baseline at commit 445f1c4. The additive policy-v2 correction and heuristic review workflow are documented in [the v2 report](../../sidequests/policy-evidence-check/diagnostics/deployment-policy-v2/REPORT.md). Two additional application calls bring saved application receipts to fourteen; seven separate citation attempts reported by the parent make cumulative usage 21/21. Calibrated verdicts remain unchanged; raw-score priority is only a human-review heuristic. Use `?view=original` for the original presentation view.

Snapshot: 24 October 2026. Core application baseline: [`8889f08`](https://github.com/Azuremis/mubit-night-shift/commit/8889f08d3ed439d040a22b750d46adf4d970862a).

**Twelve actual endpoint calls returned nine calibrated `unsure` results, one `violation` and two `inconsistent_context` results.** The initial eight comprise a smoke call, four MFA cases and three PHP cases. Four predeclared deployment-approval cases followed under a separately authorized extension. No tuning, automatic retry or fine-tuning took place.

## Complete recorded outcomes

| Call and receipt | Synthetic case | Human reference | Calibrated status | Raw label | Set size | Model ms |
| --- | --- | --- | --- | --- | ---: | ---: |
| [01](../../sidequests/policy-evidence-check/receipts/receipt-01-smoke.json) | Small MFA smoke | `supported` | `unsure` | `supported` | 4 | 981.4 |
| [02](../../sidequests/policy-evidence-check/receipts/receipt-02-4a771ae5.json) | Expired exception | `violation` | `unsure` | `violation` | 4 | 1119.0 |
| [03](../../sidequests/policy-evidence-check/receipts/receipt-03-84eb50e0.json) | Current exception | `supported` | `unsure` | `insufficient_information` | 4 | 1116.0 |
| [04](../../sidequests/policy-evidence-check/receipts/receipt-04-dc9da390.json) | Missing records | `insufficient_information` | `unsure` | `insufficient_information` | 4 | 1053.9 |
| [05](../../sidequests/policy-evidence-check/receipts/receipt-05-8da8abe2.json) | Conflicting records | `inconsistent_context` | `inconsistent_context` | `inconsistent_context` | 1 | 1103.1 |
| [06](../../sidequests/policy-evidence-check/receipts/receipt-06-5eccb84f.json) | PHP: Rollout only | `insufficient_information` | `unsure` | `insufficient_information` | 4 | 1091.9 |
| [07](../../sidequests/policy-evidence-check/receipts/receipt-07-2b877d47.json) | PHP: Bound backport | `supported` | `unsure` | `violation` | 4 | 1099.5 |
| [08](../../sidequests/policy-evidence-check/receipts/receipt-08-2c178f30.json) | PHP: Customer VPS | `insufficient_information` | `unsure` | `violation` | 4 | 1094.4 |
| [09](../../sidequests/policy-evidence-check/diagnostics/deployment-approval/receipts/receipt-09-7526370d.json) | Approval and passing tests | `supported` | `unsure` | `supported` | 4 | 1033.0 |
| [10](../../sidequests/policy-evidence-check/diagnostics/deployment-approval/receipts/receipt-10-57703127.json) | Explicit rejection | `violation` | `violation` | `violation` | 1 | 1028.9 |
| [11](../../sidequests/policy-evidence-check/diagnostics/deployment-approval/receipts/receipt-11-40fdad1a.json) | Missing approval | `insufficient_information` | `unsure` | `violation` | 4 | 1023.5 |
| [12](../../sidequests/policy-evidence-check/diagnostics/deployment-approval/receipts/receipt-12-4b4880cc.json) | Contradictory approvals | `inconsistent_context` | `inconsistent_context` | `inconsistent_context` | 1 | 1038.6 |

The four classes are `supported`, `violation`, `insufficient_information` and `inconsistent_context`. Every set of size four contains all four labels. Each singleton set contains its calibrated label. Human references are fixture-author expectations and are separate from model output.

The current MFA exception did not return its expected supported result. The PHP bound-backport also failed to return supported, and the PHP customer-VPS raw label differed from its insufficient-information reference. A raw violation is not a calibrated violation verdict.

## What the receipts establish

- All twelve attempts returned HTTP 200 and passed the local response schema. Receipt `outcome: success` describes transport/schema success rather than agreement with the human reference.
- All twelve responses identify `banyan-sapling` in research preview, report `fallback_used: false`, and report zero generated tokens.
- The conflicting-records response returned an inconsistent-context class score of **99.9865%** and a singleton prediction set. This is a returned model score, not measured accuracy or independent proof of correctness.
- The deployment follow-up returned singleton violation for explicit rejection and singleton inconsistent_context for contradictory approvals. Approval plus passing tests stayed unsure with raw supported. Missing approval stayed unsure with raw violation. This does not establish reliable approval automation, and the app does not enforce a deployment gate.
- Provider-reported model timing spans **981.4 to 1119.0 ms** across these twelve calls. This is an observed range rather than a performance benchmark or service guarantee.
- Selecting a fixture or replaying a receipt makes no provider call. The recorded timestamps identify when the original request ran.

All twelve provider responses report the same identifiers:

```text
source_release_sha256: 245970b0e5b0b22d64c1434ee21dd221b1f211f06bda5465f8fc108f70cd5c3f
weights_sha256:        103a67f7a112589346c3e1090f5bca182d7fdafee85dfd43e67ac5d75eb04dd4
```

These hashes are provider assertions retained for provenance. The application did not independently inspect the executing weights or verify the source records.

## Input and source provenance

The current `fixtures.json` contains eleven synthetic cases after the four deployment fixtures joined the original seven. The separate smoke input is retained in receipt 01 and its original request file. Deployment fixtures and references were frozen before execution in `diagnostics/deployment-approval/predeclared.json`, with fixture SHA256 `9b36f1c2df9181aacf670d3743285ee789535b7351d3ff8f896fd0a567e65179`. Human references were not sent to the model. Every case receipt exactly matches its fixture policy, evidence and claim. Source IDs such as `[S1]` label submitted input text; they are not model-selected citations.

The PHP source snapshot is recorded in [`sources/php-hosting.json`](../../sidequests/policy-evidence-check/sources/php-hosting.json), including retrieval time and the SHA256 of the fetched CVE record. The [PHP case guide](../../sidequests/policy-evidence-check/PHP_HOSTING_CASES.md) links the dated provider entry and PHP CNA record. All site observations and inventories remain invented, and the fixture scope is CVE-2026-109618 only.

## Reproducibility boundary

The global authorized budget is twelve used attempts against a twelve-attempt limit. The current primary ledger contains all twelve. The diagnostic ledger carries the original eight entries forward by reference and adds the same four follow-ups, so do not add ledger counts together. Replaying the files is reproducible without new inference. A fresh response from a later provider run would be a new observation and could differ; it requires its own authorization and must not overwrite the old evidence.

The documentation verification reran the existing mocked server suite: **10 passed, 0 failed**, with localhost access permitted. No new provider calls were used. The original [validation record](../../sidequests/policy-evidence-check/VALIDATION.md) contains browser observations and the narrow-viewport limitation.

This evidence does not establish general accuracy, calibrated coverage, security certification, automatic alert closure, compromise of a real site or production readiness.
