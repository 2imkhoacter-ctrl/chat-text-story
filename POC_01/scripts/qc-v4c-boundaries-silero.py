"""Read-only Silero QC of existing V4C cuts. Writes diagnostic reports only."""
from pathlib import Path
import hashlib
import importlib.metadata
import json
import math
import shutil
import subprocess
import wave
import io

import numpy as np
import torch
from silero_vad import load_silero_vad
from silero_vad.utils_vad import get_speech_timestamps_from_probs

ROOT = Path(__file__).resolve().parents[1]
RATE, FRAME = 16000, 512
LOW, HIGH = 0.20, 0.80
JSON_OUT = ROOT / 'data/v4c-silero-boundary-qc.json'
MD_OUT = ROOT / 'out/v4c-silero-boundary-qc.md'


def sha(file):
    h = hashlib.sha256()
    with file.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def protected_hashes():
    files = []
    for directory in ('public', 'src', 'data'):
        files.extend(p for p in (ROOT / directory).rglob('*') if p.is_file() and p != JSON_OUT)
    files.extend(ROOT.glob('video*.json'))
    files.extend(ROOT / p for p in ('scripts/audio-boundary-nudge.cjs',
                                   'scripts/audio-nudge-server.cjs', 'scripts/audio-nudge-ui.html'))
    return {str(p.relative_to(ROOT)): sha(p) for p in sorted(set(files))}


def decode_master():
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        tool_dir = subprocess.check_output(
            ['node', '-e', "process.stdout.write(require('@remotion/compositor-win32-x64-msvc').dir)"],
            cwd=ROOT, text=True).strip()
        ffmpeg = str(Path(tool_dir) / 'ffmpeg.exe')
    args = [ffmpeg, '-hide_banner', '-loglevel', 'error', '-i',
            str(ROOT / 'public/full_tts.mp3.MP3'), '-map', '0:a:0',
            '-ac', '1', '-ar', str(RATE), '-c:a', 'pcm_s16le']
    # Some bundled FFmpeg builds omit the raw s16le muxer. WAV wrapping is
    # stripped in memory; the tensor always receives raw mono PCM16 samples.
    formats = subprocess.run([ffmpeg, '-hide_banner', '-muxers'], capture_output=True, text=True, check=True)
    if any(line.split()[-1:] == ['s16le'] or ' s16le ' in line for line in formats.stdout.splitlines()):
        pcm = subprocess.run(args + ['-f', 's16le', 'pipe:1'], capture_output=True, check=True).stdout
        transport = 'FFmpeg raw s16le pipe'
    else:
        payload = subprocess.run(args + ['-f', 'wav', 'pipe:1'], capture_output=True, check=True).stdout
        with wave.open(io.BytesIO(payload), 'rb') as decoded:
            assert decoded.getnchannels() == 1 and decoded.getframerate() == RATE and decoded.getsampwidth() == 2
            pcm = decoded.readframes(decoded.getnframes())
        transport = 'FFmpeg PCM16 WAV pipe; header removed in memory (raw muxer unavailable)'
    signal = np.frombuffer(pcm, dtype='<i2').astype(np.float32) / 32768.0
    return torch.from_numpy(signal), transport


