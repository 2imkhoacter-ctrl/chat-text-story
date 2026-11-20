// Production promotion is allowed only for a completely validated alignment.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { extractClip, probeDuration } = require('./segment-audio.cjs');
const { buildPhraseTimeline } = require('../src/phrase-timeline.cjs');
const root = path.resolve(__dirname, '..');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const finalize = () => {
  const config = { ...require('../video.config.json'), ...require('../video.v4a2.config.json') };
  const output = path.resolve(root, config.generatedAudioDir);
  const indexFile = path.join(root, 'src/index.jsx');
  const oldIndex = fs.readFileSync(indexFile, 'utf8');
  const rootAnchor = 'return React.createElement(React.Fragment, null, legacy, v4a);';
  if (!oldIndex.includes('v4a2-registration') && !oldIndex.includes(rootAnchor)) throw new Error('Root changed; review registration before promotion.');
  const alignment = JSON.parse(fs.readFileSync(path.join(output, 'alignment-manifest.json'), 'utf8'));
  if (alignment.status !== 'VALIDATED' || alignment.flagged !== 0 || alignment.globalValidationErrors.length || alignment.safelyAligned !== config.expectedPhraseCount) {
    throw new Error(`REVIEW NEEDED: ${alignment.safelyAligned}/${config.expectedPhraseCount} safe, ${alignment.flagged} flagged. No WAV generation or Remotion activation. See alignment-review.json.`);
  }
  if (hash(path.resolve(root, config.audio)) !== alignment.sourceSha256 || hash(path.resolve(root, config.script)) !== alignment.scriptSha256 || hash(path.resolve(root, config.cachedWords)) !== alignment.wordsSha256 || hash(path.resolve(root, config.baselineAlignment)) !== alignment.anchorBaselineSha256) {
    throw new Error('Inputs changed after alignment. Re-run alignment before extracting clips.');
  }
  const inputDuration = probeDuration(path.resolve(root, config.audio));
  const baseline = JSON.parse(fs.readFileSync(path.resolve(root, config.baselineAlignment), 'utf8'));
  const script = fs.readFileSync(path.resolve(root, config.script), 'utf8').split(/\r?\n/).filter((line) => line.trim());
  if (script.length !== config.expectedPhraseCount) throw new Error('Script phrase count mismatch');
  if (alignment.phrases.length !== config.expectedPhraseCount) throw new Error('Phrase count mismatch');
  for (let index = 0; index < alignment.phrases.length; index++) {
    const phrase = alignment.phrases[index];
    const previous = alignment.phrases[index - 1];
    const anchor = baseline.phrases[index];
    if (anchor.status === 'SAFE' && JSON.stringify(phrase) !== JSON.stringify(anchor)) throw new Error(`Confirmed anchor ${index + 1} changed`);
    if (phrase.status === 'AUTO-RESOLVED' && (!(phrase.confidence >= config.minimumLexicalScore) || (phrase.partitionMargin !== null && phrase.partitionMargin < config.minimumPartitionMargin) || !phrase.resolutionReasons.length || phrase.start < phrase.anchorWindow[0] || phrase.end > phrase.anchorWindow[1])) throw new Error(`Unproven resolution for ${index + 1}`);
    if (phrase.text !== script[index] || !['SAFE', 'AUTO-RESOLVED'].includes(phrase.status) || phrase.reviewReasons.length || !(Number.isFinite(phrase.start) && Number.isFinite(phrase.end) && phrase.start >= 0 && phrase.end > phrase.start && phrase.end <= inputDuration) || (previous && phrase.start < previous.end)) {
      throw new Error(`Invalid or unsafe boundary for phrase ${index + 1}`);
    }
  }
  const phrases = alignment.phrases.map((entry, index) => {
    const phrase = { ...entry, label: entry.text, audioFile: entry.audio, sourceStart: entry.start, sourceEnd: entry.end,
      relativeAudioFile: `${config.generatedAudioDir.replace(/^public\//, '')}/${entry.audio}`,
      pauseAfter: config.phrasePauses[entry.id] ?? 0,
      maskStopY: config.maskStops[Math.min(index, config.maskStops.length - 1)].y,
      maskStatus: index < config.maskStops.length ? config.maskStops[index].status : 'unmapped-hold-last',
    };
    const destination = path.join(output, entry.audio);
    extractClip(config, phrase, destination);
    phrase.clipDuration = probeDuration(destination);
    if (!(phrase.clipDuration > 0)) throw new Error(`Empty WAV: ${entry.audio}`);
    if (Math.abs(phrase.clipDuration - (entry.end - entry.start)) > 0.0001) throw new Error(`Unexpected WAV duration: ${entry.audio}`);
    return phrase;
  });
  const manifest = buildPhraseTimeline({ timelineModel: 'voice-hold-gap-v1', alignmentVersion: 'v4a2',
    validationStatus: 'VALIDATED', expectedPhraseCount: config.expectedPhraseCount,
    sourceAudio: config.audio, sourceDurationSeconds: inputDuration, initialMarginSeconds: config.initialMarginSeconds,
    runtime: alignment.runtime, phrases,
  }, { initialMargin: config.initialMarginSeconds, normalGap: config.defaultPauseAfterSeconds });
  fs.writeFileSync(path.resolve(root, config.timingManifest), `${JSON.stringify(manifest, null, 2)}\n`);
  const nodes = phrases.map((_, i) => `    React.createElement(Audio, {key: phrases[${i}].id, name: phrases[${i}].label, src: staticFile(phrases[${i}].relativeAudioFile), from: phrases[${i}].timelineStart * fps, durationInFrames: phrases[${i}].clipDuration * fps})`);
  fs.writeFileSync(path.join(root, 'src/v4a2-audio.jsx'), `// Generated only after safe script alignment. No hard-coded start times.\nconst React = require('react');\nconst { Audio } = require('@remotion/media');\nconst { staticFile, useVideoConfig } = require('remotion');\nmodule.exports = ({phrases}) => {const {fps} = useVideoConfig(); return React.createElement(React.Fragment, null,\n${nodes.join(',\n')}\n);};\n`);
  fs.writeFileSync(path.join(root, 'src/v4a2-registration.jsx'), `// Generated only after the alignment production gate passes.\nconst React = require('react');\nconst {z} = require('zod');\nconst AudioTimeline = require('./v4a2-audio.jsx');\nmodule.exports = (base, schema) => {\n  const config = {...require('../video.config.json'), ...require('../video.v4a2.config.json')};\n  const manifest = require('../public/generated-audio-v4a2/timing-manifest.json');\n  if (manifest.validationStatus !== 'VALIDATED' || manifest.phrases.length !== config.expectedPhraseCount) throw new Error('V4A.2 manifest is not validated');\n  const SharedStory = base.props.component;\n  const AlignedStory = (props) => React.createElement(SharedStory, {...props, phraseAudioComponent: AudioTimeline});\n  const pauses = Object.fromEntries(manifest.phrases.map((p,i)=>['Phrase '+(i+1), config.phrasePauses[p.id] ?? p.pauseAfter ?? 0]));\n  return React.cloneElement(base, {id:'ChatTextStory-V4A2', component:AlignedStory, schema:schema.extend({'Pause After':z.object(Object.fromEntries(manifest.phrases.map((_,i)=>['Phrase '+(i+1),z.number().min(0).max(300).step(0.01)])))}), durationInFrames:Math.ceil((manifest.durationSeconds+config.endMarginSeconds)*config.fps), defaultProps:{...base.props.defaultProps,config,manifest,'Pause After':pauses}});\n};\n`);
  if (!oldIndex.includes('v4a2-registration')) {
    const newIndex = oldIndex.replace('  const audios = manifest.timelineModel', '  const PhraseAudioTimeline = props.phraseAudioComponent || V4AAudioTimeline;\n  const audios = manifest.timelineModel')
      .replace('React.createElement(V4AAudioTimeline,', 'React.createElement(PhraseAudioTimeline,')
      .replace(rootAnchor, "const v4a2 = require('./v4a2-registration.jsx')(legacy, calibrationSchema);\n  return React.createElement(React.Fragment, null, legacy, v4a, v4a2);");
    fs.writeFileSync(path.join(root, 'out/v4a2-before-index.jsx'), oldIndex);
    fs.writeFileSync(indexFile, newIndex);
  }
  console.log(`Validated ${phrases.length} independent WAVs; ChatTextStory-V4A2 registered. Existing voice/hold/gap logic unchanged.`);
  return manifest;
};

if (require.main === module) {
  try { finalize(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { finalize };
