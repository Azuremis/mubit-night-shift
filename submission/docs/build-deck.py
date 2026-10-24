#!/usr/bin/env python3
"""Build the PDF and evidence tables from committed synthetic receipts. No network calls."""
from pathlib import Path
import csv
import hashlib
import json
from html import escape

from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

REPO = Path(__file__).resolve().parents[2]
APP = REPO / 'sidequests/policy-evidence-check'
SUBMISSION = REPO / 'submission'
OUT = SUBMISSION / 'output/pdf/policy-evidence-check-submission.pdf'
BASE = 'https://github.com/Azuremis/mubit-night-shift'
COMMIT = '8889f08d3ed439d040a22b750d46adf4d970862a'
BLOB = f'{BASE}/blob/{COMMIT}/sidequests/policy-evidence-check'
DIAGNOSTIC_COMMIT = '42354a3db7b443bdbef64e1617f13df41f7f2c2b'
DIAGNOSTIC_URL = f'{BASE}/tree/{DIAGNOSTIC_COMMIT}/sidequests/policy-evidence-check/diagnostics/deployment-approval'
W, H = 1280, 720
BG, INK, MUTED, RULE = '#F7F6EF', '#173E33', '#53685E', '#CFD7CC'
ACCENT, WHITE, CAUTION = '#B9D577', '#FFFFFF', '#86571F'
FONT, BOLD, MONO = 'Helvetica', 'Helvetica-Bold', 'Courier'
font_dir = Path('/System/Library/Fonts/Supplemental')
if (font_dir / 'Arial.ttf').exists():
    pdfmetrics.registerFont(TTFont('DeckSans', str(font_dir / 'Arial.ttf')))
    pdfmetrics.registerFont(TTFont('DeckSansBold', str(font_dir / 'Arial Bold.ttf')))
    FONT, BOLD = 'DeckSans', 'DeckSansBold'

fixtures = {f['id']: f for f in json.loads((APP / 'fixtures.json').read_text())}
DIAG = APP / 'diagnostics/deployment-approval'
fixtures.update({f['id']: f for f in json.loads((DIAG / 'fixtures.json').read_text())})
receipt_files = sorted((APP / 'receipts').glob('receipt-*.json')) + sorted((DIAG / 'receipts').glob('receipt-*.json'))
by_call = {}
for p in receipt_files:
    r = json.loads(p.read_text())
    if r['callNumber'] in by_call:
        assert by_call[r['callNumber']] == r
    by_call[r['callNumber']] = r
all_receipts = [by_call[n] for n in sorted(by_call)]
receipts = [r for r in all_receipts if r['callNumber'] <= 8]
diagnostic_receipts = [r for r in all_receipts if r['callNumber'] >= 9]
ledger = json.loads((APP / 'receipts/call-ledger.json').read_text())
global_ledger = json.loads((DIAG / 'receipts/call-ledger.json').read_text())
assert len(receipts) == 8 and len(all_receipts) == 12
assert len(global_ledger['calls']) == 12 and global_ledger['limit'] == 12
assert sum(r['response']['status'] == 'unsure' for r in all_receipts) == 9
for key in ('source_release_sha256', 'weights_sha256'):
    assert len({r['response'][key] for r in all_receipts}) == 1
assert hashlib.sha256((DIAG/'fixtures.json').read_bytes()).hexdigest() == json.loads((DIAG/'predeclared.json').read_text())['fixtures_sha256']
assert sum(r['response']['status'] == 'unsure' for r in receipts) == 7
assert [r['fixtureId'] for r in receipts if r['response']['status'] == 'inconsistent_context'] == ['conflicting']
for r in all_receipts:
    assert r['outcome'] == 'success' and r['transport']['httpStatus'] == 200
    assert r['response']['model'] == 'banyan-sapling'
    assert r['response']['fallback_used'] is False and r['response']['usage']['generated_tokens'] == 0
    if r['fixtureId'] in fixtures:
        assert r['request']['inputs'] == {k: fixtures[r['fixtureId']][k] for k in ('policy', 'evidence', 'claim')}

