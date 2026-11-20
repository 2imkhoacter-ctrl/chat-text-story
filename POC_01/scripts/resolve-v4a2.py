"""Resolve only flagged blocks between immutable safe V4A.1 anchors.

Reads the cached word records only. No Whisper import or transcription path.
Partitions whole recognized words, not freely estimated timestamp positions.
"""
import copy
import difflib
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('previous_alignment', Path(__file__).with_name('align-v4a1.py'))
previous = importlib.util.module_from_spec(spec)
spec.loader.exec_module(previous)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def fold(word):
    return ''.join(c for c in unicodedata.normalize('NFD', word.replace('đ', 'd')) if not unicodedata.combining(c))

def normalize(text, equivalences):
    text = unicodedata.normalize('NFC', text).lower()
    for left, right in equivalences:
        text = re.sub(r'(?<!\w)' + re.escape(left.lower()) + r'(?!\w)', right.lower(), text)
    return previous.tokens(text)

def lexical_cost(target, observed):
    """Fuzzy edits with extra penalties for stealing another phrase's onset."""
    row = [j * 0.65 for j in range(len(observed) + 1)]
    for i, a in enumerate(target, 1):
        next_row = [i * 0.9]
        for j, b in enumerate(observed, 1):
            sim = max(previous.similarity(a, b), difflib.SequenceMatcher(None, fold(a), fold(b), autojunk=False).ratio())
            next_row.append(min(row[j - 1] + 1 - sim, row[j] + 0.9, next_row[j - 1] + 0.65))
        row = next_row
    # Strong ordered onset evidence distinguishes trailing fillers from the
    # next phrase; neither accents nor an exact last word are mandatory.
    onset = max((previous.similarity(target[0], b) for b in observed[:1]), default=0)
    return row[-1] + (0.5 if onset < 0.5 else 0)

def partition(texts, block_words, equivalences):
    targets = [normalize(text, equivalences) for text in texts]
    observed = [normalize(word['word'], equivalences) for word in block_words]
    cache = {}
    def cost(i, start, end):
        key = (i, start, end)
        if key not in cache:
            flat = sum(observed[start:end], [])
            cache[key] = lexical_cost(targets[i], flat)
        return cache[key]
    # Retain two best distinct paths so an ambiguous word partition is explicit.
    states = {0: [(0.0, ())]}
    n, count = len(block_words), len(texts)
    for i in range(count):
        following = {}
        for start, paths in states.items():
            for end in range(start + 1, n - (count - i - 1) + 1):
                if i == count - 1 and end != n:
                    continue
                value = cost(i, start, end)
                if end < n:
                    gap = max(0, block_words[end]['start'] - block_words[end - 1]['end'])
                    value += 0.1 if gap == 0 else 0
                for total, cuts in paths:
                    following.setdefault(end, []).append((total + value, cuts + (end,)))
        states = {end: sorted(paths)[:2] for end, paths in following.items()}
    solutions = states.get(n, [])
    if not solutions:
        return None
    best = solutions[0]
    margin = solutions[1][0] - best[0] if len(solutions) > 1 else None
    spans, start = [], 0
    for i, end in enumerate(best[1]):
        tokens = sum(observed[start:end], [])
        score = max(0, 1 - cost(i, start, end) / max(len(targets[i]), len(tokens), 1))
        spans.append((start, end, score))
        start = end
    return spans, margin, best[0]

