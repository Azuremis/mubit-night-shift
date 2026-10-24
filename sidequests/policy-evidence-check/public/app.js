const $ = selector => document.querySelector(selector);
const fields = ['policy', 'evidence', 'claim'];
const labels = ['supported', 'violation', 'insufficient_information', 'inconsistent_context'];
const names = { supported: 'Supported', violation: 'Violation', insufficient_information: 'Insufficient information', inconsistent_context: 'Inconsistent context', unsure: 'Unsure' };
const state = { fixtures: [], receipts: [], config: null, selected: null, busy: false, shownReceipt: null };
const originalView = new URLSearchParams(location.search).get('view') === 'original';

function reviewPriority(output) {
  const a = output?.probabilities?.violation;
  const b = output?.probabilities?.inconsistent_context;
  return Number.isFinite(a) && Number.isFinite(b) ? 100 * (a + b) : null;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function inputs() { return Object.fromEntries(fields.map(field => [field, $(`#${field}`).value])); }
function sameInputs(a, b) { return fields.every(field => a?.[field] === b?.[field]); }
function utcTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Timestamp unavailable' : date.toISOString().replace('T', ' · ').replace(/\.\d{3}Z$/, ' UTC');
}
async function api(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok && !body.receipt) throw new Error(body.error || `Local service returned HTTP ${response.status}.`);
  return body;
}
function setBudget(budget) {
  if (budget) state.config.budget = budget;
  const b = state.config.budget;
  const cumulative = state.fixtures.find(f => f.cumulativeBudget)?.cumulativeBudget;
  $('#budget-label').textContent = cumulative && !originalView
    ? `Global experiments · ${cumulative.used}/${cumulative.limit} attempts used · Main ledger ${b.used}/${b.limit}`
    : `Local session · ${b.used}/${b.limit} authorized calls used`;
  $('#verify-button').disabled = state.busy || b.remaining === 0 || b.accessBlocked;
  $('#request-note').textContent = b.accessBlocked ? 'Live requests stopped: provider access requires review.' : b.remaining === 0 ? 'Session budget reached. Saved receipts remain available.' : 'Each click sends one request. No automatic retries.';
}
function showEmpty(message = 'Select a case and run Sapling, or inspect a saved live receipt when available.') {
  state.shownReceipt = null;
  $('#run-badge').textContent = 'READY';
  const wrap = el('div', 'empty-state');
  wrap.append(el('div', 'empty-icon', '⌁'), el('h3', '', 'Ready to check the evidence.'), el('p', '', message));
  $('#result-content').replaceChildren(wrap);
}
function updateSources() {
  const value = $('#evidence').value;
  const sections = value.split(/\n\s*\n(?=\[S\d+\])/).filter(text => text.trim());
  $('#source-count').textContent = `${sections.length} source${sections.length === 1 ? '' : 's'}`;
  $('#input-size').textContent = `${Object.values(inputs()).reduce((n, text) => n + text.length, 0).toLocaleString()} characters`;
  $('#source-cards').replaceChildren(...sections.map((text, index) => {
    const card = el('article', 'source-card');
    const lines = text.split('\n');
    card.append(el('h3', '', /^\[S\d+\]/.test(lines[0]) ? lines.shift() : `Source ${index + 1}`), el('pre', '', lines.join('\n')));
    return card;
  }));
}
function chooseFixture(fixture) {
  if (state.busy) return;
  state.selected = fixture;
  for (const field of fields) $(`#${field}`).value = fixture[field];
  for (const button of document.querySelectorAll('.fixture-button')) {
    const active = button.dataset.id === fixture.id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  $('#human-note').textContent = `Human expectation: ${names[fixture.expected]}. ${fixture.humanNote}`;
  $('.human-reference').open = false;
  updateSources();
  const receipt = state.receipts.find(item => sameInputs(item.request?.inputs, inputs()));
  if (receipt) renderReceipt(receipt, true);
  else showEmpty();
}
function appendProvenance(container, label, value) {
  const dl = el('dl', 'provenance-item');
  dl.append(el('dt', '', label), el('dd', '', value));
  container.append(dl);
}
function downloadReceipt(receipt) {
  const objectURL = URL.createObjectURL(new Blob([JSON.stringify(receipt, null, 2) + '\n'], { type: 'application/json' }));
  const link = el('a');
  link.href = objectURL;
  link.download = `${receipt.id}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
}
function rawReceiptDetails(receipt) {
  const detail = el('details', 'raw-receipt');
  detail.append(el('summary', '', 'Inspect exact request & raw response'), el('pre', '', JSON.stringify(receipt, null, 2)));
  return detail;
}
function renderReceipt(receipt, saved) {
  state.shownReceipt = receipt;
  $('#run-badge').textContent = saved ? 'SAVED LIVE RUN' : 'LIVE RESPONSE';
  const wrap = el('div');
  wrap.append(el('p', 'receipt-time', `${saved ? 'Saved live receipt' : 'Completed request'} · ${utcTime(receipt.completedAt || receipt.createdAt)}`));
  if (receipt.outcome !== 'success') {
    const box = el('div', 'error-state');
    box.append(el('h3', '', receipt.outcome === 'pending' ? 'Request outcome pending' : 'Verification unavailable'), el('p', '', receipt.error || 'No completed response is available. This is not a model verdict.'));
    wrap.append(box, rawReceiptDetails(receipt));
    $('#result-content').replaceChildren(wrap);
    return;
  }
  const output = receipt.response;
  const statusBox = el('div', `status-box ${output.status}`);
  statusBox.append(el('div', 'status-caption', 'CALIBRATED STATUS'));
  const line = el('div', 'status-line');
  line.append(el('span', 'status-symbol', output.status === 'unsure' ? '?' : output.status === 'supported' ? '✓' : '!'), el('h3', '', names[output.status] || output.status));
  statusBox.append(line);
  const message = output.status === 'unsure'
    ? 'Sapling did not return a single calibrated verdict. Keep this case in human review; the raw label below is secondary.'
    : `Sapling returned ${output.prediction_set.length === 1 ? 'a singleton' : 'this'} prediction set. Review the supplied records alongside the result.`;
  statusBox.append(el('p', 'status-message', message), el('div', 'prediction-title', `Prediction set · ${output.prediction_set.length} ${output.prediction_set.length === 1 ? 'label' : 'labels'}`));
  const set = el('div', 'prediction-set');
  for (const label of output.prediction_set) set.append(el('span', 'prediction-chip', names[label] || label));
  if (output.prediction_set.length === 0) set.append(el('span', 'prediction-chip', 'Empty set'));
  statusBox.append(set);
  wrap.append(statusBox);
  if (state.selected?.category === 'deployment') {
    const guidance = (!originalView && state.selected.reviewNextStep) || (output.status === 'violation'
      ? 'Stop this release review and examine the explicit rejection in the supplied record.'
      : output.status === 'inconsistent_context'
        ? 'Resolve the conflicting approval records before deciding whether to release.'
        : 'Request human review. This result does not establish permission to deploy.');
    if (!originalView) {
      const priority = reviewPriority(output);
      wrap.append(el('p', 'review-priority', `Review priority · heuristic: ${priority === null ? 'unavailable' : priority.toFixed(1) + ' points'}. Raw violation + inconsistent-context scores; not calibrated risk, safety or permission.`));
    }
    wrap.append(el('p', 'review-guidance', `Review guidance: ${guidance} This app does not control deployment.`));
  }
  const rawLine = el('div', 'raw-line');
  rawLine.append(el('span', '', 'Raw label · secondary'), el('strong', '', names[output.raw_label] || output.raw_label));
  wrap.append(rawLine);
  const heading = el('div', 'score-heading');
  heading.append(el('span', '', 'Returned class probabilities'), el('span', '', '0–100%'));
  wrap.append(heading);
  for (const label of labels) {
    const row = el('div', `score-row${label === output.raw_label ? ' raw-score' : ''}`);
    const score = output.probabilities[label];
    const track = el('div', 'score-track');
    track.setAttribute('aria-hidden', 'true');
    const fill = el('div', 'score-fill');
    fill.style.setProperty('--score', String(score));
    track.append(fill);
    row.append(el('span', 'score-label', names[label]), track, el('span', 'score-value', `${(score * 100).toFixed(score > .999 ? 3 : 1)}%`));
    wrap.append(row);
  }
  wrap.append(el('p', 'score-note', 'Class probabilities are returned model scores. They do not replace the calibrated status or establish that a claim is correct.'));
  const provenance = el('div', 'provenance');
  provenance.append(el('p', 'provenance-heading', 'RUN PROVENANCE'));
  const grid = el('div', 'provenance-grid');
  appendProvenance(grid, 'Model (server-reported)', output.model);
  appendProvenance(grid, 'Model inference', `${output.timing_ms.model.toFixed(1)} ms`);
  appendProvenance(grid, 'Round trip', `${receipt.transport?.durationMs ?? '—'} ms`);
  appendProvenance(grid, 'HTTP / attempts', `${receipt.transport?.httpStatus ?? '—'} / ${receipt.provenance?.attempts ?? '—'}`);
  appendProvenance(grid, 'Status provenance', output.status_provenance || 'Not supplied');
  appendProvenance(grid, 'Fallback used (provider)', output.fallback_used === undefined ? 'Not supplied' : String(output.fallback_used));
  appendProvenance(grid, 'Input / generated tokens', `${output.usage?.input_tokens ?? '—'} / ${output.usage?.generated_tokens ?? '—'}`);
  appendProvenance(grid, 'Weights SHA256 (prefix)', output.weights_sha256 ? `${output.weights_sha256.slice(0, 16)}…` : 'Not supplied');
  provenance.append(grid);
  wrap.append(provenance);
  const actions = el('div', 'receipt-actions');
  const download = el('button', 'secondary-button', 'Download JSON receipt ↓');
  download.type = 'button';
  download.addEventListener('click', () => downloadReceipt(receipt));
  actions.append(download);
  wrap.append(actions, rawReceiptDetails(receipt));
  $('#result-content').replaceChildren(wrap);
}
function setBusy(busy) {
  state.busy = busy;
  for (const node of document.querySelectorAll('textarea, .fixture-button')) node.disabled = busy;
  const button = $('#verify-button');
  button.replaceChildren(document.createTextNode(busy ? 'Verifying with Sapling…' : 'Verify with Sapling '), el('span', '', busy ? '…' : '↗'));
  setBudget();
}

$('#verify-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (state.busy) return;
  $('#app-error').hidden = true;
  const request = { inputs: inputs(), fixtureId: state.selected && sameInputs(inputs(), state.selected) ? state.selected.id : 'custom' };
  setBusy(true);
  $('#run-badge').textContent = 'REQUEST IN FLIGHT';
  const loading = el('div', 'empty-state');
  loading.append(el('div', 'loading-ring'), el('h3', '', 'Applying the policy…'), el('p', '', 'One request to the owner-supplied Sapling endpoint.'));
  $('#result-content').replaceChildren(loading);
  try {
    const data = await api('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
    setBudget(data.budget);
    state.receipts.unshift(data.receipt);
    renderReceipt(data.receipt, false);
  } catch (error) {
    showEmpty('The request did not complete through the local service. Check its status before trying again; no automatic retry was made.');
    $('#app-error').textContent = error.message;
    $('#app-error').hidden = false;
    try { state.config = await api('/api/config'); } catch { /* Preserve the displayed failure. */ }
  } finally { setBusy(false); }
});

for (const field of fields) {
  $(`#${field}`).addEventListener('input', () => {
    updateSources();
    const exact = state.selected && sameInputs(inputs(), state.selected);
    for (const button of document.querySelectorAll('.fixture-button')) {
      const active = exact && button.dataset.id === state.selected.id;
      button.classList.toggle('active', Boolean(active));
      button.setAttribute('aria-pressed', String(Boolean(active)));
    }
    $('#human-note').textContent = exact ? `Human expectation: ${names[state.selected.expected]}. ${state.selected.humanNote}` : 'Inputs have been edited. The original fixture reference no longer applies.';
    const receipt = state.receipts.find(item => sameInputs(item.request?.inputs, inputs()));
    if (receipt) renderReceipt(receipt, true);
    else showEmpty('Inputs changed. The previous run is no longer displayed. Submit these inputs for a new check.');
  });
}

