# Local API and Sapling contract

This describes the current local `sidequests/policy-evidence-check/server.mjs` interface. The original integration baseline is commit `8889f08d3ed439d040a22b750d46adf4d970862a`; the current fixture set and budget also include four later deployment cases. A public hosting adapter may differ. Use its own verified contract rather than assuming the local write API exists publicly.

## Local routes

| Method and path | Response or behavior |
| --- | --- |
| `GET /api/config` | Model name, endpoint hostname and current budget: `used`, `limit`, `remaining`, `inFlight`, `accessBlocked`. |
| `GET /api/fixtures` | Eleven synthetic fixtures, including separately authored human references: four deployment, four MFA and three PHP cases. The separate smoke check is receipt 01. |
| `GET /api/receipts` | Saved receipt objects, newest call first. |
| `POST /api/verify` | Validate inputs, reserve one attempt, send one upstream request, persist a receipt, return `{receipt, budget}`. The authorized global budget is 12/12 used. |
| `GET` or `HEAD /`, `/app.js`, `/style.css` | Allowlisted UI assets. |

The server checks a localhost Host header. A supplied Origin must be the same localhost origin for verification. It does not provide general cross-origin browser access or authenticated public service infrastructure.

## Verification request

```json
{
  "fixtureId": "optional-local-label",
  "inputs": {
    "policy": "Every active production account must have MFA enabled.",
    "evidence": "Synthetic account demo-01 is active, has production access, and has MFA enabled.",
    "claim": "The synthetic account demo-01 satisfies the MFA policy."
  }
}
```

Use `Content-Type: application/json`. `fixtureId` is receipt metadata and is not forwarded. The local validator forwards exactly the three nonempty string fields under `inputs`. It preserves their content without truncation, rejects a combined length above 48,000 JavaScript string code units, and rejects bodies above 128 KiB. A string containing only whitespace is invalid. The provider's separate 16,384-token combined limit remains authoritative. The app's character check is not a token counter.

## Actual upstream integration

The server uses the exact owner-supplied endpoint:

```text
https://6adbee0669a00298cd4774c9.endpoints.huggingface.cloud
```

It sends one `POST` with `Content-Type: application/json` and the `inputs` object above, without `fixtureId` or an authorization header. It refuses redirects and uses a 45-second timeout by default. The endpoint's future availability and access policy are external to this repository. No inference runs when the application starts.

The real receipts identify `model: "banyan-sapling"` and `release_stage: "research-preview"`. Responses include:

| Field | Meaning in this app |
| --- | --- |
| `status` | Primary calibrated status: one of the four class labels or `unsure`. |
| `prediction_set` | Returned class set. The UI preserves its size and contents. |
| `raw_label` | Secondary classifier label. It does not override `unsure`. |
| `probabilities` | Provider-returned class scores in `[0,1]`. They do not establish correctness. |
| `timing_ms.model` | Provider-reported model time, separate from adapter round-trip time. |
| `status_provenance`, `fallback_used`, `usage` | Provider-reported metadata preserved in the raw response. |
| `source_release_sha256`, `weights_sha256` | Provider-reported identifiers, not an independent audit of the executing model. |

The class labels are `supported`, `violation`, `insufficient_information` and `inconsistent_context`. The response validator checks model identity, known labels, prediction-set members, finite bounded probabilities and nonnegative model timing. It does not independently audit provider calibration, source authenticity or the model weights.

## Receipt and failure behavior

Each local receipt includes `id`, `callNumber`, timestamps, `fixtureId`, the exact `request`, `provenance`, `outcome`, `response` and available transport metadata. A pending receipt and ledger reservation precede the network operation. `outcome: "success"` means a successful HTTP response passed the adapter's schema checks. It does not mean the model supported the claim or matched the human reference.

| HTTP result | Meaning |
| --- | --- |
| `200` on verification | Valid provider response, including calibrated `unsure`. |
| `400` | Invalid input or malformed request. Generic processing errors can also use this code. |
| `403` | Invalid Host/Origin or persistent provider-access stop. |
| `409` | An in-process request or receipt-directory lock already occupies inference. |
| `413` / `415` | Body too large / unsupported content type. |
| `429` | Authorized attempt budget exhausted. |
| `502` with receipt | Provider HTTP error, transport failure or invalid response. Inspect `receipt.outcome` and `error`. |

Provider errors produce `provider_error`, transport failures produce `transport_error`, and schema failures produce `invalid_response`. A timeout or disconnected response can leave uncertainty about upstream execution, so the attempt remains consumed. There are no automatic retries. Error and pending receipts are not model verdicts.
