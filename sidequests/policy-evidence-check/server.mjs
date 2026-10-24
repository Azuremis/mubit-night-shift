import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, readdir, writeFile, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const ENDPOINT = 'https://6adbee0669a00298cd4774c9.endpoints.huggingface.cloud';
export const LABELS = ['supported', 'violation', 'insufficient_information', 'inconsistent_context'];
const STATUSES = [...LABELS, 'unsure'];
const MAX_BODY_BYTES = 128 * 1024;
const SOURCE = 'Owner-supplied Banyan Sapling API Quickstart';

async function readJSON(file) { return JSON.parse(await readFile(file, 'utf8')); }
async function atomicJSON(file, value) {
  const temp = `${file}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temp, file);
}

export function validateInputs(body) {
  const values = body?.inputs;
  if (!values || typeof values !== 'object') throw new Error('Provide inputs.policy, inputs.evidence and inputs.claim.');
  const clean = {};
  for (const key of ['policy', 'evidence', 'claim']) {
    if (typeof values[key] !== 'string' || !values[key].trim()) throw new Error(`${key} must be a nonempty string.`);
    clean[key] = values[key];
  }
  if (Object.values(clean).reduce((n, value) => n + value.length, 0) > 48000) {
    throw new Error('Keep combined input under 48,000 characters. The provider also enforces its 16,384-token limit.');
  }
  return { inputs: clean };
}

export function validateResponse(value) {
  if (!value || value.model !== 'banyan-sapling') throw new Error('The response did not identify banyan-sapling.');
  if (!STATUSES.includes(value.status)) throw new Error('Unknown or missing calibrated status.');
  if (!LABELS.includes(value.raw_label)) throw new Error('Unknown or missing raw label.');
  if (!Array.isArray(value.prediction_set) || !value.prediction_set.every(label => LABELS.includes(label))) {
    throw new Error('Invalid prediction set.');
  }
  for (const label of LABELS) {
    const score = value.probabilities?.[label];
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1) {
      throw new Error(`Invalid probability for ${label}.`);
    }
  }
  if (typeof value.timing_ms?.model !== 'number' || !Number.isFinite(value.timing_ms.model) || value.timing_ms.model < 0) {
    throw new Error('Missing or invalid model timing.');
  }
  return value;
}

function sendJSON(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

async function requestJSON(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Request body exceeds 128 KiB.'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('Request body must be valid JSON.'); }
}

export async function createApp({ root = ROOT, fetchImpl = fetch, maxCalls = 7, timeoutMs = 45000 } = {}) {
  const receiptDir = path.join(root, 'receipts');
  await mkdir(receiptDir, { recursive: true });
  const ledgerFile = path.join(receiptDir, 'call-ledger.json');
  let ledger;
  try { ledger = await readJSON(ledgerFile); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    ledger = { limit: maxCalls, calls: [] };
    await atomicJSON(ledgerFile, ledger);
  }
  if (!Array.isArray(ledger.calls)) throw new Error('Invalid call ledger. Refusing to reset inference usage.');
  let inFlight = false;
  let accessBlocked = Boolean(ledger.accessBlocked);
  const budget = () => ({ used: ledger.calls.length, limit: maxCalls, remaining: Math.max(0, maxCalls - ledger.calls.length), inFlight, accessBlocked });
  const allowedOrigin = origin => /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin);

  async function listReceipts() {
    const files = (await readdir(receiptDir)).filter(name => /^receipt-\d{2}-[a-z0-9-]+\.json$/.test(name));
    const values = await Promise.all(files.map(name => readJSON(path.join(receiptDir, name))));
    return values.sort((a, b) => b.callNumber - a.callNumber);
  }

  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'");
    try {
      const host = req.headers.host || '';
      if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host)) return sendJSON(res, 403, { error: 'Use localhost or 127.0.0.1.' });
      const url = new URL(req.url, `http://${host}`);
      if (req.method === 'GET' && url.pathname === '/api/config') {
        return sendJSON(res, 200, { model: 'banyan-sapling', endpointHost: new URL(ENDPOINT).host, budget: budget() });
      }
      if (req.method === 'GET' && url.pathname === '/api/fixtures') {
        return sendJSON(res, 200, await readJSON(path.join(root, 'fixtures.json')));
      }
      if (req.method === 'GET' && url.pathname === '/api/receipts') {
        return sendJSON(res, 200, await listReceipts());
      }
      if (req.method === 'POST' && url.pathname === '/api/verify') {
        const origin = req.headers.origin;
        if (origin && (!allowedOrigin(origin) || new URL(origin).host !== host)) return sendJSON(res, 403, { error: 'Cross-origin verification is disabled.' });
        if (!String(req.headers['content-type'] || '').startsWith('application/json')) return sendJSON(res, 415, { error: 'Use application/json.' });
        if (inFlight) return sendJSON(res, 409, { error: 'A verification is already running.', budget: budget() });
        if (accessBlocked) return sendJSON(res, 403, { error: 'Provider access requires review. Live requests are stopped.', budget: budget() });
        if (ledger.calls.length >= maxCalls) return sendJSON(res, 429, { error: 'The authorized seven-call budget is exhausted.', budget: budget() });
        const body = await requestJSON(req);
        let request;
        try { request = validateInputs(body); }
        catch (error) { return sendJSON(res, 400, { error: error.message }); }
        // Recheck after the asynchronous body read, before reserving the call.
        if (inFlight) return sendJSON(res, 409, { error: 'A verification is already running.', budget: budget() });
        if (ledger.calls.length >= maxCalls) return sendJSON(res, 429, { error: 'The authorized seven-call budget is exhausted.', budget: budget() });
        inFlight = true;
        const callNumber = ledger.calls.length + 1;
        const id = `receipt-${String(callNumber).padStart(2, '0')}-${randomUUID().slice(0, 8)}`;
        const createdAt = new Date().toISOString();
        const receipt = {
          id, callNumber, createdAt,
          fixtureId: typeof body.fixtureId === 'string' ? body.fixtureId.slice(0, 80) : null,
          request,
          provenance: { endpoint: ENDPOINT, source: SOURCE, attempts: 1 },
          outcome: 'pending', response: null,
        };
        const receiptFile = path.join(receiptDir, `${id}.json`);
        const entry = { callNumber, receiptId: id, createdAt, outcome: 'pending' };
        ledger.calls.push(entry);
        try {
          // Persist the reservation before any network call; failed attempts still count.
          await atomicJSON(ledgerFile, ledger);
          await atomicJSON(receiptFile, receipt);
          const started = performance.now();
          try {
            const upstream = await fetchImpl(ENDPOINT, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(request), signal: AbortSignal.timeout(timeoutMs), redirect: 'error',
            });
            const raw = await upstream.text();
            receipt.transport = { httpStatus: upstream.status, durationMs: Math.round(performance.now() - started) };
            try { receipt.response = JSON.parse(raw); }
            catch { receipt.response = { unparsedBody: raw.slice(0, 16000) }; }
            if ([401, 402, 403].includes(upstream.status)) {
              accessBlocked = true;
              ledger.accessBlocked = true;
            }
            if (!upstream.ok) {
              receipt.outcome = 'provider_error';
              receipt.error = `Sapling endpoint returned HTTP ${upstream.status}. No retry was attempted.`;
            } else {
              try { validateResponse(receipt.response); receipt.outcome = 'success'; }
              catch (error) { receipt.outcome = 'invalid_response'; receipt.error = error.message; }
            }
          } catch (error) {
            receipt.outcome = 'transport_error';
            receipt.transport = { httpStatus: null, durationMs: Math.round(performance.now() - started) };
            receipt.error = `${error.name === 'TimeoutError' ? 'Sapling request timed out.' : 'Could not reach the Sapling endpoint.'} No retry was attempted.`;
          }
          receipt.completedAt = new Date().toISOString();
          entry.outcome = receipt.outcome;
          await atomicJSON(receiptFile, receipt);
          await atomicJSON(ledgerFile, ledger);
          return sendJSON(res, receipt.outcome === 'success' ? 200 : 502, { receipt, budget: { ...budget(), inFlight: false } });
        } finally { inFlight = false; }
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return sendJSON(res, 405, { error: 'Method not allowed.' });
      const staticFiles = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
      const target = staticFiles[url.pathname];
      if (!target) return sendJSON(res, 404, { error: 'Not found.' });
      const content = await readFile(path.join(root, 'public', target[0]));
      res.writeHead(200, { 'Content-Type': `${target[1]}; charset=utf-8`, 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (!res.headersSent) sendJSON(res, error.status || 400, { error: error.status === 413 ? error.message : 'The request could not be processed.' });
      else res.end();
      console.error(error.message);
    }
  });
  return { server, budget, listReceipts };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4321);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT.');
  const app = await createApp();
  app.server.listen(port, '127.0.0.1', () => {
    console.log(`Policy Evidence Check: http://127.0.0.1:${port}`);
    console.log(`Sapling call budget: ${app.budget().used}/${app.budget().limit} used. No automatic inference.`);
  });
}
