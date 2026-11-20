const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildPhraseTimeline } = require('../src/phrase-timeline.cjs');
const { probeDuration } = require('./segment-audio.cjs');
const root = path.resolve(__dirname, '..');
const baseConfig = require('../video.config.json');
const config = { ...baseConfig, ...require('../video.v4a.config.json') };
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, config.timingManifest), 'utf8'));
assert.equal(manifest.sampleMode, false, 'Verification must use new full TTS');
assert.equal(manifest.sourceAudio, config.audio);
const files = fs.readdirSync(path.resolve(root, config.generatedAudioDir)).filter((name) => /^voice_\d+\.wav$/.test(name));
assert.equal(files.length, manifest.phrases.length);
for (const phrase of manifest.phrases) {
  assert.ok(phrase.clipDuration >= 0.15, `Tiny/empty clip: ${phrase.id}`);
  assert.ok(Math.abs(probeDuration(path.resolve(root, 'public', phrase.relativeAudioFile)) - phrase.clipDuration) < 0.00001);
  assert.ok(phrase.sourceStart <= phrase.detectedStart && phrase.sourceEnd >= phrase.detectedEnd - 0.000001);
}
const options = { initialMargin: config.initialMarginSeconds, normalGap: config.defaultPauseAfterSeconds, maskStops: config.maskStops.map((s) => s.y) };
const baseline = buildPhraseTimeline(manifest, options);
const shifted = buildPhraseTimeline(manifest, { ...options, pauses: { 'Phrase 2': 2 } });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
for (let index = 0; index < baseline.phrases.length; index++) {
  const phrase = baseline.phrases[index];
  const later = shifted.phrases[index];
  near(later.timelineStart - phrase.timelineStart, index > 1 ? 2 : 0);
  assert.equal(later.clipDuration, phrase.clipDuration);
  if (index < baseline.phrases.length - 1) {
    const next = shifted.phrases[index + 1];
    assert.ok(next.timelineStart > later.timelineEnd);
    near(next.timelineStart, later.timelineEnd + later.pauseAfter + options.normalGap);
    near(later.transitionEnd - later.transitionStart, options.normalGap);
    near(later.transitionStart, next.timelineStart - options.normalGap);
  }
}
near(shifted.phrases[1].transitionStart, shifted.phrases[1].timelineEnd + 2);
near(shifted.durationSeconds - baseline.durationSeconds, 2);
const lastHold = buildPhraseTimeline(manifest, { ...options, pauses: { [`Phrase ${manifest.phrases.length}`]: 2 } });
near(lastHold.durationSeconds - baseline.durationSeconds, 2);
near(lastHold.phrases.at(-1).transitionEnd, lastHold.phrases.at(-1).holdEnd);
const frames = (m) => Math.ceil((m.durationSeconds + config.endMarginSeconds) * config.fps);
assert.equal(frames(shifted) - frames(baseline), 60);
console.log(JSON.stringify({
  source: manifest.sourceAudio, sourceDuration: manifest.sourceDurationSeconds,
  phrases: manifest.phrases.length, files: files.length,
  shortestClip: Math.min(...manifest.phrases.map((p) => p.clipDuration)),
  phrase2: { voiceDuration: shifted.phrases[1].clipDuration, voiceEnd: shifted.phrases[1].timelineEnd, holdEnd: shifted.phrases[1].holdEnd, transitionEnd: shifted.phrases[1].transitionEnd, phrase3Start: shifted.phrases[2].timelineStart },
  baselineFrames: frames(baseline), testFrames: frames(shifted), test: 'PASS',
  review: manifest.phrases.filter((p) => p.reviewWarnings.length).map((p) => ({ id:p.id, sourceStart:p.sourceStart, sourceEnd:p.sourceEnd, warnings:p.reviewWarnings })),
}, null, 2));
