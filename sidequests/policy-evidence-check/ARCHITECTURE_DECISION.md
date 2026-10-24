# Accepted local sidebuild architecture — 2026-10-24

Historical build decision: parent authorized implementation after the owner supplied a no-auth Sapling endpoint and exact request shape. The smoke request succeeded with HTTP 200; its receipt is in receipts/00-smoke.*. The owner subsequently authorized publication of this reviewed sidequest in the shared hackathon repository; the original scope below records the earlier build authorization.

## Scope and route

Build Policy Evidence Check as one local screen using static HTML/CSS/JS plus a Node 26 standard-library server. It compares synthetic policy, claim and source records through the exact owner-supplied HTTPS endpoint. No package installation or model download is needed. No public deployment/publication/submission is authorized.

POST the exact body `{ "inputs": { "policy": "...", "evidence": "...", "claim": "..." } }`. No auth headers or keys. Three nonempty strings; provider limit 16,384 combined tokens, rejected rather than truncated. The server preserves provider errors and never retries automatically.

## Model semantics and evidence

The four raw classes are supported, violation, insufficient_information and inconsistent_context. The calibrated status may also be unsure. Display status first, then raw_label, prediction_set, probabilities and timing_ms.model. These are labels/scores, not explanations or independently verified sources. Display supplied source records without attributing source selection or rationale to Sapling.

Smoke response: status unsure, raw_label supported, four-label prediction_set, fallback_used false, model banyan-sapling, usage.input_tokens 92, usage.generated_tokens 0, timing_ms.model 981.3946889989893. Preserve model/weights SHA256 as server-reported provenance. Do not treat raw argmax as the calibrated verdict.

## Implementation boundaries

- Bind the server to localhost. Expose same-origin fixture, verification and receipt APIs.
- Keep the endpoint fixed server-side; accept no arbitrary URLs from browser inputs.
- Save each exact input and raw response, HTTP status, timestamps, measured duration and outcome as JSON receipts. Show saved runs with a clear saved-run label.
- Persist the seven-call authorization budget before each outbound attempt; the completed smoke counts as call one. Four fixture calls are planned. At most two remaining calls are reserved for necessary debugging; no automatic polling or hidden retries.
- Permit one in-flight request; validate nonempty inputs and bounded body size. Treat transport failures, provider errors and schema mismatches as errors, never fixture/model answers.
- Test request shape, calibrated-status handling, receipts, budget/error behavior and HTTP boundaries with a local mock. Exercise the actual UI using saved live receipts without consuming extra model calls.

The four live fixture calls will cover an expired exception, its corrected-expiry pair, absent account evidence and contradictory same-snapshot source records. Human expectations remain separate from observed results. Any unexpected output is reported honestly.