def name(r):
    return 'Small MFA smoke' if r['fixtureId'] == 'smoke' else fixtures[r['fixtureId']]['title'].replace('PHP · ', 'PHP: ')

def expected(r):
    return 'supported' if r['fixtureId'] == 'smoke' else fixtures[r['fixtureId']]['expected']

def rel_receipt(r):
    sub = 'receipts' if r['callNumber'] <= 8 else 'diagnostics/deployment-approval/receipts'
    return f"../../sidequests/policy-evidence-check/{sub}/{r['id']}.json"

def generate_evidence():
    rows = []
    lines = [
        '# Recorded results and provenance', '',
        'Snapshot: 24 October 2026. Core application baseline: [`8889f08`](https://github.com/Azuremis/mubit-night-shift/commit/' + COMMIT + ').', '',
        '**Twelve actual endpoint calls returned nine calibrated `unsure` results, one `violation` and two `inconsistent_context` results.** The initial eight comprise a smoke call, four MFA cases and three PHP cases. Four predeclared deployment-approval cases followed under a separately authorized extension. No tuning, automatic retry or fine-tuning took place.', '',
        '## Complete recorded outcomes', '',
        '| Call and receipt | Synthetic case | Human reference | Calibrated status | Raw label | Set size | Model ms |',
        '| --- | --- | --- | --- | --- | ---: | ---: |',
    ]
    for r in all_receipts:
        o = r['response']
        row = {'call': r['callNumber'], 'receipt': r['id'], 'fixture': r['fixtureId'], 'case': name(r),
               'human_reference': expected(r), 'status': o['status'], 'raw_label': o['raw_label'],
               'prediction_set_size': len(o['prediction_set']), 'model_ms': round(o['timing_ms']['model'], 1),
               'http_status': r['transport']['httpStatus'], 'round_trip_ms': r['transport']['durationMs']}
        rows.append(row)
        lines.append(f"| [{r['callNumber']:02d}]({rel_receipt(r)}) | {name(r)} | `{expected(r)}` | `{o['status']}` | `{o['raw_label']}` | {len(o['prediction_set'])} | {o['timing_ms']['model']:.1f} |")
    lines += [
        '', 'The four classes are `supported`, `violation`, `insufficient_information` and `inconsistent_context`. Every set of size four contains all four labels. Each singleton set contains its calibrated label. Human references are fixture-author expectations and are separate from model output.', '',
        'The current MFA exception did not return its expected supported result. The PHP bound-backport also failed to return supported, and the PHP customer-VPS raw label differed from its insufficient-information reference. A raw violation is not a calibrated violation verdict.', '',
        '## What the receipts establish', '',
        '- All twelve attempts returned HTTP 200 and passed the local response schema. Receipt `outcome: success` describes transport/schema success rather than agreement with the human reference.',
        '- All twelve responses identify `banyan-sapling` in research preview, report `fallback_used: false`, and report zero generated tokens.',
        '- The conflicting-records response returned an inconsistent-context class score of **99.9865%** and a singleton prediction set. This is a returned model score, not measured accuracy or independent proof of correctness.',
        '- The deployment follow-up returned singleton violation for explicit rejection and singleton inconsistent_context for contradictory approvals. Approval plus passing tests stayed unsure with raw supported. Missing approval stayed unsure with raw violation. This does not establish reliable approval automation, and the app does not enforce a deployment gate.',
        f"- Provider-reported model timing spans **{min(r['response']['timing_ms']['model'] for r in all_receipts):.1f} to {max(r['response']['timing_ms']['model'] for r in all_receipts):.1f} ms** across these twelve calls. This is an observed range rather than a performance benchmark or service guarantee.",
        '- Selecting a fixture or replaying a receipt makes no provider call. The recorded timestamps identify when the original request ran.', '',
        'All twelve provider responses report the same identifiers:', '',
        '```text',
        'source_release_sha256: ' + receipts[0]['response']['source_release_sha256'],
        'weights_sha256:        ' + receipts[0]['response']['weights_sha256'],
        '```', '',
        'These hashes are provider assertions retained for provenance. The application did not independently inspect the executing weights or verify the source records.', '',
        '## Input and source provenance', '',
        'The current `fixtures.json` contains eleven synthetic cases after the four deployment fixtures joined the original seven. The separate smoke input is retained in receipt 01 and its original request file. Deployment fixtures and references were frozen before execution in `diagnostics/deployment-approval/predeclared.json`, with fixture SHA256 `9b36f1c2df9181aacf670d3743285ee789535b7351d3ff8f896fd0a567e65179`. Human references were not sent to the model. Every case receipt exactly matches its fixture policy, evidence and claim. Source IDs such as `[S1]` label submitted input text; they are not model-selected citations.', '',
        'The PHP source snapshot is recorded in [`sources/php-hosting.json`](../../sidequests/policy-evidence-check/sources/php-hosting.json), including retrieval time and the SHA256 of the fetched CVE record. The [PHP case guide](../../sidequests/policy-evidence-check/PHP_HOSTING_CASES.md) links the dated provider entry and PHP CNA record. All site observations and inventories remain invented, and the fixture scope is CVE-2026-109618 only.', '',
        '## Reproducibility boundary', '',
        'The global authorized budget is twelve used attempts against a twelve-attempt limit. The current primary ledger contains all twelve. The diagnostic ledger carries the original eight entries forward by reference and adds the same four follow-ups, so do not add ledger counts together. Replaying the files is reproducible without new inference. A fresh response from a later provider run would be a new observation and could differ; it requires its own authorization and must not overwrite the old evidence.', '',
        'The documentation verification reran the existing mocked server suite: **10 passed, 0 failed**, with localhost access permitted. No new provider calls were used. The original [validation record](../../sidequests/policy-evidence-check/VALIDATION.md) contains browser observations and the narrow-viewport limitation.', '',
        'This evidence does not establish general accuracy, calibrated coverage, security certification, automatic alert closure, compromise of a real site or production readiness.', '',
    ]
    (SUBMISSION / 'docs/EVIDENCE.md').write_text('\n'.join(lines))
    with (SUBMISSION / 'docs/recorded-results.csv').open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0])); writer.writeheader(); writer.writerows(rows)
    files = [APP / 'fixtures.json', APP / 'receipts/call-ledger.json', APP / 'sources/php-hosting.json', DIAG/'fixtures.json', DIAG/'predeclared.json', DIAG/'results.json', DIAG/'receipts/call-ledger.json'] + receipt_files
    manifest = {
        'team': 'SamuraiFlow', 'evidence_date': '2026-10-24', 'app_baseline_commit': COMMIT, 'diagnostic_results_commit': DIAGNOSTIC_COMMIT,
        'repository': BASE, 'live_attempts': 12, 'calibrated_unsure': 9, 'calibrated_violation': 1, 'calibrated_inconsistent_context': 2,
        'new_provider_calls_for_docs': 0, 'mocked_server_tests': {'passed': 10, 'failed': 0},
        'public_application_url': None, 'video_url': None,
        'registration': {'state': 'owner_reported_complete', 'reported_at': '2026-10-24T08:22:00Z', 'scope': 'team created/joined and rules accepted; check-in and final submission not established'},
        'source_files': {str(p.relative_to(REPO)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files},
    }
    (SUBMISSION / 'docs/evidence-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')


class Deck:
    def __init__(self):
        OUT.parent.mkdir(parents=True, exist_ok=True)
        self.c = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1, invariant=1)
        self.c.setTitle('Policy Evidence Check - SamuraiFlow - Sapling Policy Challenge')
        self.c.setAuthor('SamuraiFlow')
        self.c.setSubject('Twelve recorded Banyan Sapling calls, uncertainty, architecture and reproducibility')
        self.page = 0
        self.bounds = []

    def page_start(self, title=None, dark=False):
        self.page += 1; self.dark = dark
        self.c.setFillColor(HexColor(INK if dark else BG)); self.c.rect(0, 0, W, H, stroke=0, fill=1)
        if title:
            self.text(title, 66, 62, 42, bold=True)
        self.text('SamuraiFlow / Policy Evidence Check', 66, 673, 15, color=ACCENT if dark else MUTED)
        self.text(f'{self.page:02d} / 07', 1140, 673, 15, color=ACCENT if dark else MUTED)

    def text(self, value, x, y, size=24, bold=False, color=None, width=None, leading=None, mono=False):
        color = color or (WHITE if self.dark else INK)
        width = width or W - x - 66
        font = MONO if mono else BOLD if bold else FONT
        st = ParagraphStyle('p', fontName=font, fontSize=size, leading=leading or size * 1.24,
                            textColor=HexColor(color), spaceAfter=0, allowWidows=0, allowOrphans=0)
        p = Paragraph(escape(value).replace('\n', '<br/>'), st)
        _, height = p.wrap(width, H)
        assert x >= 0 and y >= 0 and x + width <= W + 1 and y + height <= H - 7, (self.page, value, y, height)
        p.drawOn(self.c, x, H - y - height)
        self.bounds.append({'page': self.page, 'text': value, 'x': x, 'top': y, 'width': width, 'height': round(height, 2)})
        return height

    def line(self, x1, y, x2, color=RULE, weight=1):
        self.c.setStrokeColor(HexColor(color)); self.c.setLineWidth(weight)
        self.c.line(x1, H-y, x2, H-y)

    def link(self, text, url, x, y, size=18, width=None, color=None, bold=False):
        height = self.text(text, x, y, size=size, color=color, width=width, bold=bold)
        self.c.linkURL(url, (x, H-y-height-2, x+(width or W-x-66), H-y+1), relative=0, thickness=0)
        return height

    def end(self):
        self.c.showPage()

    def save(self):
        self.c.save()


