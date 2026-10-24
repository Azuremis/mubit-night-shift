import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { once } from 'node:events';
import { createApp, validateInputs } from '../../server.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(await readFile(path.join(root, 'predeclared.json'), 'utf8'));
const raw = await readFile(path.join(root, 'fixtures.json'));
if (createHash('sha256').update(raw).digest('hex') !== plan.fixtures_sha256) throw new Error('Frozen inputs changed; refusing calls.');
const fixtures = JSON.parse(raw);
if (fixtures.length !== 2 || new Set(fixtures.map(f => f.policy)).size !== 1 || new Set(fixtures.map(f => f.claim)).size !== 1) throw new Error('Expected the frozen two-case pair.');
for (const f of fixtures) {
  if (plan.reference_answers[f.id] !== f.expected) throw new Error('Reference changed.');
  validateInputs({ inputs: f });
}
const app = await createApp({ root, maxCalls: 2 });
if (app.budget().used !== 0 || app.budget().limit !== 2 || app.budget().accessBlocked) throw new Error('Already attempted or invalid budget; no reruns authorized.');
app.server.listen(0, '127.0.0.1');
await once(app.server, 'listening');
const results = [];
try {
  for (const fixture of fixtures) {
    console.log(`One authorized v2 attempt: ${fixture.id}`);
    const inputs = Object.fromEntries(['policy', 'evidence', 'claim'].map(key => [key, fixture[key]]));
    const http = await fetch(`http://127.0.0.1:${app.server.address().port}/api/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputs, fixtureId: fixture.id }),
    });
    const data = await http.json();
    const output = data.receipt?.response;
    const row = { fixtureId: fixture.id, humanReference: fixture.expected, receiptId: data.receipt?.id,
      diagnosticCallNumber: data.receipt?.callNumber, cumulativeAttempt: plan.prior_cumulative_attempts + (data.receipt?.callNumber || 0),
      outcome: data.receipt?.outcome, httpStatus: data.receipt?.transport?.httpStatus, status: output?.status,
      rawLabel: output?.raw_label, predictionSet: output?.prediction_set, statusProvenance: output?.status_provenance,
      probabilities: output?.probabilities, modelMs: output?.timing_ms?.model, error: data.error || data.receipt?.error };
    results.push(row); console.log(JSON.stringify(row));
    if (!data.receipt || data.budget?.accessBlocked) break;
  }
  const report = { fixturesSha256: plan.fixtures_sha256, results, diagnosticBudget: app.budget(),
    cumulativeBudget: { used: plan.prior_cumulative_attempts + app.budget().used, limit: plan.cumulative_limit },
    modelParametersChanged: false, retries: 0, originalOutputsChanged: false };
  await writeFile(path.join(root, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ diagnosticBudget: report.diagnosticBudget, cumulativeBudget: report.cumulativeBudget }));
} finally { await new Promise(resolve => app.server.close(resolve)); }
