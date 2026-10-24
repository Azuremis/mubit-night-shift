# Synthetic security verification fixtures

These are proposed application inputs and human review expectations, not Sapling results or provider wire-format examples. Every identity and record is synthetic. Exact provider labels remain to be confirmed.

## Shared policy

At a review snapshot, every active vendor human account with production access must either have enforced MFA or a documented exception. An exception is valid only when it names the account, has an approval by the security owner, and its expiry is strictly later than the review snapshot. A summary percentage is not evidence of individual account compliance. Deleted, disabled or nonproduction accounts are outside this policy's scope.

## A — Expired exception beneath a positive summary

Claim: At the 2026-10-24T07:00:00Z snapshot, all six active vendor human accounts with production access satisfy the MFA policy.

Evidence:

```text
[S1] scope.csv; exported 2026-10-24T07:00:00Z
account,kind,status,access,mfa_enforced,exception_id
vendor-01,human,active,production,true,
vendor-02,human,active,production,true,
vendor-03,human,active,production,true,
vendor-04,human,active,production,true,
vendor-05,human,active,production,true,
vendor-06,human,active,production,false,EX-204

[S2] exceptions.csv; exported 2026-10-24T07:00:00Z
exception_id,account,approved_by,approved_at,expires_at
EX-204,vendor-06,security-owner,2026-10-17T15:00:00Z,2026-10-23T23:59:59Z

[S3] dashboard_summary.txt; generated 2026-10-24T07:00:00Z
Vendor production MFA compliance: 100% (6/6). Status: PASS.
Metric counts approved exceptions without evaluating their expiry.
```

Human expectation: contradicted. vendor-06 is in scope, has no enforced MFA and its exception has expired. S1/S2 establish the conflict; S3 is a misleading aggregate. This explanation is authored fixture ground truth, not a model rationale.

## B — Same records, current approved exception

Use A unchanged except S2 expires_at becomes 2026-10-31T23:59:59Z.

Human expectation: supported. The policy explicitly permits a valid exception. This minimal pair tests policy meaning and time validity without changing the claim, scope or account population. A model that simply counts disabled MFA may fail this case; record its actual result.

## C — Missing evidence

Use A's shared policy and claim. Supply only:

```text
[S1] dashboard_summary.txt; generated 2026-10-24T07:00:00Z
Vendor production MFA compliance: 100% (6/6). Status: PASS.
Underlying account and exception records were not included in this export.
```

Human expectation: insufficient evidence. The policy explicitly disallows accepting a summary percentage as individual-account proof. This fixture should exercise the provider's uncertainty/abstention behavior if its verified label contract supports that interpretation.

## D — Scope distractor

Use B and append the following row to S1:

```text
vendor-07,human,disabled,production,false,
```

Keep the claim about the six active accounts unchanged.

Human expectation: supported. The disabled seventh account is outside policy scope. This tests semantic scope rather than a naive count of false values.

## Demo discipline

- Fixture expectations are shown separately from actual model output.
- Source IDs S1/S2/S3 label the supplied records; the application may show all sources. It must not invent model-generated citations or highlighted rationale.
- Do not claim probability means confidence, risk or correctness until the actual schema and calibration semantics are established.
- Save fresh request/response evidence only after authorized live inference. Never present prefilled Space output or local ground truth as inference.
