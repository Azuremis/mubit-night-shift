# Policy Evidence Check — sidequest decision brief

Historical preparation brief; superseded by ARCHITECTURE_DECISION.md after parent authorization and a successful live smoke request. The owner later authorized the shared public repository. Private machine paths and system inventory have been omitted from this published copy. Deadline supplied by parent: 24 October 2026, 09:30 UTC (10:30 BST).

## Product scope

A single screen checks a security compliance claim against a policy and the underlying evidence. The reviewer can inspect the exact submitted policy, claim and source records beside Sapling's raw verification label and returned calibration/uncertainty fields.

The useful semantic task is detecting a scope or expiry exception hidden beneath a reassuring summary. All inputs are synthetic security records. Sapling performs the actual verification. The application may display source records, but must not fabricate a rationale or attribute source selection to a model that returns no explanation.

One happy-path interaction: select a fixture, inspect/edit its text, press Verify, then inspect the real response. No account system, dashboard, uploads, retrieval pipeline or frontier-model fallback.

## Proposed architecture (requires confirmation)

- Local browser UI: plain HTML/CSS/JavaScript, three text areas and a source-record panel; no build step.
- Local Node HTTP server: serves the UI and accepts one same-origin verification request. Node 26 is installed. Its built-in fetch can call the confirmed hosted Sapling route with a bounded timeout.
- Server-only connection configuration: organizer-provided URL and any authorized existing token. Never expose a token to browser JavaScript or capture it in screenshots/logs. Do not create keys, configure service access, incur spend or invoke a model before authorization.
- Integration adapter: preserve the exact provider label, calibration status and uncertainty as returned; retain a bounded, inspectable response. Render unknown or missing fields honestly. Do not relabel responses until the provider's four literal labels and schema are verified.
- Run provenance: identify the confirmed Sapling service/model, timestamp and measured request duration. Display real response fields only. A deterministic fixture loader is input selection, not inference.
- Failure behavior: show unavailable/timeout/error and preserve the inputs. A paused Space, a preset response or a generic Mubit response cannot become a successful Sapling run.

Do not implement a direct browser-to-provider call until CORS and public/no-secret access are documented. The local proxy avoids browser credential exposure and permits a stable application input shape without guessing the provider wire schema.

## Integration contract to resolve before coding

1. A publicly documented or organizer-supplied runnable endpoint explicitly serving Banyan Sapling; supported method/path, authorization and permitted usage/cost.
2. Exact policy/evidence/claim request field names, nesting, serialization, length limits and model/version selection. The application's three text inputs are a design choice, not a verified backend schema.
3. Exact four label strings and their meanings; output nesting and scalar types; calibration-status literals; uncertainty scale and whether probability values are meaningful/calibrated.
4. Synchronous vs job/streaming behavior, error schema, rate limits and expected cold-start latency. If the official Space is used, establish its callable API name and prove live mode.
5. A fresh response to the custom expiry-conflict fixture in FIXTURE_SPEC.md. Record request/response provenance and confirm the server is not returning preset fallback content. Edited input alone does not prove live inference.

Parent-reported official Space evidence: BANYAN_API_URL is required for live H200 inference; without it, client.py returns hardcoded presets/fixed unsure custom inputs under interactive_preset_fallback. The Space was reported PAUSED with 503 responses. Neither its prefilled 97.4 ms value nor a prefilled probability constitutes a run. No backend URL has been disclosed. These facts were relayed by the parent's research worker; this task's direct web/model-card fetches failed.

## Demo plan (90–110 seconds after a live run is possible)

1. 0–15 s: show the security-review use case and synthetic input badge.
2. 15–45 s: open Expired exception. Show the positive summary and the conflicting account/expiry records; submit to Sapling and show its actual raw result and provenance.
3. 45–75 s: change only the exception expiry to 2026-10-31T23:59:59Z; run again and compare actual outcomes. Do not promise a particular model response or a label change.
4. 75–100 s: show Missing evidence and the actual result if time permits; explain how returned uncertainty supports review.
5. Final seconds: show the repository and the real Sapling integration file once created.

Capture screenshots only after real inference, with synthetic inputs and no secrets. The recording must report unexpected/uncertain results honestly. Repository publication and X/LinkedIn/Discord submission remain subject to the user's approval.

## Local inspection evidence

- Suitable isolated build directory was empty at inspection; no repository initialized there.
- No AGENTS.md found at the task directory or its inspected ancestors.
- Node v26.8.1 and standard local development tools were available.
- Default Python lacks torch, transformers, huggingface_hub, gradio_client, numpy, flask, fastapi and uvicorn. No dependencies were installed and no weights were downloaded.
- Direct web opens of the model card/raw README/API failed; sandbox curl could not resolve huggingface.co. No private endpoints, secrets, unrelated repositories or hidden sessions were accessed.

## Decision and blocker

Recommend the small local Node UI/proxy once a real hosted Sapling route is provided and authorized. Do not start a 16 GB laptop weight-download route under this deadline without a separately verified feasible artifact and explicit authorization.

Current blocker: live Sapling access is unverified/unavailable and the exact integration schema is unresolved. Parent architecture confirmation is pending. No scaffolding, deployment, publication or model call has occurred.

Official references (locations supplied by parent; contents not directly retrieved in this task):
- https://huggingface.co/MubitLabs/banyan-sapling
- https://huggingface.co/spaces/MubitLabs/banyan-sapling-demo
