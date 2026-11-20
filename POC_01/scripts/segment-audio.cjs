const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const absolute = (file) => path.resolve(root, file);
const publicRelative = (file) => file.replace(/^public[\\/]/, '').replace(/\\/g, '/');

const loadConfig = () => JSON.parse(fs.readFileSync(absolute('video.config.json'), 'utf8'));
const round = (value) => Number(value.toFixed(6));
// Reuse the FFmpeg tools installed with this Windows Remotion project.
const toolDir = require('@remotion/compositor-win32-x64-msvc').dir;
const runTool = (name, args, options = {}) => {
  const result = spawnSync(path.join(toolDir, `${name}.exe`), args, options);
  if (result.error) throw new Error(`${name}: ${result.error.message}`);
  return result;
};

const parseSilences = (stderr) => {
  const starts = [...stderr.matchAll(/silence_start: ([0-9.]+)/g)].map((m) => Number(m[1]));
  const ends = [...stderr.matchAll(/silence_end: ([0-9.]+) \| silence_duration: ([0-9.]+)/g)].map((m) => ({ end: Number(m[1]), duration: Number(m[2]) }));
  if (starts.length !== ends.length) throw new Error('Unexpected silencedetect output; use sourceBoundary overrides.');
  return starts.map((start, i) => ({ start, end: ends[i].end, duration: ends[i].duration })).filter((s) => s.end > s.start);
};