async function init() {
  const [fixtures, receipts, config] = await Promise.all([api('/api/fixtures'), api('/api/receipts'), api('/api/config')]);
  Object.assign(state, { fixtures, receipts, config });
  let primaryIndex = 0;
  let historicalIndex = 0;
  let v2Index = 0;
  for (const fixture of fixtures) {
    if (originalView && fixture.policyVersion === 2) continue;
    const button = el('button', 'fixture-button');
    button.type = 'button';
    button.dataset.id = fixture.id;
    button.setAttribute('aria-pressed', 'false');
    const title = el('span', 'fixture-title');
    const number = fixture.policyVersion === 2 ? `V${++v2Index}` : fixture.historical ? `H${++historicalIndex}` : String(++primaryIndex).padStart(2, '0');
    title.append(el('span', 'case-num', number), document.createTextNode(fixture.title));
    button.append(title, el('span', 'fixture-subtitle', fixture.subtitle));
    button.addEventListener('click', () => chooseFixture(fixture));
    $(fixture.policyVersion === 2 ? '#policy-v2-buttons' : fixture.historical ? '#historical-fixture-buttons' : '#fixture-buttons').append(button);
  }
  $('#priority-queue').hidden = originalView;
  $('#policy-v2-examples').hidden = originalView;
  if (!originalView) {
    const ordered = fixtures.filter(f => f.category === 'deployment' && f.policyVersion !== 2).map(fixture => {
      const receipt = receipts.find(item => sameInputs(item.request?.inputs, fixture));
      return { fixture, score: receipt?.outcome === 'success' ? reviewPriority(receipt.response) : null };
    }).filter(item => item.score !== null).sort((a, b) => b.score - a.score);
    for (const { fixture, score } of ordered) {
      const button = el('button', 'priority-item', `${fixture.title} · ${score.toFixed(1)} points`);
      button.type = 'button';
      button.addEventListener('click', () => chooseFixture(fixture));
      $('#priority-items').append(button);
    }
  }
  setBudget();
  chooseFixture(fixtures[0]);
}
init().catch(error => {
  $('#app-error').textContent = `Could not load the local app: ${error.message}`;
  $('#app-error').hidden = false;
  $('#verify-button').disabled = true;
});
