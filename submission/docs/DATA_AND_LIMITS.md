# Data handling and limits

## Supported data boundary

The public demonstration contains synthetic release approvals and test records, vendor accounts, exception records and an invented `demo-shop.example` inventory. PHP fixtures combine these invented observations with dated, attributed public advisory context. No real customer site was inspected, and no receipt establishes a real site's vulnerability, compromise or remediation.

Do not enter private account exports, personal data, customer inventories, credentials, session data or confidential policy text into the public demo. A local live request sends all three input strings to the external provider and persists the submitted inputs plus complete response in a local receipt. The app provides no redaction or retention-management interface.

The existing smoke capture omits provider-internal routing/request headers from the published copy. The original migration record documents the reviewed synthetic files and sanitization. See [MIGRATION.md](../../sidequests/policy-evidence-check/MIGRATION.md).

## Recorded responses and public replay

The receipts are records of actual endpoint requests made on 24 October 2026. Replaying them makes no new model request and does not establish that the provider remains reachable. A public site serving these artifacts must disclose replay and retain the original call timestamp. Do not describe a replay capture as fresh inference.

All twelve responses report no fallback and zero generated tokens. Sapling supplies labels, a prediction set and scores in this integration. The app displays source inputs verbatim; source IDs are input labels rather than citations chosen by Sapling. It does not generate an explanation, fetch cited websites during verification or authenticate the source records.

## Model and evaluation limits

Twelve exploratory synthetic cases, including a smoke check, are too few for accuracy, calibration, reliability or performance claims. The release-approval follow-up froze its four inputs and references before execution and used a single shared policy and claim. This is not a held-out evaluation or model benchmark. No fine-tuning took place. Human references are authored expectations, not independently adjudicated ground truth.

Nine calibrated responses are `unsure`. The three singleton responses are an MFA contradiction, explicit release rejection and contradictory release approvals. The approved release remained unsure, so these examples do not establish reliable approval automation or four-class accuracy. The app neither approves nor blocks a real deployment. The raw label and class scores must remain secondary. A large returned score is not an independently established probability that a claim is correct.

The PHP fixtures concern **CVE-2026-109618 only**, using the dated provider guidance cited in their evidence. A later CVE, other PHP branches, configuration mitigations and general PHP safety are outside this fixture policy. Missing evidence establishes an unproven closure claim under the supplied policy, not automatic vulnerability or compromise. The bound-backport human reference depends on the invented asset binding and provider-prescribed serving-runtime observation; it is not an independent binary audit.

## Server limitations

The supplied Node server binds to localhost and includes input limits, allowlisted static paths, origin checks, a persistent attempt ledger and a receipt-directory lock. Those implementation controls and mocked tests are not a server security certification. The app has no production authentication, multi-tenant isolation, durable distributed quota service, privacy impact assessment or external security audit. A filesystem lock only coordinates processes sharing that filesystem.

Any public deployment must document its actual behavior separately. The local runtime design is not evidence that a public service can safely accept arbitrary inputs or expose live inference.

## Repository and publication hygiene

The repository is public at [Azuremis/mubit-night-shift](https://github.com/Azuremis/mubit-night-shift). Keep `.agents`, `.codex`, `.aws`, `.env` files, keys, private research, local session state and unreviewed runtime output out of commits. `.gitignore` does not remove tracked data or history. Review the exact staged paths and diff before committing or pushing.

Only individually reviewed synthetic receipts and screenshots are intended for publication. New runtime outputs require their own data review. Preserve the authorized ledger and do not reset it to obtain more calls. Private social/submission drafts and QA intermediates belong in the ignored `.local/` directory.

Source advisories retain their publisher's terms. This repository does not assert an MIT/Apache license over CVE records, advisory prose, the model or third-party source content. The project stores minimal factual metadata and attributed paraphrases rather than a redistributed advisory corpus.