def build_deck():
    d = Deck()
    # 1: minimal editorial cover.
    d.page_start(dark=True)
    d.text('SAPLING POLICY CHALLENGE', 70, 80, 20, color=ACCENT)
    d.text('Policy\nEvidence Check', 66, 158, 76, bold=True, width=1100, leading=83)
    d.text('Release blockers with visible uncertainty', 70, 376, 32, width=1080)
    d.text('Twelve recorded calls to Banyan Sapling\nSynthetic release approval, MFA and PHP evidence', 70, 455, 23, color='#DAE5D7', leading=32)
    d.link('github.com/Azuremis/mubit-night-shift', BASE, 70, 581, 21, color=ACCENT)
    d.text('24 October 2026', 956, 581, 20, color='#DAE5D7', width=260)
    d.end()

    # 2: exact supplied claim and the evidence distinction behind a release blocker.
    d.page_start('Release approval evidence')
    d.text('Claim',66,149,22,bold=True,width=540)
    d.text('Release r-42 is permitted\nfor production deployment.',66,195,33,bold=True,width=548,leading=42)
    d.text('Policy requires approval for that release\nand all required tests to pass.\nAn explicit rejection blocks deployment.',66,322,25,width=548,color=MUTED,leading=35)
    d.text('Passing tests alone do not settle\nthe approval question.',66,483,26,bold=True,width=548,leading=36)
    d.text('Exact synthetic evidence',704,149,22,bold=True,width=508)
    rejection=fixtures['deployment-rejected']['evidence']
    d.text(rejection,704,195,24,width=508,leading=34)
    d.line(704,435,1212,color=INK,weight=2)
    d.text('Recorded Sapling result',704,463,21,width=508,color=MUTED)
    d.text('violation',704,507,36,bold=True,width=508)
    d.text('Singleton prediction set',704,559,22,width=508,color=MUTED)
    d.link('Source: deployment-rejected fixture and receipt-10-57703127.json. All records are invented.',DIAGNOSTIC_URL,66,622,17,color=MUTED)
    d.end()

    # 3: requested architecture represented with native PDF text and rules.
    d.page_start('Sapling integration and receipt flow')
    cols = [66, 454, 842]
    for x, title in zip(cols, ['01  Input strings', '02  Local Node adapter', '03  Sapling response']):
        d.text(title, x, 157, 24, bold=True, width=370)
        d.line(x, 205, x+354, color=INK, weight=2)
    d.text('inputs.policy\ninputs.evidence\ninputs.claim', cols[0], 238, 24, mono=True, width=360, leading=41)
    d.text('Synthetic records and a claim\nunder one explicit policy.', cols[0], 407, 23, width=350, color=MUTED)
    d.text('Validate, then reserve an attempt\nbefore the network request.\nForward the exact three strings.\nSave the request and raw response.', cols[1], 237, 22, width=354, leading=35)
    d.text('Persistent ledger and shared\nfilesystem reservation lock.\nNo automatic retry.', cols[1], 428, 21, width=354, color=MUTED, leading=30)
    d.text('Calibrated status\nPrediction set\nSecondary raw label and scores\nTiming and reported model hashes', cols[2], 237, 22, width=354, leading=35)
    d.text('Sapling performs classification.\nThe UI preserves the response\nand displays the source inputs.', cols[2], 428, 21, width=354, color=MUTED, leading=30)
    d.text('POST https://6adbee0669a00298cd4774c9.endpoints.huggingface.cloud', 66, 578, 19, mono=True, width=1150)
    d.link('Source: server.mjs. No fine-tuning or generated explanation in this integration.', f'{BLOB}/server.mjs', 66, 620, 17, color=MUTED)
    d.end()

    # 4: actual predeclared follow-up, including approved-but-unsure.
    d.page_start('Deployment approval: four predeclared cases')
    d.text('One shared policy and claim. Inputs and human references frozen before the four requests.',66,128,21,color=MUTED)
    xs=[66,368,608,848,1132]; widths=[285,224,224,266,80]
    for x,w,header in zip(xs,widths,['Synthetic case','Human reference','Calibrated status','Raw label','Set size']):
        d.text(header,x,198,18,bold=True,width=w)
    d.line(66,238,1214,color=INK,weight=2)
    for idx,r in enumerate(diagnostic_receipts):
        o=r['response']; y=264+idx*59
        values=[name(r),expected(r),o['status'],o['raw_label'],str(len(o['prediction_set']))]
        for j,(x,w,value) in enumerate(zip(xs,widths,values)):
            d.text(value,x,y,20 if j==0 else 16.5,bold=(j==2),width=w,color=INK if j in (0,2) else MUTED)
        d.line(66,y+43,1214,weight=.6)
    d.text('Two distinct stop conditions. The approved case still returned unsure.',66,545,27,bold=True,width=1150)
    d.text('This app reviews evidence. It does not enforce a deployment gate or establish safe approval.',66,592,20,width=1150,color=MUTED)
    d.link('Source: diagnostics/deployment-approval/REPORT.md and receipts 09-12',DIAGNOSTIC_URL,66,632,16,color=MUTED)
    d.end()

    # 5: original results stay visible, including the failed PHP expectation.
    d.page_start('Earlier MFA and PHP outcomes')
    d.text('The original eight calls remain part of the evidence. Asset and account records are synthetic.',66,128,21,color=MUTED)
    xs = [66, 346, 586, 826, 1118]
    widths = [265, 224, 224, 276, 90]
    headers = ['Synthetic case', 'Human reference', 'Calibrated status', 'Raw label', 'Set size']
    for x, w, header in zip(xs, widths, headers):
        d.text(header, x, 191, 18, bold=True, width=w)
    d.line(66, 227, 1214, color=INK, weight=2)
    for idx, r in enumerate(receipts):
        o = r['response']; y = 244 + idx * 39
        values = [name(r), expected(r), o['status'], o['raw_label'], str(len(o['prediction_set']))]
        for j, (x, w, value) in enumerate(zip(xs, widths, values)):
            d.text(value, x, y, 18 if j == 0 else 16.5, bold=(j==2), width=w, color=INK if j in (0,2) else MUTED)
        d.line(66, y+31, 1214, weight=.6)
    d.text('PHP backport expected supported and returned unsure. PHP scope: CVE-2026-109618 only.',66,580,21,width=1150)
    d.link('Sources: original eight receipts and PHP_HOSTING_CASES.md. Raw labels remain secondary.',f'{BASE}/tree/{COMMIT}/sidequests/policy-evidence-check/receipts',66,626,17,color=MUTED)
    d.end()

    # 6: observations separated from unproven claims, no KPI accuracy framing.
    d.page_start('Observed behavior and limits')
    d.text('9 of 12',66,145,86,bold=True,width=550)
    d.text('calibrated responses were unsure',70,253,27,width=560)
    d.text('Three singleton results: one violation\nand two inconsistent contexts.\nThese examples establish no general\naccuracy or automatic approval ability.',70,333,25,width=546,leading=35)
    d.text('Model integration',700,159,26,bold=True,width=510)
    d.text('All twelve responses report banyan-sapling,\nno fallback and zero generated tokens.',700,207,22,width=510,leading=31)
    d.text('Local verification',700,318,26,bold=True,width=510)
    d.text('10 mocked server tests passed.\nNo provider calls during documentation QA.',700,366,22,width=510,leading=31)
    d.text('Unproven',700,476,26,bold=True,width=510)
    d.text('General accuracy, production readiness,\nserver security certification or real-site\nPHP remediation.',700,524,22,width=510,leading=31)
    d.link('Sources: recorded receipts and VALIDATION.md. Exploratory synthetic sample only.', f'{BLOB}/VALIDATION.md', 66, 622, 17, color=MUTED)
    d.end()

    # 7: usable handoff without invented public endpoints.
    d.page_start('Reproduce and inspect')
    d.link('github.com/Azuremis/mubit-night-shift', BASE, 66, 151, 32, bold=True, width=1150)
    d.text('cd sidequests/policy-evidence-check\nnpm test\nnpm start',66,231,28,mono=True,width=1150,leading=43)
    d.text('Open http://127.0.0.1:4321\nReplay saved receipts. The global 12-call budget is exhausted.',66,394,24,width=1150,leading=34)
    d.text('Public synthetic data only. Keep credentials, private records and session state out of commits.',66,493,22,width=1140)
    d.text('Public app and video URLs: awaiting verified links',66,549,22,width=1150,color=MUTED)
    d.text('SamuraiFlow registration and rules acceptance: owner reported complete at 08:22 UTC.\nCheck-in and final submission completion are not established by that report.',66,596,17,width=1150,color=MUTED,leading=24)
    d.end()
    d.save()

    reader=PdfReader(str(OUT)); assert len(reader.pages)==7
    text='\n'.join(p.extract_text() for p in reader.pages)
    for required in ['SamuraiFlow','four predeclared cases','Earlier MFA and PHP','unsure','No fine-tuning','awaiting verified links']:
        assert required in text,required
    qa=REPO/'.local/submission-qa'; qa.mkdir(parents=True,exist_ok=True)
    (qa/'pdf-text.txt').write_text(text)
    (qa/'text-bounds.json').write_text(json.dumps(d.bounds,indent=2)+'\n')
    print(json.dumps({'pdf':str(OUT.relative_to(REPO)),'pages':len(reader.pages),'bytes':OUT.stat().st_size,'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),'text_checks':'passed','text_boxes':len(d.bounds)},indent=2))


if __name__ == '__main__':
    generate_evidence()
    build_deck()