def resolve(config, baseline, payload, script):
    words = payload['words']
    phrases = copy.deepcopy(baseline['phrases'])
    anchors = [-1] + [i for i, p in enumerate(phrases) if p['status'] == 'SAFE'] + [len(phrases)]
    blocks = []
    for left, right in zip(anchors, anchors[1:]):
        if right == left + 1:
            continue
        lower = phrases[left]['end'] if left >= 0 else 0
        upper = phrases[right]['start'] if right < len(phrases) else baseline['inputDurationSeconds']
        wi = phrases[left]['whisperWordIndices'][-1] + 1 if left >= 0 else 0
        wj = phrases[right]['whisperWordIndices'][0] if right < len(phrases) else len(words)
        selected = words[wi:wj]
        answer = partition(script[left + 1:right], selected, config['matchingEquivalences'])
        block = {'firstPhrase': left + 2, 'lastPhrase': right, 'leftAnchor': left + 1 if left >= 0 else None,
                 'rightAnchor': right + 1 if right < len(phrases) else None, 'region': [lower, upper], 'wordRange': [wi, wj]}
        blocks.append(block)
        if answer is None:
            for p in phrases[left + 1:right]:
                p.update(status='STILL-NEEDS-REVIEW', reviewReasons=['No complete ordered word partition inside anchors'])
            continue
        spans, margin, cost = answer
        block.update(partitionMargin=margin, partitionCost=cost)
        assigned = []
        for k, (start, end, score) in enumerate(spans, left + 1):
            p = phrases[k]
            owned = selected[start:end]
            reasons = []
            if score < config['minimumLexicalScore']:
                reasons.append('Insufficient fuzzy support inside anchor window')
            if margin is not None and margin < config['minimumPartitionMargin']:
                reasons.append('Competing sequential word partitions are too close')
            if not owned or any(not math.isfinite(w['start']) or not math.isfinite(w['end']) or w['start'] > w['end'] for w in owned):
                reasons.append('Invalid recognized timestamps')
            if any(b['start'] < a['start'] or b['end'] < a['end'] for a, b in zip(owned, owned[1:])):
                reasons.append('Recognized timestamps run backwards')
            # Derive phrase envelope from valid neighbors. A zero-duration
            # onset owns the entire exclusive preceding interval, rather than
            # pretending its actual acoustic onset is known to the millisecond.
            voice_start, voice_end = owned[0]['start'], owned[-1]['end']
            zero_head = owned[0]['start'] == owned[0]['end']
            zero_tail = owned[-1]['start'] == owned[-1]['end']
            if zero_head:
                previous_valid = next((w['end'] for w in reversed(words[:wi + start]) if w['end'] > w['start']), lower)
                voice_start = max(lower, previous_valid)
                if owned[0]['start'] - voice_start > config['maximumZeroHeadRecoverySeconds']:
                    reasons.append('Exclusive zero-head interval is too wide for automatic recovery')
            if zero_tail:
                last_valid = next((w['end'] for w in reversed(owned) if w['end'] > w['start']), None)
                if last_valid is None:
                    reasons.append('No positive-duration neighbor to recover phrase envelope')
                else:
                    voice_end = max(voice_end, last_valid)
            if not (lower <= voice_start < voice_end <= upper + 1e-6):
                reasons.append('Phrase envelope crosses a preserved anchor or is empty')
            evidence = ['Unique ordered word ownership inside confirmed anchors',
                        'Tolerant whole-phrase match; no requirement for perfect token spelling']
            evidence.append(f'Best alternative partition is {margin:.6f} edit-cost units worse' if margin is not None else 'Only one unresolved script phrase/word region between these anchors')
            if normalize(p['text'], []) != normalize(p['text'], config['matchingEquivalences']):
                evidence.append('User-approved abbreviation equivalence used for matching only; original script preserved')
            if len(normalize(''.join(w['word'] for w in owned), config['matchingEquivalences'])) > len(normalize(p['text'], config['matchingEquivalences'])):
                evidence.append('Extra recognized suffix/interior words retained within unique phrase ownership; no recognized audio dropped')
            if min(w.get('probability', 1) for w in owned) < 0.2:
                evidence.append('Low standalone ASR word probability outweighed by unique script match and immutable anchor interval')
            if zero_head:
                evidence.append('Zero-duration onset: retained entire exclusive interval after preceding valid word/anchor; no invented word onset')
            if zero_tail:
                evidence.append('Zero-duration final word: phrase end bounded by preceding valid word end and next confirmed phrase')
            if any(w['start'] == w['end'] for w in owned[1:-1]):
                evidence.append('Internal zero-duration words do not change valid outer phrase boundaries')
            p.update(status='STILL-NEEDS-REVIEW' if reasons else 'AUTO-RESOLVED',
                     previousReviewReasons=p['reviewReasons'], reviewReasons=reasons,
                     resolutionReasons=evidence, confidence=round(score, 6),
                     confidenceKind='anchored fuzzy lexical score, not calibrated probability',
                     whisperWordIndices=list(range(wi + start, wi + end)),
                     recognizedText=''.join(w['word'] for w in owned).strip(),
                     recognizedContext=''.join(w['word'] for w in words[max(0, wi + start - 2):min(len(words), wi + end + 2)]).strip(),
                     anchorWindow=[lower, upper], anchorPhrases=[left + 1 if left >= 0 else None, right + 1 if right < len(phrases) else None],
                     partitionMargin=margin, candidateStart=voice_start, candidateEnd=voice_end,
                     zeroHeadRecoveryInterval=[voice_start, owned[0]['start']] if zero_head else None,
                     start=None, end=None, duration=None, zeroHeadRecovered=zero_head)
            assigned.append(p)
        # Jointly cap handles at word ownership boundaries. In particular, a
        # recovered zero-head interval is never given to the preceding clip.
        for i, p in enumerate(assigned):
            lcap = lower if i == 0 else (assigned[i - 1]['candidateEnd'] + p['candidateStart']) / 2
            rcap = upper if i == len(assigned) - 1 else (p['candidateEnd'] + assigned[i + 1]['candidateStart']) / 2
            if i and p['zeroHeadRecovered']:
                lcap = p['candidateStart']
            if i + 1 < len(assigned) and assigned[i + 1]['zeroHeadRecovered']:
                rcap = assigned[i + 1]['candidateStart']
            if p['status'] == 'AUTO-RESOLVED':
                p['start'] = round(max(lcap, p['candidateStart'] - config['phraseHeadPaddingSeconds']), 6)
                p['end'] = round(min(rcap, p['candidateEnd'] + config['phraseTailPaddingSeconds']), 6)
                p['duration'] = round(p['end'] - p['start'], 6)
    return phrases, blocks

