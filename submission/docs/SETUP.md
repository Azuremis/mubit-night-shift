# Setup, replay and tests

## Requirements

Use Node.js 22 or newer and npm. The app has no package dependencies, model downloads or build step. The local server uses Node's built-in HTTP and filesystem APIs.

```sh
git clone https://github.com/Azuremis/mubit-night-shift.git
cd mubit-night-shift/sidequests/policy-evidence-check
npm test
npm start
```

Open <http://127.0.0.1:4321>. For an occupied port:

```sh
PORT=4322 npm start
```

Open <http://127.0.0.1:4322>. The server binds to `127.0.0.1`; the supplied server is a local application. A public deployment may use a separate adapter. Do not assume it exposes live inference.

## Replay the saved evidence

The final demo sequence is **explicit rejection, contradictory approvals, then approval with passing tests**. Their actual calibrated results are `violation`, `inconsistent_context` and `unsure`. The first two have singleton prediction sets; the approved case contains all four labels and requires human review. Missing approval also remains unsure, with raw violation.

The exact diagnostic inputs and saved results remain inspectable in [`diagnostics/deployment-approval/`](../../sidequests/policy-evidence-check/diagnostics/deployment-approval/README.md). If an older checkout shows only seven cases, inspect these files directly rather than rerunning inference.

Earlier cases remain useful boundary examples:

1. **Conflicting records**: mutually incompatible MFA states at the same snapshot. The saved result is singleton `inconsistent_context`.
2. **Expired exception**: raw `violation`, calibrated `unsure`.
3. **Current exception**: authored reference `supported`, actual `unsure` with raw `insufficient_information`.
4. PHP cases: all calibrated `unsure`, including raw `violation` for bound backport despite its supported human reference.

Open **Inspect exact request & raw response** or download the JSON receipt. Editing an input clears a mismatched saved result. Restoring exact recorded inputs can restore their matching saved receipt.

Selecting fixtures, restoring exact inputs and inspecting receipts make no new provider calls. The UI labels these results **Saved live run**: they came from actual endpoint calls at the receipt timestamp, not from inference during replay.

## Inference budget

All **twelve globally authorized attempts are used**. The current primary ledger contains all twelve attempts. The diagnostic ledger also carries the original eight forward by reference and adds attempts 9-12. They describe the same global budget, so do not sum their counts. Verify is disabled at the exhausted local budget, and the API rejects additional calls. Do not delete ledgers, clear reservations, raise the cap or rerun fixtures to bypass authorization.

The server reserves attempts before contacting the provider. Failures still count. It uses one attempt per click and no automatic retries. Provider HTTP 401, 402 or 403 sets a persistent access stop. The filesystem lock serializes reservations for processes sharing a receipt directory. A stale lock requires inspection of the related process and pending receipt; do not remove it casually or assume a pending request did not execute.

Any future live inference needs a separately reviewed budget and data scope. The original integration uses the no-auth format supplied by the owner and does not require a key in the browser.

## Tests and verification

```sh
npm test
node --check server.mjs
node --check public/app.js
```

The 24 October 2026 documentation verification reran the existing suite with **10 passed, 0 failed**. All upstream responses in that suite are mocked. The suite checks request forwarding, calibrated-status preservation, receipt persistence, shared reservations, access stops, input boundaries and HTTP file/origin boundaries. A restricted execution environment may fail its localhost integration tests with `listen EPERM`; rerun with permitted localhost sockets. That is an environment restriction, not a new model result.

The tests neither demonstrate model accuracy nor certify server security. See the [validation history](../../sidequests/policy-evidence-check/VALIDATION.md) for browser checks and the actual viewport limitation.

## Rebuild the PDF deck

From the repository root, create a separate Python environment, install the build dependencies, then run:

```sh
python3 -m venv /tmp/policy-deck-venv
/tmp/policy-deck-venv/bin/pip install -r submission/docs/requirements.txt
/tmp/policy-deck-venv/bin/python submission/docs/build-deck.py
```

The script reads the existing fixture/receipt files and produces `submission/output/pdf/policy-evidence-check-submission.pdf`. It makes no model calls. It uses Arial when available and otherwise the PDF base Helvetica family. Poppler's `pdftoppm` can render the PDF for visual review. Recheck every page after changing content.
