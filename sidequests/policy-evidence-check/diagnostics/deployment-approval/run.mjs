import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { once } from 'node:events';
import { createApp, validateInputs } from '../../server.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(await readFile(path.join(root, 'predeclared.json'), 'utf8'));
const fixtureBytes = await readFile(path.join(root, 'fixtures.json'));
if (createHash('sha256').update(fixtureBytes).digest('hex') !== plan.fixtures_sha256) throw new Error('Frozen fixture hash changed; refusing calls.');
const fixtures = JSON.parse(fixtureBytes);
if (fixtures.length !== 4 || new Set(fixtures.map(f => f.policy)).size !== 1 || new Set(fixtures.map(f => f.claim)).size !== 1) throw new Error('Expected four cases sharing one policy and claim.');
for (const fixture of fixtures) {
  if (fixture.expected !== plan.reference_answers[fixture.id]) throw new Error('Predeclared reference changed.');
  validateInputs({ inputs: fixture });
}
const app = await createApp({ root, maxCalls: 12 });
if (app.budget().used !== 8 || app.budget().limit !== 12 || app.budget().accessBlocked) throw new Error('Diagnostic already attempted or unexpected budget. No reruns authorized.');
app.server.listen(0, '127.0.0.1');
await once(app.server, 'listening');
const base = `http://127.0.0.1:${app.server.address().port}`;
const results = [];
try {
  for (const fixture of fixtures) {
    console.log(`One predeclared attempt: ${fixture.id}`);
    const inputs = Object.fromEntries(['policy', 'evidence', 'claim'].map(key => [key, fixture[key]]));
    const response = await fetch(`${base}/api/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: fixture.id, inputs }),
    });
    const data = await response.json();
    const output = data.receipt?.response;
    const row = {
      fixtureId: fixture.id, humanReference: fixture.expected,
      receiptId: data.receipt?.id, outcome: data.receipt?.outcome,
      localHttpStatus: response.status, providerHttpStatus: data.receipt?.transport?.httpStatus,
      status: output?.status, rawLabel: output?.raw_label, predictionSet: output?.prediction_set,
      calibrationMetadata: {
        status_provenance: output?.status_provenance,
        conformal_prediction_set: output?.conformal_prediction_set,
        conformal_singleton: output?.conformal_singleton,
        empty_set_policy: output?.empty_set_policy,
        fallback_used: output?.fallback_used,
        fallback_reason: output?.fallback_reason,
      },
      probabilities: output?.probabilities, modelMs: output?.timing_ms?.model,
      error: data.error || data.receipt?.error,
    };
    results.push(row);
    console.log(JSON.stringify(row));
    if (!data.receipt || data.budget?.accessBlocked) break;
  }
  const allUnsure = results.length === 4 && results.every(row => row.status === 'unsure');
  const report = {
    frozenFixturesSha256: plan.fixtures_sha256, results, globalBudget: app.budget(),
    allUnsure, modelParametersChanged: false, additionalAttempts: results.filter(row => row.receiptId).length,
    decision: allUnsure ? 'Stop: all four calibrated statuses are unsure. Do not pivot the main story to deployment approval or force raw labels into verdicts.' : 'Report actual distinctions to the parent for a decision before changing the active UI.',
  };
  await writeFile(path.join(root, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ allUnsure, additionalAttempts: report.additionalAttempts, globalBudget: report.globalBudget, decision: report.decision }));
} finally {
  await new Promise(resolve => app.server.close(resolve));
}