def run():
    before = protected_hashes()
    manifest = json.loads((ROOT / 'public/generated-audio-v4c/timing-manifest.json').read_text('utf8'))
    manual = json.loads((ROOT / 'data/audio-boundary-overrides.json').read_text('utf8'))
    phrases = manifest['phrases']
    assert len(phrases) == 97 and len(manual) == 14
    assert manifest['manualBoundaryOverrides'] == manual, 'Saved nudges and currently applied V4C cuts disagree'
    for i in range(96):
        assert abs(phrases[i]['sourceEnd'] - phrases[i+1]['sourceStart']) < 1 / 44100
    audio, transport = decode_master()
    duration = len(audio) / RATE
    torch.set_num_threads(1)
    model = load_silero_vad()
    model.reset_states()
    frames = []
    with torch.inference_mode():
        for start in range(0, len(audio), FRAME):
            chunk = audio[start:start+FRAME]
            if len(chunk) < FRAME:
                chunk = torch.nn.functional.pad(chunk, (0, FRAME-len(chunk)))
            frames.append({'start': start/RATE, 'end': min(start+FRAME, len(audio))/RATE,
                           'probability': float(model(chunk, RATE).item())})
    probabilities = [f['probability'] for f in frames]
    broad = get_speech_timestamps_from_probs(probabilities, sampling_rate=RATE,
        audio_length_samples=len(audio), return_seconds=False)
    broad = [{'start': r['start']/RATE, 'end': r['end']/RATE} for r in broad]

    # Raw low-probability frame runs are diagnostics, not replacement segments.
    quiet = []
    for f in frames:
        if f['probability'] <= LOW:
            if quiet and abs(quiet[-1]['end']-f['start']) < 1e-8:
                quiet[-1]['end'] = f['end']
                quiet[-1]['maxProbability'] = max(quiet[-1]['maxProbability'], f['probability'])
            else:
                quiet.append({'start': f['start'], 'end': f['end'], 'maxProbability': f['probability']})
    quiet = [r for r in quiet if r['end']-r['start'] >= .064-1e-9]

    def average(a, b):
        overlaps = [(max(0, min(b, f['end'])-max(a, f['start'])), f['probability'])
                    for f in frames if f['end'] > a and f['start'] < b]
        total = sum(w for w, _ in overlaps)
        return sum(w*p for w, p in overlaps)/total if total else None

    def diagnose(cut):
        index = min(len(frames)-1, max(0, int(cut*RATE)//FRAME))
        local = [f for f in frames if f['end'] > cut-.2 and f['start'] < cut+.2]
        guard = [f for f in frames if f['end'] > cut-.032 and f['start'] < cut+.032]
        at = frames[index]['probability']
        continuous = len(guard) >= 2 and all(f['probability'] >= HIGH for f in guard)
        containing = next((r for r in quiet if r['start']+.016 <= cut <= r['end']-.016), None)
        if continuous:
            category = 'SUSPICIOUS'
            reason = 'Silero probability >=0.80 throughout the frames overlapping cut ±32 ms; sustained speech evidence across the cut.'
            evidence = 'strong VAD speech evidence; not phoneme-level proof'
        elif containing and guard and all(f['probability'] <= LOW for f in guard):
            category = 'SAFE'
            reason = 'Cut lies inside a >=64 ms low-probability run with >=16 ms edge clearance; cut ±32 ms frames all <=0.20.'
            evidence = 'strong VAD non-speech evidence; not a guarantee against quiet phonemes'
        else:
            category = 'UNCERTAIN'
            reason = 'Mixed, intermediate, or short-duration VAD evidence; conservative thresholds do not establish speech or a safe gap.'
            evidence = 'ambiguous VAD evidence'
        earlier = [r for r in quiet if r['end'] <= cut]
        later = [r for r in quiet if r['start'] >= cut]
        nearest_before = max(earlier, key=lambda r:r['end']) if earlier else None
        nearest_after = min(later, key=lambda r:r['start']) if later else None
        return {'time': cut, 'classification': category,
                'recommendedAction': 'KEEP' if category == 'SAFE' else 'REVIEW MANUALLY',
                'speechProbabilityBefore64ms': average(max(0, cut-.064), cut),
                'speechProbabilityAtCut': at,
                'speechProbabilityAfter64ms': average(cut, min(duration, cut+.064)),
                'probabilityFrameAtCut': frames[index],
                'continuousSpeechAcrossCut': continuous,
                'insideBroadSpeechRegion': any(r['start'] <= cut < r['end'] for r in broad),
                'containingNonSpeechRegion': containing,
                'nearestNonSpeechBefore': nearest_before,
                'nearestNonSpeechAfter': nearest_after,
                'distanceToNonSpeechBeforeMs': (cut-nearest_before['end'])*1000 if nearest_before else None,
                'distanceToNonSpeechAfterMs': (nearest_after['start']-cut)*1000 if nearest_after else None,
                'localWindow': [max(0, cut-.2), min(duration, cut+.2)],
                'localFrameProbabilities': local, 'evidenceStrength': evidence, 'reason': reason}

    rows = []
    for i in range(96):
        name = f'boundary_{i+1:03d}'
        cut = phrases[i]['sourceEnd']
        correction = manual.get(name, 0)
        rows.append({'boundaryId': name, 'previousPhrase': phrases[i]['text'],
            'nextPhrase': phrases[i+1]['text'], 'v4cBoundaryTime': cut,
            'existingManualCorrectionMs': correction, 'humanCorrected': name in manual,
            'qc': diagnose(cut),
            # Diagnostic historical location only. Never applied or written as a cut.
            'preNudgeQc': diagnose(cut-correction/1000) if name in manual else None})
    def counts(values):
        return {name: sum(v['classification'] == name for v in values)
                for name in ('SAFE', 'SUSPICIOUS', 'UNCERTAIN')}
    human = [r for r in rows if r['humanCorrected']]
    summary = {'totalBoundaries': 96, 'currentV4c': counts([r['qc'] for r in rows]),
               'humanCorrectedBoundaries': len(human),
               'humanCurrentCorrectedLocations': counts([r['qc'] for r in human]),
               'humanHistoricalPreNudgeLocations': counts([r['preNudgeQc'] for r in human]),
               'previouslyUntouchedSuspicious': sum(not r['humanCorrected'] and r['qc']['classification']=='SUSPICIOUS' for r in rows),
               'previouslyUntouchedTotal': 96-len(human), 'broadSpeechRegionCount': len(broad)}
    after = protected_hashes()
    assert before == after, 'A protected production file changed during QC; reports not published'
    result = {'experiment': 'READ_ONLY_V4C_SILERO_BOUNDARY_QC', 'sileroVersion': importlib.metadata.version('silero-vad'),
        'parameters': {'sampleRate': RATE, 'modelFrameSamples': FRAME, 'frameDurationMs': 32,
                       'localDiagnosticWindowMs': 200, 'lowProbabilityThreshold': LOW, 'highProbabilityThreshold': HIGH,
                       'classificationGuardMs':32, 'minimumNonSpeechRunMs':64, 'nonSpeechEdgeClearanceMs':16},
        'decodeTransport': transport, 'masterDurationSeconds': duration,
        'summary': summary, 'readOnlyValidation': {'productionFilesChecked': len(before), 'hashesUnchanged': True},
        'interpretation': ['Primary QC is at the CURRENT, already-nudged V4C cuts.',
          'Historical pre-nudge QC is a separate diagnostic of the 14 known problem locations; no cut was moved.',
          'Untouched boundaries have no validated negative labels. Their suspicious count is review workload, not a measured false-positive count.',
          'Silero has 32 ms frame resolution and recurrent context; its scores are not phoneme-boundary confidence.',
          'VAD classifies speech activity, not which phrase owns a phoneme. High activity alone cannot prove an incorrect cut.',
          'Broad VAD speech regions are context only and are never used as phrase segments.'],
        'broadSpeechRegions': broad, 'boundaries': rows}
    JSON_OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
    esc = lambda s:str(s).replace('|', '\\|').replace('\n',' ')
    prob = lambda x:f'{x:.3f}' if x is not None else 'n/a'
    lines = ['# Read-only V4C Silero boundary QC', '',
        '**No boundary, WAV, saved nudge, production manifest, Remotion source/timing, or asset was modified.**', '',
        f"Silero {result['sileroVersion']}; {transport}; mono PCM16 → NumPy int16 → float tensor / 32768; 16 kHz.",
        'No Torch audio backend, read_audio(), Whisper, energy refinement, automatic repair, padding or render was used.', '',
        '## Summary', '', '|Measure|SAFE|SUSPICIOUS|UNCERTAIN|', '|---|---:|---:|---:|']
    for title, data in [('All 96 current V4C boundaries',summary['currentV4c']),
                        ('14 human-corrected cuts at current positions',summary['humanCurrentCorrectedLocations']),
                        ('14 human problem cuts at historical pre-nudge positions',summary['humanHistoricalPreNudgeLocations'])]:
        lines.append(f"|{title}|{data['SAFE']}|{data['SUSPICIOUS']}|{data['UNCERTAIN']}|")
    lines += ['', f"Previously untouched boundaries marked SUSPICIOUS: **{summary['previouslyUntouchedSuspicious']} / 82**.",
              f"Broad VAD speech regions: **{len(broad)}** (context only; not mapped to the 97 phrases).", '',
              '## Method and interpretation', '',
              'Run the model continuously over the master in 512-sample (32 ms) frames, retaining recurrent context. Inspect ±200 ms of those probabilities at each exact current V4C cut. No locally reset short-fragment inference is used.', '',
              'SUSPICIOUS requires every frame overlapping cut ±32 ms to have speech probability ≥0.80. SAFE requires all those frames ≤0.20 and the cut to sit at least 16 ms inside a low-probability run lasting ≥64 ms. Everything else is UNCERTAIN. These initial conservative rules were fixed before comparing with the human examples; no threshold optimization was performed.', '',
              *[f'- {text}' for text in result['interpretation']], '',
              'The 14 saved nudges label historically problematic positions, not the corrected current positions. The secondary historical test is therefore more relevant to detection of the original errors. Neither the other 82 cuts nor all corrected cuts are assumed to be independently verified negatives. Precision, specificity and reliable bad-cut detection cannot be established from this small positive-only set.', '',
              '## Human ground-truth examples', '',
              '|Boundary|Previous phrase|Next phrase|Saved nudge ms|Current cut s|Current QC|Pre-nudge time s|Pre-nudge QC|Current P before / at / after|Current reason|',
              '|---|---|---|---:|---:|---|---:|---|---|---|']
    for r in human:
        q,h=r['qc'],r['preNudgeQc']
        lines.append('|'+ '|'.join(map(esc,[r['boundaryId'],r['previousPhrase'],r['nextPhrase'],r['existingManualCorrectionMs'],f"{r['v4cBoundaryTime']:.6f}",q['classification'],f"{h['time']:.6f}",h['classification'],f"{prob(q['speechProbabilityBefore64ms'])} / {prob(q['speechProbabilityAtCut'])} / {prob(q['speechProbabilityAfter64ms'])}",q['reason']]))+'|')
    lines += ['', '## All 96 current V4C boundaries', '',
              '|Boundary|Previous phrase|Next phrase|V4C cut s|Saved nudge ms|QC|P before / at / after|Continuous speech|Reason|Action|',
              '|---|---|---|---:|---:|---|---|---|---|---|']
    for r in rows:
        q=r['qc']
        lines.append('|'+ '|'.join(map(esc,[r['boundaryId'],r['previousPhrase'],r['nextPhrase'],f"{r['v4cBoundaryTime']:.6f}",r['existingManualCorrectionMs'],q['classification'],f"{prob(q['speechProbabilityBefore64ms'])} / {prob(q['speechProbabilityAtCut'])} / {prob(q['speechProbabilityAfter64ms'])}",q['continuousSpeechAcrossCut'],q['reason'],q['recommendedAction']]))+'|')
    lines += ['', '## Diagnostic details and rerun', '',
              'The JSON report contains each local frame probability, nearest ≥64 ms non-speech runs before/after, containing non-speech run, distances, broad-region activity and evidence strength for both current and historical locations.', '',
              f'Protected production files hashed before and after: **{len(before)}**, all unchanged. The authoritative manifest still has 97 phrases, 96 shared cuts and the same 14 applied/saved manual corrections.', '',
              'Rerun from the project: `.venv-speech\\Scripts\\python.exe -X utf8 scripts/qc-v4c-boundaries-silero.py`.',
              'Only this Markdown report and data/v4c-silero-boundary-qc.json are written. No production generator is imported or executed.']
    MD_OUT.write_text('\n'.join(lines)+'\n', encoding='utf8')
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f'Read-only hash verification: {len(before)} production files unchanged.')


if __name__ == '__main__':
    run()