def validate(phrases, baseline, script):
    errors = []
    if len(phrases) != len(script):
        errors.append('Phrase count differs from script')
    previous_word = -1
    for i, p in enumerate(phrases):
        if p['phrase'] != i + 1 or p['text'] != script[i]:
            errors.append(f'Phrase {i + 1}: original script/order changed')
        if baseline['phrases'][i]['status'] == 'SAFE' and p != baseline['phrases'][i]:
            errors.append(f'Phrase {i + 1}: confirmed anchor changed')
        if p['whisperWordIndices'][0] <= previous_word:
            errors.append(f'Phrase {i + 1}: recognized word ownership out of order')
        previous_word = p['whisperWordIndices'][-1]
        if p['status'] in ['SAFE', 'AUTO-RESOLVED']:
            if not (0 <= p['start'] < p['end'] <= baseline['inputDurationSeconds']):
                errors.append(f'Phrase {i + 1}: invalid accepted timestamp')
            if i and phrases[i - 1]['end'] is not None and p['start'] < phrases[i - 1]['end'] - 1e-7:
                errors.append(f'Phrase {i + 1}: clips overlap')
    return errors

def main():
    config = json.loads((ROOT / 'video.v4a2.config.json').read_text(encoding='utf-8'))
    script_file = ROOT / config['script']
    script = [s for s in script_file.read_text(encoding='utf-8').splitlines() if s.strip()]
    baseline_file, words_file = ROOT / config['baselineAlignment'], ROOT / config['cachedWords']
    baseline = json.loads(baseline_file.read_text(encoding='utf-8'))
    payload = json.loads(words_file.read_text(encoding='utf-8'))
    if len(script) != config['expectedPhraseCount'] or digest(script_file) != baseline['scriptSha256'] or digest(words_file) != baseline['wordsSha256'] or digest(ROOT / config['audio']) != baseline['sourceSha256']:
        raise RuntimeError('Script/count/source/cache differs from confirmed V4A.1 baseline')
    phrases, blocks = resolve(config, baseline, payload, script)
    errors = validate(phrases, baseline, script)
    unresolved = [p for p in phrases if p['status'] == 'STILL-NEEDS-REVIEW']
    report = {**{k: v for k, v in baseline.items() if k not in ['phrases', 'unassignedWhisperWords']},
        'alignmentVersion': 'v4a2', 'status': 'VALIDATED' if not errors and not unresolved else 'REVIEW_NEEDED',
        'safeAnchors': sum(p['status'] == 'SAFE' for p in phrases),
        'autoResolved': sum(p['status'] == 'AUTO-RESOLVED' for p in phrases),
        'safelyAligned': len(phrases) - len(unresolved), 'flagged': len(unresolved),
        'anchorBaselineSha256': digest(baseline_file), 'globalValidationErrors': errors, 'blocks': blocks, 'phrases': phrases}
    output = ROOT / config['generatedAudioDir']
    output.mkdir(parents=True, exist_ok=True)
    (output / 'alignment-manifest.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    text = ['# V4A.2 anchored alignment review', '', f"Status: **{report['status']}**. SAFE: {report['safeAnchors']}; AUTO-RESOLVED: {report['autoResolved']}; STILL-NEEDS-REVIEW: {report['flagged']}.", '',
            'The cached 521 word records were reused. The 61 original anchor records and all 97 script lines are unchanged. Zero-duration recovery uses conservative exclusive source envelopes; it does not claim new per-word acoustic timestamps.', '']
    for status in ['SAFE', 'AUTO-RESOLVED', 'STILL-NEEDS-REVIEW']:
        text += [f'## {status}', '', '| Phrase | Script | Recognized/context | Start–end (s) | Reason |', '| --- | --- | --- | --- | --- |']
        for p in phrases:
            if p['status'] == status:
                values = [p['phrase'], p['text'], p['recognizedContext'], f"{p['start']}–{p['end']}", '; '.join(p.get('resolutionReasons', ['Original confirmed anchor retained'])) if status != 'STILL-NEEDS-REVIEW' else '; '.join(p['reviewReasons'])]
                text.append('| ' + ' | '.join(str(v).replace('|', '\\|') for v in values) + ' |')
        text.append('')
    if errors:
        text += ['## Global errors', '', *errors]
    (output / 'alignment-review.md').write_text('\n'.join(text) + '\n', encoding='utf-8')
    print(json.dumps({k: report[k] for k in ['status', 'safeAnchors', 'autoResolved', 'flagged', 'globalValidationErrors']}, indent=2))
    for block in blocks:
        print(f"Block {block['firstPhrase']}–{block['lastPhrase']}: partition margin {block.get('partitionMargin')}")
    for p in unresolved:
        print(f"REVIEW {p['phrase']}: {p['text']} | {p['recognizedText']} | {p['reviewReasons']}")
    return 0 if report['status'] == 'VALIDATED' else 2

if __name__ == '__main__':
    raise SystemExit(main())
