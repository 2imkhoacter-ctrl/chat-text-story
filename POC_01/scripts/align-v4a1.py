"""Ordered script/Whisper alignment with an explicit production safety gate.

All original text is retained. Matching preserves Vietnamese accents; numeric
tokens are expanded only in the matching representation, never in the script.
"""
import difflib
import hashlib
import json
from pathlib import Path
import re
import unicodedata
import math
import subprocess

ROOT = Path(__file__).resolve().parent.parent
DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']

def number_words(n):
    if n < 10:
        return [DIGITS[n]]
    if n < 100:
        tens, unit = divmod(n, 10)
        return (['mười'] if tens == 1 else [DIGITS[tens], 'mươi']) + ([] if unit == 0 else ['lăm' if unit == 5 else 'mốt' if unit == 1 and tens > 1 else DIGITS[unit]])
    if n < 1000:
        hundreds, rest = divmod(n, 100)
        return [DIGITS[hundreds], 'trăm'] + (['lẻ'] if 0 < rest < 10 else []) + (number_words(rest) if rest else [])
    return [str(n)]  # Unsupported numbers remain literal, never guessed.

def tokens(text):
    result = []
    for token in re.findall(r'[^\W_]+', unicodedata.normalize('NFC', text).lower()):
        number = re.fullmatch(r'(\d+)(k)?', token)
        repetition = re.fullmatch(r'(ha|hi|he|hô)\1+', token)
        if number:
            result.extend(number_words(int(number[1])))
            if number[2]:
                result.append('nghìn')
        elif repetition:
            result.extend([repetition[1]] * (len(token) // len(repetition[1])))
        else:
            # Both are Vietnamese readings of 1000; matching only.
            result.append('nghìn' if token == 'ngàn' else token)
    return result

def similarity(a, b):
    return 1.0 if a == b else difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()

def ordered_mapping(script_tokens, observed_tokens):
    """Global edit-distance alignment; every path advances chronologically."""
    n, m = len(script_tokens), len(observed_tokens)
    previous = list(map(float, range(m + 1)))
    directions = [bytearray([2] * (m + 1)) for _ in range(n + 1)]
    for i, a in enumerate(script_tokens, 1):
        current = [float(i)] + [0.0] * m
        directions[i][0] = 1
        for j, b in enumerate(observed_tokens, 1):
            sim = similarity(a, b)
            substitution = 0 if sim == 1 else 1.1 - 0.6 * sim
            choices = (previous[j - 1] + substitution, previous[j] + 1, current[j - 1] + 1)
            direction = min(range(3), key=choices.__getitem__)
            current[j], directions[i][j] = choices[direction], direction
        previous = current
    mapping = {}
    i, j = n, m
    while i or j:
        d = directions[i][j] if i and j else 1 if i else 2
        if d == 0:
            mapping[i - 1] = (j - 1, similarity(script_tokens[i - 1], observed_tokens[j - 1]))
            i, j = i - 1, j - 1
        elif d == 1:
            i -= 1
        else:
            j -= 1
    return mapping

def main():
    config = json.loads((ROOT / 'video.v4a1.config.json').read_text(encoding='utf-8'))
    script_file = ROOT / config['script']
    script = [line for line in script_file.read_text(encoding='utf-8').splitlines() if line.strip()]
    if len(script) != config['expectedPhraseCount']:
        raise RuntimeError(f"STOP: expected {config['expectedPhraseCount']} phrases; found {len(script)}")
    output = ROOT / config['generatedAudioDir']
    words_file = output / 'whisper-words.json'
    payload = json.loads(words_file.read_text(encoding='utf-8'))
    if hashlib.sha256((ROOT / config['audio']).read_bytes()).hexdigest() != payload['identity']['sourceSha256']:
        raise RuntimeError('Whisper cache does not match current source audio')
    words = payload['words']
    duration = float(subprocess.check_output([str(ROOT / 'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe'),
        '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(ROOT / config['audio'])], text=True).strip())
    observed, origins = [], []
    for index, word in enumerate(words):
        for token in tokens(word['word']):
            observed.append(token)
            origins.append(index)
    target, spans = [], []
    for text in script:
        start = len(target)
        target.extend(tokens(text))
        spans.append((start, len(target)))
    mapping = ordered_mapping(target, observed)
    phrases = []
    for index, (text, (a, b)) in enumerate(zip(script, spans)):
        matched = [(k, *mapping[k]) for k in range(a, b) if k in mapping]
        reliable = [(k, j, sim) for k, j, sim in matched if sim >= 0.5]
        # Even a weak substitution is retained as candidate evidence for review;
        # it is never treated as an accepted edge merely because DP paired it.
        word_ids = sorted(set(origins[j] for _, j, _ in matched))
        reasons = []
        confidence = 0.0
        first = last = None
        if not word_ids:
            reasons.append('No recognized word evidence for phrase')
        else:
            first, last = word_ids[0], word_ids[-1]
            insertion_count = sum(1 for j in range(reliable[0][1], reliable[-1][1] + 1) if j not in {t[1] for t in matched})
            confidence = sum(sim for _, _, sim in reliable) / max(1, b - a + insertion_count)
            if confidence < 0.85:
                reasons.append('Lexical alignment score below 0.85')
            for boundary, k in [('first', a), ('last', b - 1)]:
                if k not in mapping or mapping[k][1] < 0.8:
                    reasons.append(f'Unreliable {boundary} script word; no safe phrase edge')
            if any(words[w]['end'] <= words[w]['start'] for w in word_ids):
                reasons.append('Whisper assigned zero/reversed duration to a matched word')
            if any(words[q]['start'] < words[p]['start'] or words[q]['end'] < words[p]['end'] for p, q in zip(word_ids, word_ids[1:])):
                reasons.append('Word timestamps run backwards within phrase')
            if any(not math.isfinite(words[w][field]) or not (0 <= words[w][field] <= duration + 0.001) for w in word_ids for field in ['start', 'end']):
                reasons.append('Word timestamp outside the source audio')
            if any(words[w].get('probability', 0) < 0.2 for w in [first, last]):
                reasons.append('Low acoustic probability on phrase edge')
        phrases.append({
            'phrase': index + 1, 'id': f'phrase-{index + 1:03}', 'text': text,
            'audio': f'voice_{index + 1:03}.wav', 'confidence': round(confidence, 6),
            'confidenceKind': 'ordered lexical similarity, not calibrated probability',
            'candidateStart': words[first]['start'] if first is not None else None,
            'candidateEnd': words[last]['end'] if last is not None else None,
            'whisperWordIndices': word_ids,
            'recognizedText': ''.join(words[w]['word'] for w in word_ids).strip(),
            'recognizedContext': ''.join(w['word'] for w in words[max(0, (first or 0) - 3):min(len(words), (last or 0) + 4)]).strip(),
            'wordProbabilityMean': round(sum(words[w].get('probability', 0) for w in word_ids) / len(word_ids), 6) if word_ids else None,
            'tokenAlignment': [{'scriptToken': target[k], 'recognizedToken': observed[j], 'whisperWord': origins[j], 'similarity': round(sim, 4)} for k, j, sim in matched],
            'reviewReasons': reasons,
        })
    assigned = {w for phrase in phrases for w in phrase['whisperWordIndices']}
    unused_words = [w for i, w in enumerate(words) if i not in assigned and tokens(w['word'])]
    for word in unused_words:
        word_index = word['index']
        if any(p['whisperWordIndices'] and p['whisperWordIndices'][0] <= word_index <= p['whisperWordIndices'][-1] for p in phrases):
            continue  # Interior insertions already reduce that phrase's score.
        before = [p for p in phrases if p['whisperWordIndices'] and p['whisperWordIndices'][-1] < word_index]
        after = [p for p in phrases if p['whisperWordIndices'] and p['whisperWordIndices'][0] > word_index]
        for neighbor in ([before[-1]] if before else []) + ([after[0]] if after else []):
            neighbor['reviewReasons'].append(f"Unassigned recognized speech at adjacent edge: {word['word'].strip()} [{word['start']}–{word['end']}]; ownership requires review")
    for index, phrase in enumerate(phrases):
        start, end = phrase['candidateStart'], phrase['candidateEnd']
        if start is None or end is None or not (0 <= start < end):
            phrase['reviewReasons'].append('No valid nonzero candidate interval')
        if index and start is not None and phrases[index - 1]['candidateEnd'] is not None and start < phrases[index - 1]['candidateEnd']:
            phrase['reviewReasons'].append('Candidate overlaps previous phrase; cannot safely cut')
            phrases[index - 1]['reviewReasons'].append('Candidate overlaps next phrase; cannot safely cut')
    for index, phrase in enumerate(phrases):
        # A questionable neighbor cannot provide evidence for a safe adjacent cut.
        phrase['status'] = 'REVIEW_NEEDED' if phrase['reviewReasons'] else 'SAFE'
        phrase['start'] = phrase['end'] = phrase['duration'] = None
        if phrase['status'] == 'SAFE':
            start, end = phrase['candidateStart'], phrase['candidateEnd']
            left = (phrases[index - 1]['candidateEnd'] + start) / 2 if index and phrases[index - 1]['candidateEnd'] is not None else 0
            right = (end + phrases[index + 1]['candidateStart']) / 2 if index + 1 < len(phrases) and phrases[index + 1]['candidateStart'] is not None else duration
            phrase['start'] = round(max(left, start - config['phraseHeadPaddingSeconds']), 6)
            phrase['end'] = round(min(right, end + config['phraseTailPaddingSeconds']), 6)
            phrase['duration'] = round(phrase['end'] - phrase['start'], 6)
    flagged = [p for p in phrases if p['status'] != 'SAFE']
    report = {'status': 'REVIEW_NEEDED' if flagged else 'VALIDATED',
              'expectedPhraseCount': config['expectedPhraseCount'], 'scriptPhraseCount': len(script),
              'inputDurationSeconds': duration,
              'whisperWordCount': len(words), 'safelyAligned': len(phrases) - len(flagged), 'flagged': len(flagged),
              'scriptSha256': hashlib.sha256(script_file.read_bytes()).hexdigest(),
              'wordsSha256': hashlib.sha256(words_file.read_bytes()).hexdigest(),
              'sourceSha256': payload['identity']['sourceSha256'], 'runtime': payload['runtime'],
              'unassignedWhisperWords': unused_words,
              'phrases': phrases}
    (output / 'alignment-manifest.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    (output / 'alignment-review.json').write_text(json.dumps({'status': report['status'], 'flagged': flagged}, ensure_ascii=False, indent=2), encoding='utf-8')
    escape = lambda text: str(text).replace('|', '\\|').replace('\n', ' ')
    markdown = [
        '# V4A.1 alignment review', '',
        f"Status: **{report['status']}**. Script: {len(script)} phrases; recognized word records: {len(words)}; safe candidates: {len(phrases) - len(flagged)}; flagged: {len(flagged)}.", '',
        f"Input duration: {duration:.6f}s. Model: {payload['runtime']['model']}; device: {payload['runtime']['device']}; GPU: {payload['runtime']['gpu']}.", '',
        'Candidate timestamps below are review evidence, not accepted production cuts. No phrase count or original text was changed. Lexical scores are not calibrated probabilities.', '',
        '| Phrase | Original script | Candidate seconds | Lexical score | Recognized context | Review reason |',
        '| --- | --- | --- | --- | --- | --- |',
    ]
    for phrase in flagged:
        markdown.append('| ' + ' | '.join(escape(value) for value in [phrase['phrase'], phrase['text'],
            f"{phrase['candidateStart']}–{phrase['candidateEnd']}", phrase['confidence'],
            phrase['recognizedContext'], '; '.join(phrase['reviewReasons'])]) + ' |')
    markdown.extend(['', '## Lowest lexical scores', ''])
    for phrase in sorted(phrases, key=lambda p: (p['confidence'], p['phrase']))[:10]:
        markdown.append(f"- {phrase['phrase']:03}: {phrase['text']} — {phrase['confidence']:.6f} ({phrase['status']})")
    (output / 'alignment-review.md').write_text('\n'.join(markdown) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k not in ['phrases', 'unassignedWhisperWords']}, ensure_ascii=False, indent=2))
    for phrase in flagged:
        print(f"REVIEW {phrase['phrase']:03} [{phrase['candidateStart']}–{phrase['candidateEnd']}] score={phrase['confidence']}: {phrase['text']} | recognized: {phrase['recognizedText']} | {'; '.join(phrase['reviewReasons'])}")
    return 2 if flagged else 0

if __name__ == '__main__':
    raise SystemExit(main())
