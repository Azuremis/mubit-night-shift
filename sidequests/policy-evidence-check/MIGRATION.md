# Migration and public-data review — 24 October 2026

The completed event sidequest was copied into `sidequests/policy-evidence-check/` in the owner-selected hackathon repository. All 29 copied files matched their source SHA256 values before the publication edits. The original build directory remains intact as a backup. `MIGRATION_MANIFEST.json` records the original migration snapshot at commit `480b15552b247790b122209a6289d0fafeb07ae8`, before the later approved review fixes and PHP extension; its migrated hashes describe that snapshot rather than subsequent feature changes.

At that initial migration snapshot, the server, UI, tests, synthetic fixtures, five complete model receipts, call ledger and five screenshots retained their original bytes. Documentation used repository-relative run paths and recorded the later publication authorization. The historical proposal omits a private filesystem path and machine inventory. The smoke header copy omits provider routing details and request identifiers; original model responses and inputs remain unchanged.

## Privacy boundary

The root had no Git metadata or remote before setup. Ignore rules were written before initialization or staging. These existing local directories are excluded in full, preserved on disk and not part of the public tree:

- `/model-card-clean/`
- `/research/`

The review located them by filenames and metadata; their session contents were not needed for migration. Local `.agents/`, `.codex/`, `.aws/`, environment files, private keys, credential/secret JSON files, logs, temporary files, dependencies and local runtime outputs are also ignored. The sidequest ignore file permits only the explicitly reviewed existing receipts and screenshots; new files in those directories are ignored by default. Ignore rules do not hide modifications to already tracked files, including the call ledger.

Every sidequest text file was reviewed for credentials, private paths and personal/client/session content. The five screenshots were visually inspected and show only the local application with synthetic records and saved model responses. No keys, client records, vault content or session logs are included. The fixed no-auth model endpoint is intentional application configuration supplied for this event.

## Verification

Use `npm test` from this directory for ten mocked tests: the original eight plus two regression checks for the bounded Astra review findings. Selecting fixtures and viewing saved receipts requires no inference. Migration itself consumed no calls. The owner later approved exactly three PHP attempts after the original five; all eight are now recorded and the budget is exhausted. The original entries were preserved. See `VALIDATION.md` for review fixes and follow-up evidence.

No source files were deleted. No social/Discord submission or rule acceptance was performed.
