# Migration and public-data review — 24 October 2026

The completed event sidequest was copied into `sidequests/policy-evidence-check/` in the owner-selected hackathon repository. All 29 copied files matched their source SHA256 values before the publication edits. The original build directory remains intact as a backup. `MIGRATION_MANIFEST.json` records source and migrated checksums and identifies changed copies.

The server, UI, tests, synthetic fixtures, five complete model receipts, call ledger and five screenshots retain their original bytes. Documentation now uses repository-relative run paths and records the later publication authorization. The historical proposal omits a private filesystem path and machine inventory. The smoke header copy omits provider routing details and request identifiers; model responses and inputs are unchanged.

## Privacy boundary

The root had no Git metadata or remote before setup. Ignore rules were written before initialization or staging. These existing local directories are excluded in full, preserved on disk and not part of the public tree:

- `/model-card-clean/`
- `/research/`

The review located them by filenames and metadata; their session contents were not needed for migration. Local `.agents/`, `.codex/`, `.aws/`, environment files, private keys, credential/secret JSON files, logs, temporary files, dependencies and local runtime outputs are also ignored. The sidequest ignore file permits only the explicitly reviewed existing receipts and screenshots; new files in those directories are ignored by default. Ignore rules do not hide modifications to already tracked files, including the call ledger.

Every sidequest text file was reviewed for credentials, private paths and personal/client/session content. The five screenshots were visually inspected and show only the local application with synthetic records and saved model responses. No keys, client records, vault content or session logs are included. The fixed no-auth model endpoint is intentional application configuration supplied for this event.

## Verification

Use `npm test` from this directory for the existing eight mocked tests. Selecting fixtures and viewing saved receipts requires no inference. Preserve the five-used, seven-total ledger; migration must not reset it or consume the remaining debugging calls. See `VALIDATION.md` for the verification completed after migration.

No source files were deleted. No social/Discord submission or rule acceptance was performed.
