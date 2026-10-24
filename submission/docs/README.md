# Policy Evidence Check documentation

> Version note: the original twelve-call record, PDF, video and evidence manifest below are preserved as the baseline at commit 445f1c4. The additive policy-v2 correction and heuristic review workflow are documented in [the v2 report](../../sidequests/policy-evidence-check/diagnostics/deployment-policy-v2/REPORT.md). Two additional application calls bring saved application receipts to fourteen; seven separate citation attempts reported by the parent make cumulative usage 21/21. Calibrated verdicts remain unchanged; raw-score priority is only a human-review heuristic. Use `?view=original` for the original presentation view.

Policy Evidence Check is SamuraiFlow's Sapling Policy Challenge demo in the Mubit hackathon repository. Its main example reviews a release evidence packet for explicit rejection or contradictory approval records. It submits a policy, evidence and claim to the owner-supplied Banyan Sapling endpoint, then preserves the calibrated status alongside its exact inputs and raw response. It does not enforce a deployment gate.

The current evidence consists of **twelve recorded endpoint calls**: nine `unsure`, one `violation` and two `inconsistent_context` results. The four predeclared release cases returned singleton violation for rejection, singleton inconsistent context for contradictory approvals, and unsure for both approval with passing tests and missing approval. These exploratory synthetic cases do not establish accuracy or readiness for automated approval decisions. The project does not fine-tune Sapling.

## Documentation map

- [Setup, replay and tests](SETUP.md)
- [Local API and upstream contract](API.md)
- [Recorded results and provenance](EVIDENCE.md)
- [Data handling, scope and limits](DATA_AND_LIMITS.md)
- [PHP case definitions and attributed sources](../../sidequests/policy-evidence-check/PHP_HOSTING_CASES.md)
- [Original validation record](../../sidequests/policy-evidence-check/VALIDATION.md)

Public repository: [Azuremis/mubit-night-shift](https://github.com/Azuremis/mubit-night-shift).

The submission deck is [available as a PDF](../output/pdf/policy-evidence-check-submission.pdf). Public application and video links will be added only after the responsible workers verify them. The local application remains runnable without those links.

## Result interpretation

Lead with `status` and `prediction_set`. A secondary `raw_label` or a large class probability does not replace the calibrated status. All nine uncertain responses contain every class in the prediction set. Each of the three singleton responses contains only its calibrated class.

Human references belong to the fixture author. They are separate from model output and are not external ground truth. The approved deployment, current MFA exception and PHP bound-backport cases failed to return the expected calibrated supported result. Missing deployment approval and PHP customer-VPS raw labels differ from their human references. Those outcomes remain visible.

## Current submission state

The owner reported that team **SamuraiFlow** was created/joined and rules accepted at 08:22 UTC on 24 October 2026. That report does not establish check-in or final submission completion. The requested final deadline is 09:30 UTC on the same date. Publication of social posts and Discord submission requires the owner's final review and action.
