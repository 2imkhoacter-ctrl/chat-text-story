// Re-extract existing mappings only; no recognition, alignment, or UI changes.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { extractClip, probeDuration } = require('./segment-audio.cjs');
const { buildPhraseTimeline } = require('../src/phrase-timeline.cjs');
const root = path.resolve(__dirname, '..');
const config = { ...require('../video.config.json'), ...require('../video.v4a2.config.json') };
const output = path.resolve(root, config.generatedAudioDir);
const manifestFile = path.resolve(root, config.timingManifest);
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const aligned = JSON.parse(fs.readFileSync(path.join(output, 'alignment-manifest.json'), 'utf8'));
const duration = probeDuration(path.resolve(root, config.audio));
const extra = 0.07;
const round = (v) => Number(v.toFixed(6));
assert.equal(aligned.status, 'VALIDATED');
assert.equal(aligned.phrases.length, 97);
assert.equal(manifest.phrases.length, 97);
const changes = aligned.phrases.map((p, i, all) => {
  const previous = all[i - 1];
  const next = all[i + 1];
  assert.equal(p.id, manifest.phrases[i].id);
  assert.equal(p.text, manifest.phrases[i].text);
  // Split available inter-phrase silence equally; never enter a neighbor's
  // existing aligned interval. Use immutable alignment cuts for idempotence.
  const left = previous ? (previous.end + p.start) / 2 : 0;
  const right = next ? (p.end + next.start) / 2 : duration;
  const sourceStart = round(Math.max(0, left, p.start - extra));
  const sourceEnd = round(Math.min(duration, right, p.end + extra));
  assert.ok(sourceStart <= p.start && sourceEnd >= p.end && sourceEnd > sourceStart);
  return { id: p.id, sourceStart, sourceEnd,
    addedHeadSeconds: round(p.start - sourceStart), addedTailSeconds: round(sourceEnd - p.end) };
});
for (let i = 1; i < changes.length; i++) assert.ok(changes[i].sourceStart >= changes[i - 1].sourceEnd);
fs.writeFileSync(path.join(root, 'out/v4a2-before-extra-handles-manifest.json'), fs.readFileSync(manifestFile));
for (let i = 0; i < changes.length; i++) {
  const p = manifest.phrases[i];
  const c = changes[i];
  const destination = path.join(output, p.audioFile);
  extractClip(config, { ...p, ...c }, destination);
  const clipDuration = probeDuration(destination);
  assert.ok(clipDuration > 0 && Math.abs(clipDuration - (c.sourceEnd - c.sourceStart)) < 0.0001);
  Object.assign(p, { sourceStart: c.sourceStart, sourceEnd: c.sourceEnd, clipDuration,
    extraHeadHandleSeconds: c.addedHeadSeconds, extraTailHandleSeconds: c.addedTailSeconds });
}
// Keep the same VOICE → HOLD → GAP function; synchronize its input durations
// with the longer WAVs so playback cannot truncate the newly retained audio.
const updated = buildPhraseTimeline(manifest, {
  initialMargin: manifest.initialMarginSeconds, normalGap: config.defaultPauseAfterSeconds,
});
updated.extraExtractionHandlesSeconds = extra;
fs.writeFileSync(manifestFile, `${JSON.stringify(updated, null, 2)}\n`);
const files = fs.readdirSync(output).filter((name) => /^voice_\d{3}\.wav$/.test(name));
assert.equal(files.length, 97);
for (let i = 1; i <= 97; i++) assert.ok(files.includes(`voice_${String(i).padStart(3, '0')}.wav`));
const result = { status: 'PASS', wavCount: files.length, requestedExtraHeadSeconds: extra, requestedExtraTailSeconds: extra,
  headClamped: changes.filter((p) => p.addedHeadSeconds < extra - 1e-6).length,
  tailClamped: changes.filter((p) => p.addedTailSeconds < extra - 1e-6).length, changes };
fs.writeFileSync(path.join(root, 'out/v4a2-extra-handles-validation.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, wavCount: result.wavCount, headClamped: result.headClamped, tailClamped: result.tailClamped }));