const probeDuration = (file) => {
  const result = runTool('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `ffprobe failed for ${file}`);
  return Number(result.stdout.trim());
};

const detectPhraseRanges = (config, duration) => {
  const result = runTool('ffmpeg', ['-hide_banner', '-i', absolute(config.audio), '-af', `silencedetect=noise=${config.silenceThresholdDb}dB:d=${config.minimumSilenceDurationSeconds}`, '-f', 'null', 'NUL'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'FFmpeg silence detection failed');
  const silences = parseSilences(result.stderr);
  const leadingSilence = silences.find((silence) => silence.start <= 0.001);
  const trailingSilence = silences.find((silence) => silence.end >= duration - 0.02);
  const internal = silences.filter((silence) => silence.start > 0.001 && silence.end < duration - 0.02);
  const ranges = [];
  let cursor = leadingSilence ? leadingSilence.end : 0;
  for (const silence of internal) {
    if (silence.start > cursor) ranges.push({ start: cursor, end: silence.start });
    cursor = silence.end;
  }
  const end = trailingSilence ? trailingSilence.start : duration;
  if (end > cursor) ranges.push({ start: cursor, end });
  return ranges.filter((range) => range.end - range.start > 0.02);
};

const extractClip = (config, clip, output) => {
  const args = ['-y', '-hide_banner', '-loglevel', 'error', '-ss', String(clip.sourceStart), '-i', absolute(config.audio), '-t', String(clip.sourceEnd - clip.sourceStart), '-map', '0:a:0', '-c:a', 'pcm_s16le', output];
  const result = runTool('ffmpeg', args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`FFmpeg clip extraction failed for ${clip.id}`);
};

const buildManifest = (config, duration, ranges) => {
  const expected = config.phrases.length;
  if (ranges.length !== expected || config.maskStops.length !== expected) {
    throw new Error(`Detected ${ranges.length} phrases but config has ${expected} phrases and ${config.maskStops.length} mask stops. Provide sourceBoundary overrides or update config.`);
  }
  let cursor = config.initialMarginSeconds;
  const phrases = config.phrases.map((entry, index) => {
    const detected = ranges[index];
    const boundary = entry.sourceBoundary || {};
    const sourceStart = boundary.start ?? detected.start;
    const sourceEnd = boundary.end ?? detected.end;
    if (!(sourceStart >= 0 && sourceEnd > sourceStart && sourceEnd <= duration)) {
      throw new Error(`Invalid source boundary for ${entry.id}`);
    }
    const clipDuration = round(sourceEnd - sourceStart);
    const pauseAfter = index === config.phrases.length - 1 ? 0 : (entry.pauseAfterSeconds ?? config.defaultPauseAfterSeconds);
    const phrase = {
      id: entry.id,
      label: entry.label || `Phrase ${index + 1}`,
      audioFile: `voice_${String(index + 1).padStart(3, '0')}.wav`,
      sourceStart: round(sourceStart),
      sourceEnd: round(sourceEnd),
      clipDuration,
      timelineStart: round(cursor),
      timelineEnd: round(cursor + clipDuration),
      pauseAfter,
      maskStopY: config.maskStops[index].y,
      maskStatus: config.maskStops[index].status || 'placeholder',
      sourceBoundaryOverride: entry.sourceBoundary || null,
    };
    cursor += clipDuration + pauseAfter;
    return phrase;
  });
  return {
    generatedAt: new Date().toISOString(),
    sourceAudio: config.audio,
    initialMarginSeconds: config.initialMarginSeconds,
    defaultPauseAfterSeconds: config.defaultPauseAfterSeconds,
    silenceThresholdDb: config.silenceThresholdDb,
    minimumSilenceDurationSeconds: config.minimumSilenceDurationSeconds,
    durationSeconds: round(cursor),
    phrases,
  };
};

const segment = (config = loadConfig()) => {
  const source = absolute(config.audio);
  const outputDir = absolute(config.generatedAudioDir);
  const manifestPath = absolute(config.timingManifest);
  const duration = probeDuration(source);
  const ranges = detectPhraseRanges(config, duration);
  const manifest = buildManifest(config, duration, ranges);
  fs.mkdirSync(outputDir, { recursive: true });
  for (const phrase of manifest.phrases) {
    extractClip(config, phrase, path.join(outputDir, phrase.audioFile));
    phrase.relativeAudioFile = publicRelative(path.relative(absolute('public'), path.join(outputDir, phrase.audioFile)));
    phrase.clipDuration = round(probeDuration(path.join(outputDir, phrase.audioFile)));
    phrase.timelineEnd = round(phrase.timelineStart + phrase.clipDuration);
  }
  let cursor = config.initialMarginSeconds;
  for (const phrase of manifest.phrases) {
    phrase.timelineStart = round(cursor);
    phrase.timelineEnd = round(cursor + phrase.clipDuration);
    cursor = phrase.timelineEnd + phrase.pauseAfter;
  }
  manifest.durationSeconds = round(manifest.phrases.at(-1).timelineEnd);
  manifest.timeline = manifest.phrases.map((phrase) => ({
    id: phrase.id,
    audioFile: phrase.audioFile,
    sourceStart: phrase.sourceStart,
    sourceEnd: phrase.sourceEnd,
    clipDuration: phrase.clipDuration,
    timelineStart: phrase.timelineStart,
    timelineEnd: phrase.timelineEnd,
    pauseAfter: phrase.pauseAfter,
    maskStopY: phrase.maskStopY,
    sourceBoundaryOverride: phrase.sourceBoundaryOverride,
  }));
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
};

const testTimelineShift = () => {
  const config = loadConfig();
  const duration = probeDuration(absolute(config.audio));
  const ranges = detectPhraseRanges(config, duration);
  const baseline = buildManifest(config, duration, ranges);
  const shiftedConfig = JSON.parse(JSON.stringify(config));
  shiftedConfig.phrases[2].pauseAfterSeconds = 0.8;
  const shifted = buildManifest(shiftedConfig, duration, ranges);
  const index = 3;
  const delta = round(shifted.phrases[index].timelineStart - baseline.phrases[index].timelineStart);
  if (delta !== 0.7) throw new Error(`Expected downstream shift 0.7s, got ${delta}s`);
  return { baselinePhrase4Start: baseline.phrases[index].timelineStart, shiftedPhrase4Start: shifted.phrases[index].timelineStart, shift: delta };
};

if (require.main === module) {
  const manifest = segment();
  const check = testTimelineShift();
  console.log(`Generated ${manifest.phrases.length} clips; manifest=${path.relative(root, absolute(loadConfig().timingManifest))}`);
  console.log(`Pause-shift test: phrase 4 ${check.baselinePhrase4Start}s -> ${check.shiftedPhrase4Start}s (+${check.shift}s)`);
}

module.exports = { segment, testTimelineShift, probeDuration, detectPhraseRanges, extractClip };
