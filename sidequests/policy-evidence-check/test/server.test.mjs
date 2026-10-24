import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createApp, ENDPOINT, validateInputs, validateResponse } from '../server.mjs';

const validOutput = {
  model: 'banyan-sapling', status: 'unsure', raw_label: 'supported',
  prediction_set: ['supported', 'violation', 'insufficient_information', 'inconsistent_context'],
  probabilities: { supported: .73, violation: .02, insufficient_information: .24, inconsistent_context: .01 },
  timing_ms: { model: 981.4 }, fallback_used: false,
};
const request = { inputs: { policy: 'All accounts require MFA.', evidence: 'demo-01 has MFA.', claim: 'demo-01 complies.' } };

async function setup(t, options = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'policy-evidence-test-'));
  await mkdir(path.join(root, 'public'));
  await writeFile(path.join(root, 'fixtures.json'), '[]');
  await writeFile(path.join(root, 'public/index.html'), '<!doctype html><title>Test</title>');
  const app = await createApp({ root, ...options });
  app.server.listen(0, '127.0.0.1');
  await once(app.server, 'listening');
  const base = `http://127.0.0.1:${app.server.address().port}`;
  t.after(async () => {
    await new Promise(resolve => app.server.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  const post = body => fetch(`${base}/api/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ...app, root, base, post };
}

test('input validation forwards exactly three nonempty strings without truncation', () => {
  assert.deepEqual(validateInputs({ ...request, fixtureId: 'local', endpoint: 'https://example.invalid' }), request);
  assert.throws(() => validateInputs({ inputs: { ...request.inputs, claim: '   ' } }), /nonempty/);
  assert.throws(() => validateInputs({ inputs: { ...request.inputs, evidence: 'x'.repeat(48001) } }), /48,000/);
});

test('calibrated unsure remains unsure despite a supported raw label', () => {
  assert.equal(validateResponse(validOutput).status, 'unsure');
  assert.equal(validateResponse(validOutput).raw_label, 'supported');
  assert.throws(() => validateResponse({ ...validOutput, model: 'generic-model' }), /banyan-sapling/);
  assert.throws(() => validateResponse({ ...validOutput, probabilities: { ...validOutput.probabilities, supported: NaN } }), /probability/);
  assert.throws(() => validateResponse({ ...validOutput, status: 'looks-good' }), /status/);
});

test('HTTP integration calls exact owner endpoint once and persists request, raw output and budget', async t => {
  const calls = [];
  const app = await setup(t, { maxCalls: 1, fetchImpl: async (...args) => { calls.push(args); return Response.json(validOutput); } });
  const response = await app.post({ ...request, fixtureId: 'unit-demo' });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], ENDPOINT);
  assert.deepEqual(JSON.parse(calls[0][1].body), request);
  assert.deepEqual(calls[0][1].headers, { 'Content-Type': 'application/json' });
  assert.equal(calls[0][1].redirect, 'error');
  assert.equal(data.receipt.response.status, 'unsure');
  assert.deepEqual(data.receipt.response, validOutput);
  assert.equal(data.receipt.provenance.attempts, 1);
  const saved = JSON.parse(await readFile(path.join(app.root, 'receipts', `${data.receipt.id}.json`), 'utf8'));
  assert.deepEqual(saved.request, request);
  assert.equal(saved.outcome, 'success');
  assert.equal((await app.post(request)).status, 429);
  assert.equal(calls.length, 1);
  const restarted = await createApp({ root: app.root, maxCalls: 1, fetchImpl: () => { throw new Error('must not be called'); } });
  assert.equal(restarted.budget().remaining, 0);
  assert.equal((await app.listReceipts()).length, 1);
});

test('invalid inputs and cross-origin requests spend no inference calls', async t => {
  let called = 0;
  const app = await setup(t, { fetchImpl: () => { called++; throw new Error('must not be called'); } });
  assert.equal((await app.post({ inputs: { policy: 'x' } })).status, 400);
  const cross = await fetch(`${app.base}/api/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://unrelated.invalid' }, body: JSON.stringify(request) });
  assert.equal(cross.status, 403);
  const wrongPort = await fetch(`${app.base}/api/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:1' }, body: JSON.stringify(request) });
  assert.equal(wrongPort.status, 403);
  assert.equal(called, 0);
  assert.equal(app.budget().used, 0);
});

test('unexpected auth or payment response stops future calls and persists the stop', async t => {
  let called = 0;
  const app = await setup(t, { fetchImpl: async () => { called++; return Response.json({ error: 'payment required' }, { status: 402 }); } });
  const first = await app.post(request);
  assert.equal(first.status, 502);
  const data = await first.json();
  assert.equal(data.receipt.outcome, 'provider_error');
  assert.equal(data.receipt.transport.httpStatus, 402);
  assert.equal((await app.post(request)).status, 403);
  assert.equal(called, 1);
  const restarted = await createApp({ root: app.root });
  assert.equal(restarted.budget().accessBlocked, true);
});

test('transport failures and invalid provider responses are receipts, never fabricated verdicts', async t => {
  let called = 0;
  const app = await setup(t, { fetchImpl: async () => {
    called++;
    if (called === 1) throw new DOMException('timed out', 'TimeoutError');
    return Response.json({ answer: 'A preset answer' });
  } });
  const first = await (await app.post(request)).json();
  assert.equal(first.receipt.outcome, 'transport_error');
  assert.equal(first.receipt.response, null);
  assert.match(first.receipt.error, /No retry/);
  const second = await (await app.post(request)).json();
  assert.equal(second.receipt.outcome, 'invalid_response');
  assert.equal(second.receipt.response.answer, 'A preset answer');
  assert.equal(called, 2);
  assert.equal(app.budget().used, 2);
});

test('only one in-flight inference is allowed and reservation precedes network access', async t => {
  let finish;
  let entered;
  const enteredPromise = new Promise(resolve => { entered = resolve; });
  const outputPromise = new Promise(resolve => { finish = resolve; });
  const app = await setup(t, { fetchImpl: async () => {
    const ledger = JSON.parse(await readFile(path.join(app.root, 'receipts/call-ledger.json'), 'utf8'));
    assert.equal(ledger.calls.length, 1);
    assert.equal(ledger.calls[0].outcome, 'pending');
    entered();
    return outputPromise;
  } });
  const first = app.post(request);
  await enteredPromise;
  assert.equal((await app.post(request)).status, 409);
  finish(Response.json(validOutput));
  assert.equal((await first).status, 200);
  assert.equal(app.budget().used, 1);
});

test('HTTP boundaries serve only public allowlisted files', async t => {
  const app = await setup(t);
  assert.equal((await fetch(app.base)).status, 200);
  const blocked = await fetch(`${app.base}/receipts/call-ledger.json`);
  assert.equal(blocked.status, 404);
  const method = await fetch(`${app.base}/`, { method: 'DELETE' });
  assert.equal(method.status, 405);
  const response = await fetch(`${app.base}/api/config`);
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal((await response.json()).budget.used, 0);
});
