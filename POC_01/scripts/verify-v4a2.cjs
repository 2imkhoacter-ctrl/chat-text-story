const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { probeDuration } = require('./segment-audio.cjs');
const { buildPhraseTimeline } = require('../src/phrase-timeline.cjs');
const root = path.resolve(__dirname, '..');
const config = { ...require('../video.config.json'), ...require('../video.v4a2.config.json') };
const read = (file) => JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
const alignment = read(`${config.generatedAudioDir}/alignment-manifest.json`);
const manifest = read(config.timingManifest);
const original = read(config.baselineAlignment);
const script = fs.readFileSync(path.resolve(root, config.script), 'utf8').split(/\r?\n/).filter((line) => line.trim());
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root, file))).digest('hex');
assert.equal(hash(config.script), original.scriptSha256);
assert.equal(hash(config.cachedWords), original.wordsSha256);
assert.equal(alignment.status, 'VALIDATED');
assert.deepEqual(alignment.globalValidationErrors, []);
assert.equal(alignment.safeAnchors, 61);
assert.equal(alignment.autoResolved, 36);
assert.equal(alignment.flagged, 0);
assert.equal(manifest.phrases.length, script.length);
assert.equal(script.length, 97);
const files = fs.readdirSync(path.resolve(root, config.generatedAudioDir)).filter((name) => /^voice_\d+\.wav$/.test(name));
assert.equal(files.length, 97);
let lastWord = -1;
for (let i = 0; i < manifest.phrases.length; i++) {
  const p = manifest.phrases[i];
  const a = alignment.phrases[i];
  assert.equal(p.text, script[i]);
  assert.equal(p.audioFile, `voice_${String(i + 1).padStart(3, '0')}.wav`);
  if (original.phrases[i].status === 'SAFE') assert.deepEqual(a, original.phrases[i]);
  assert.ok(p.whisperWordIndices[0] > lastWord);
  lastWord = p.whisperWordIndices.at(-1);
  const file = path.resolve(root, 'public', p.relativeAudioFile);
  const wav = fs.readFileSync(file);
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.ok(p.clipDuration > 0);
  assert.ok(Math.abs(probeDuration(file) - p.clipDuration) < 1e-8);
  assert.ok(Math.abs(p.clipDuration - (p.sourceEnd - p.sourceStart)) < 0.0001);
  if (i) {
    assert.ok(p.sourceStart >= manifest.phrases[i - 1].sourceEnd);
    assert.ok(p.timelineStart > manifest.phrases[i - 1].timelineEnd);
  }
}
const options = { initialMargin: config.initialMarginSeconds, normalGap: config.defaultPauseAfterSeconds, maskStops: config.maskStops.map((s) => s.y) };
const baseline = buildPhraseTimeline(manifest, options);
const holdTest = buildPhraseTimeline(manifest, { ...options, pauses: { 'Phrase 2': 2 } });
for (let i = 0; i < baseline.phrases.length; i++) {
  assert.ok(Math.abs(holdTest.phrases[i].timelineStart - baseline.phrases[i].timelineStart - (i > 1 ? 2 : 0)) < 1e-8);
  assert.equal(holdTest.phrases[i].clipDuration, baseline.phrases[i].clipDuration);
  if (i < baseline.phrases.length - 1) {
    assert.ok(Math.abs(holdTest.phrases[i].transitionEnd - holdTest.phrases[i].transitionStart - options.normalGap) < 1e-8);
  }
}
assert.ok(Math.abs(holdTest.phrases[1].transitionStart - holdTest.phrases[1].timelineEnd - 2) < 1e-8);
const frames = (m) => Math.ceil((m.durationSeconds + config.endMarginSeconds) * config.fps);
assert.equal(frames(holdTest) - frames(baseline), 60);
const summary = { status: 'PASS', safe: 61, autoResolved: 36, remainingReview: 0, wavFiles: files.length,
  shortestClipSeconds: Math.min(...manifest.phrases.map((p) => p.clipDuration)),
  defaultDurationSeconds: frames(baseline) / config.fps, defaultFrames: frames(baseline), holdTestFrames: frames(holdTest),
  finalVoiceEnd: baseline.durationSeconds, phrase2HoldTest: {voiceEnd:holdTest.phrases[1].timelineEnd, holdEnd:holdTest.phrases[1].holdEnd, nextVoiceStart:holdTest.phrases[2].timelineStart},
};
fs.writeFileSync(path.resolve(root, config.generatedAudioDir, 'validation.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
