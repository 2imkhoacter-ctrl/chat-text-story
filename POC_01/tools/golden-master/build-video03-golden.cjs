const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '../..');
const episode = path.join(root, 'episodes/girlfriend03');
const stamp = '20261028';
const goldenRoot = path.join(root, 'golden-masters', `girlfriend03-approved-${stamp}`);
const frozenEpisode = path.join(goldenRoot, 'episode');
const docsRoot = path.join(root, 'docs', 'chat-text-story-system');
const testRoot = path.join(root, 'reconstruction-tests', `girlfriend03-${stamp}`);
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const posix = (value) => value.split(path.sep).join('/');
const mkdir = (dir) => fs.mkdirSync(dir, {recursive: true});
const write = (file, value) => { mkdir(path.dirname(file)); fs.writeFileSync(file, value); };

if (fs.existsSync(goldenRoot) || fs.existsSync(testRoot)) {
  throw new Error('Golden Master or reconstruction test already exists; refusing to overwrite.');
}

const approvedProps = readJson(path.join(episode, 'presets/girlfriend03-approved-props.json'));
const exportedProps = readJson(path.join(episode, 'my props.txt'));
if (sha256(path.join(episode, 'presets/girlfriend03-approved-props.json')) !== sha256(path.join(episode, 'my props.txt'))) {
  throw new Error('Props export differs from approved preset; stop before snapshot.');
}
if (approvedProps['Normal Gap'] !== 0) throw new Error('Normal Gap is not zero.');

const copyRoots = ['src', 'data', 'public', 'presets', 'scripts'];
mkdir(frozenEpisode);
for (const name of copyRoots) fs.cpSync(path.join(episode, name), path.join(frozenEpisode, name), {recursive: true});
for (const name of ['package.json', 'video.config.json', 'README.md', 'EPISODE03_MASTER_SPEC.md', 'my props.txt']) {
  fs.copyFileSync(path.join(episode, name), path.join(frozenEpisode, name));
}

const walk = (dir) => fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const manifest = walk(frozenEpisode).sort().map((file) => ({
  path: posix(path.relative(frozenEpisode, file)), bytes: fs.statSync(file).size, sha256: sha256(file),
}));
write(path.join(goldenRoot, 'SHA256_MANIFEST.json'), JSON.stringify({version: 1, approvedAt: '2026-10-28', files: manifest}, null, 2) + '\n');
write(path.join(goldenRoot, 'SHA256SUMS.txt'), manifest.map(x => `${x.sha256}  episode/${x.path}`).join('\n') + '\n');

const active = readJson(path.join(episode, 'public/capcut-tts/active.json'));
const timeline = readJson(path.join(episode, 'data/timeline.json'));
const processing = readJson(path.join(episode, 'data/audio-processing.json'));
const volumes = readJson(path.join(episode, 'data/tts-volume.json'));
const sfxPlan = readJson(path.join(episode, 'data/sfx-plan.json'));
const chat = readJson(path.join(episode, 'data/chat-events.json'));
const config = readJson(path.join(episode, 'video.config.json'));
const voices = timeline.phrases.filter(x => x.type === 'VOICE').map((voice) => {
  const proc = processing.files.find(x => x.voiceIndex === voice.voice_index);
  const volume = volumes.files.find(x => x.voiceIndex === voice.voice_index);
  return {
    voiceIndex: voice.voice_index, eventId: voice.event_id,
    speaker: /\.mp3$/i.test(proc?.sourceFile ?? '') ? 'multi_female_skye_uranus_bigtts' : 'unresolved_capcut_voice_id',
    text: voice.text, screenshot: voice.screenshot, sourceFile: proc?.sourceFile ?? voice.sourceWav,
    processedFile: voice.relativeAudioFile, processedSha256: voice.sha256,
    speed: proc?.speed ?? voice.speed, speedLevels: proc?.speedLevels ?? null,
    gain: volume?.gain, compositionVolume: volume?.compositionVolume, audioVolume: volume?.audioVolume,
    sourceStart: proc?.sourceStart, sourceDuration: proc?.sourceDuration,
    preTrimTempoDuration: proc?.preTrimTempoDuration, processedDuration: voice.processedDuration,
    detectedLeadingSilence: proc?.detectedLeadingSilence, removedLeadingSeconds: proc?.removedLeadingSeconds,
    detectedTrailingSilence: proc?.detectedTrailingSilence, removedTrailingSeconds: proc?.removedTrailingSeconds,
    retainedLeadingSilenceSeconds: voice.retainedLeadingSilenceSeconds,
    retainedTrailingSilenceSeconds: voice.retainedTrailingSilenceSeconds,
    timelineStart: voice.timelineStart, timelineEnd: voice.timelineEnd, durationInFrames: voice.durationInFrames,
    pauseAfter: approvedProps['Pause After'][`Phrase ${voice.voice_index}`], timelineGapSeconds: voice.timelineGapSeconds,
    playbackRate: 1,
  };
});
const myVoices = voices.filter(x => x.speaker === 'multi_female_skye_uranus_bigtts');
const approvedState = {
  version: 1, status: 'GOLDEN_MASTER_USER_APPROVED', compositionId: 'ChatTextStory-Girlfriend-03',
  dimensions: {width: 1080, height: 1920, fps: 30, durationSeconds: timeline.durationSeconds, durationInFrames: Math.ceil(timeline.durationSeconds * 30)},
  props: approvedProps, propsSha256: sha256(path.join(episode, 'presets/girlfriend03-approved-props.json')),
  voices, screenshots: active.mapping.screenshots, imageEvents: chat.events.filter(x => x.type === 'IMAGE'),
  sfxAssets: sfxPlan.assets, sfxCues: timeline.sfx,
  background: {gameplay: config.gameplay, gameplayGain: 0.33884415613920255, gameplayDb: -9.4, loop: true, objectFit: 'cover', startFrame: 0,
    music: config.backgroundMusic, musicGain: 0.5011872336272722, musicAdditionalDb: -6, loop: 'crossfade'},
  policies: timeline.audioPolicy, sfxPolicy: timeline.sfxPolicy,
  myFinalState: {speaker: 'multi_female_skye_uranus_bigtts', count: myVoices.length,
    retainedExtraTailCutTexts: ['Ồ', 'Thế để công bằng'], restoredOtherCount: myVoices.length - 2,
    rule: 'Preserve the frozen processed WAV hashes; never recreate this state by rerunning trim.'},
};
write(path.join(goldenRoot, 'VIDEO03_APPROVED_STATE.json'), JSON.stringify(approvedState, null, 2) + '\n');

const sfxRules = {
  version: 1,
  definitions: {
    'BOOM': {mode: 'TAIL', timingFormula: 'voice.timelineStart + boundaryAnalysis.decayStartSeconds', overlapSpeech: true, crossNextVoice: true, preserveFullDuration: true, implicitGapAfterSeconds: 0},
    'AMONGUS': {mode: 'OVERLAY', timingFormula: 'explicit approved trigger anchored to event', overlapSpeech: true, crossNextVoice: true, preserveFullDuration: true, implicitGapAfterSeconds: 0},
    'AMONGUS TRẦM': {mode: 'OVERLAY', timingFormula: 'explicit approved trigger anchored to event', overlapSpeech: true, crossNextVoice: true, preserveFullDuration: true, implicitGapAfterSeconds: 0},
    'MONEY': {mode: 'TAIL', timingFormula: 'voice.timelineStart + boundaryAnalysis.decayStartSeconds', overlapSpeech: true, crossNextVoice: true, preserveFullDuration: true, implicitGapAfterSeconds: 0},
    'CAT HUH': {mode: 'TAIL', timingFormula: 'voice.timelineStart + boundaryAnalysis.decayStartSeconds', overlapSpeech: true, crossNextVoice: true, preserveFullDuration: true, implicitGapAfterSeconds: 0, approvedAsset: 'sfx/Cat huh-trimmed.wav'},
    'TIẾNG ĐÁNH RẮM': {mode: 'TAIL', timingFormula: 'voice.timelineStart + boundaryAnalysis.decayStartSeconds', overlapSpeech: true, crossNextVoice: true, preserveFullDuration: true, implicitGapAfterSeconds: 0},
    'HỖN LOẠN': {mode: 'TAIL_IN_VIDEO03', timingFormula: 'voice.timelineStart + boundaryAnalysis.decayStartSeconds; independent of BOOM', overlapSpeech: true, crossNextVoice: true, preserveFullDuration: true, implicitGapAfterSeconds: 0},
    'TING MES': {mode: 'IMAGE_EVENT', timingFormula: 'imageEvent.timelineStart', overlapSpeech: true, crossNextVoice: true, preserveFullDuration: true, implicitGapAfterSeconds: 0},
  }, assets: sfxPlan.assets, approvedVideo03Cues: timeline.sfx,
  video03FinalException: {voiceIndex: 76, text: 'Là trả đồ cho 3 bọn tao', allowedEffects: ['HỖN LOẠN'], forbiddenEffects: ['BOOM'], forbiddenFormula: 'chaosStart = boomStart + boomDuration * 2/3'},
};
write(path.join(docsRoot, 'SFX_CATALOG.json'), JSON.stringify(sfxRules, null, 2) + '\n');

const voiceRows = voices.map(x => `| ${x.voiceIndex} | ${x.speaker ?? 'unknown'} | ${x.text.replaceAll('|','\\|')} | ${x.speed} | ${x.gain} | ${x.timelineStart.toFixed(6)} | ${x.processedDuration.toFixed(6)} | ${x.pauseAfter} | \`${x.processedSha256}\` |`).join('\n');
const cueRows = timeline.sfx.map(x => `| ${x.effect} | ${x.eventId} | ${x.mode} | ${x.timelineStart.toFixed(6)} | ${(x.timelineEnd-x.timelineStart).toFixed(6)} | ${x.gain ?? 1} |`).join('\n');
write(path.join(docsRoot, 'VIDEO03_APPROVED_SPEC.md'), `# Video 03 Approved Spec\n\nStatus: **Golden Master approved by user on 2026-10-28**. Runtime JSON and frozen hashes are authoritative; older prose manifests may be stale.\n\n- Composition: \`ChatTextStory-Girlfriend-03\`, 1080×1920, 30 fps\n- Duration: ${timeline.durationSeconds}s / ${Math.ceil(timeline.durationSeconds*30)} frames\n- Props hash: \`${approvedState.propsSha256}\`; Normal Gap: 0\n- Voices: ${voices.length}; screenshots: ${active.mapping.screenshots.length}; image events: ${approvedState.imageEvents.length}; SFX cues: ${timeline.sfx.length}\n- Audio playback: processed WAV, per-clip gain, \`playbackRate=1\`; never apply atempo or gain again.\n- My: ${myVoices.length} clips. Only “Ồ” and “Thế để công bằng” retain the special 0.30s tail cut; preserve hashes.\n- Final line “Là trả đồ cho 3 bọn tao”: HỖN LOẠN only, no BOOM.\n\n## Voices\n\n| # | Speaker | Text | Speed | Gain | Start (s) | WAV duration (s) | Pause After | SHA-256 |\n|---:|---|---|---:|---:|---:|---:|---:|---|\n${voiceRows}\n\n## SFX cues\n\n| Effect | Event | Mode | Start (s) | Duration (s) | Gain |\n|---|---|---|---:|---:|---:|\n${cueRows}\n\nAll visual coordinates, 12 screenshot offsets, 79 masks and 76 Pause After values are stored losslessly in \`VIDEO03_APPROVED_STATE.json\`.\n`);

write(path.join(docsRoot, 'SFX_CATALOG.md'), `# SFX Catalog\n\nMachine-readable companion: \`SFX_CATALOG.json\`. Asset hashes/durations and all 19 approved Video 03 cues are stored there.\n\n- **BOOM / TAIL:** start at measured final-syllable decay, overlap speech, no implicit gap, play full duration.\n- **AMONGUS / OVERLAY:** explicit event trigger; overlap and continue across following dialogue.\n- **AMONGUS TRẦM / OVERLAY:** same behavior, distinct source asset.\n- **MONEY / TAIL:** final-syllable decay trigger; no extra 0.15s delay.\n- **CAT HUH / TAIL:** approved trimmed asset, gap after = 0; dialogue does not wait for SFX.\n- **TIẾNG ĐÁNH RẮM / TAIL:** decay trigger, no implicit gap.\n- **HỖN LOẠN:** independent SFX; may overlap and must play fully. In Video 03 voice 76 it starts on “tao” decay, with no BOOM and no 2/3-BOOM formula.\n- **TING MES / IMAGE EVENT:** only on explicitly configured send-image/notification events.\n\nGeneral rules describe reusable behavior; \`approvedVideo03Cues\` records episode-specific decisions and timestamps.\n`);

write(path.join(docsRoot, 'SYSTEM_RULES.md'), `# Chat Text Story System Rules\n\n1. Read the episode input, this documentation set, and existing runtime configuration before building. Never infer approved values from an older prose manifest.\n2. Preserve source TTS. Process speed once with FFmpeg \`atempo\`, preserve pitch, then trim conservatively. Render processed files at \`playbackRate=1\`.\n3. Apply CapCut per-clip gain once in Remotion; metadata volume is a linear multiplier unless proven otherwise. Never normalize automatically.\n4. Leading trim must not remove speech. Trailing trim retains at most 0.15s after the measured end of speech, unless an episode-specific approved exception exists.\n5. Timeline is derived from actual processed duration, Normal Gap and explicit Pause After exactly once. No hidden or duplicated gaps.\n6. Screenshot, bubble, reveal and overlay move together under per-screenshot Y offset. Bubble Mask Y changes only the mask edge.\n7. SFX uses semantic anchors and formulas in \`SFX_CATALOG.json\`; it may overlap speech and must not reserve dialogue time unless explicitly configured.\n8. Gameplay starts frame 0, cover-crops and loops. Music is a separate looping track. Episode-specific gains come from input/config.\n9. Optional capabilities such as Zoom are disabled unless requested.\n10. Before handoff validate counts, hashes, durations, timing, clipping risk, assets and composition. Never claim listening/visual approval without a human review.\n\nForbidden regressions: double atempo, double gain, global 2× speed, fixed-end trim mistaken for speech-end trim, duplicate Normal Gap, SFX delay based on WAV end, applying one screen offset to all screens, overwriting Studio Props, or rebuilding an approved Golden Master.\n`);

write(path.join(docsRoot, 'MASTER_BUILD_PROMPT.md'), `# Master Build Prompt\n\nBuild a new ChatTextStory episode from the completed \`EPISODE_INPUT_TEMPLATE.md\`. Before changing files, read \`SYSTEM_RULES.md\`, \`SFX_CATALOG.md\`, \`SKILL_REGISTRY.md\`, and the target episode's approved/input configuration. Treat episode-specific Video 03 choices as examples, not global defaults.\n\nRequired workflow: inventory inputs → protect/export current Props → map script/screens/audio → extract per-clip CapCut speed and volume → process speed once → conservative speech-boundary trim → construct timeline from actual durations and explicit gaps → place visuals → apply semantic SFX triggers → add gameplay/music → validate hashes/counts/frame timing/composition → request manual audiovisual approval.\n\nNever regenerate TTS, run Whisper, normalize gain, apply playback speed twice, invent missing assets, rebuild shared engine, or render a full MP4 unless the episode request explicitly authorizes it. Stop if Props or sources cannot be captured safely.\n\nDeliver the validation report and list any checks requiring human ears/eyes.\n`);

write(path.join(docsRoot, 'EPISODE_INPUT_TEMPLATE.md'), `# Episode Input Template\n\n- Episode ID/title/composition ID:\n- Resolution/FPS:\n- Script: ordered lines with speaker, exact displayed text and spoken text\n- TTS sources: CapCut draft/subdraft paths or approved processed assets\n- Screenshots: ordered files, dimensions, event/bubble coordinates, global and per-screen offsets, mask values\n- Audio policy: per-clip speed/volume source, trim policy, Normal Gap, Pause After, initial/end margins\n- Gameplay: file, gain/dB, crop, loop\n- Music: file, gain/dB, loop/crossfade\n- SFX: catalog name, source, semantic trigger, mode, gain, offset, overlap/full-duration/gap behavior\n- Zoom: disabled/enabled; target event/region, start/end scale, duration/easing\n- Episode-specific exceptions:\n- Props export JSON:\n- Forbidden changes:\n- Required validation and manual review:\n`);

write(path.join(docsRoot, 'SKILL_REGISTRY.md'), `# Skill Registry\n\n## Remotion\n\nProject skills live under \`.agents/skills/remotion-*\`; use the router \`.agents/skills/remotion-best-practices/SKILL.md\`. Relevant capabilities include Studio preview, multimedia, markup, captions and rendering. Rendering is not implied by validation.\n\n## Zoom\n\nNo standalone project “Zoom skill” file was found. The preserved, working implementation is embedded in \`episodes/gym02/src/capcut-registration.jsx\` as \`PinOverlay\`, documented by \`episodes/gym02/EPISODE02_MASTER_SPEC.md\` and \`data/gym02-master-manifest.json\`. It crops the pin rectangle, starts after 0.3s (frame 9 at 30fps), interpolates scale 1.0→1.3 through the remaining one-second PIN event with cubic in/out easing, and does not persist. It shares the screenshot transform.\n\nStatus: source is intact and usable as an optional reference, but it is episode-local and not connected as a reusable engine module. Do not claim a restored standalone skill and do not enable it in Video 03. A future episode must explicitly define the target region and parameters before adapting it.\n`);

write(path.join(docsRoot, 'REGRESSION_TESTS.md'), `# Regression Tests\n\n- Props: exported JSON equals approved preset hash; Normal Gap = 0 for Video 03; 12 screen offsets, 79 masks, 76 pauses.\n- TTS: 76 ordered voices; processed hash, duration, speed metadata and gain match approved state; Remotion playbackRate = 1.\n- My: 13 clips; special hashes for “Ồ” and “Thế để công bằng” preserved; 11 others match frozen state.\n- Timeline: voice starts/ends and duration match to ≤1 frame; no duplicate gap; explicit pauses unchanged.\n- Visuals: 12 screenshots and 3 image events; independent offsets; mask remains local.\n- SFX: all assets hash-match; 19 cues match. MONEY/CAT HUH use decay tail; CAT gap 0. Final voice has HỖN LOẠN only and no BOOM.\n- Background: gameplay frame 0/loop/cover/-9.4dB; music separate loop/-6dB additional gain.\n- Zoom: disabled in Video 03; optional gym02 implementation remains present.\n- Composition: Remotion lists \`ChatTextStory-Girlfriend-03\` without error.\n- Manual: listen for clipped speech, clipping/mix balance and SFX feel; inspect mask/reveal/offsets. Automated equality is not human audiovisual approval.\n`);

write(path.join(goldenRoot, 'README.md'), `# Video 03 Golden Master\n\nFrozen on 2026-10-28 after user audiovisual approval. Do not edit \`episode/\`. Verify with \`node tools/golden-master/verify-video03-golden.cjs\`. The original live episode was not changed by snapshot creation.\n`);

fs.cpSync(frozenEpisode, testRoot, {recursive: true});
write(path.join(testRoot, 'RECONSTRUCTION_TEST_COPY.txt'), 'Independent verification copy created from the frozen Golden Master. Not the approved live episode.\n');
console.log(JSON.stringify({goldenRoot, docsRoot, testRoot, files: manifest.length, bytes: manifest.reduce((n,x)=>n+x.bytes,0), voices: voices.length, myVoices: myVoices.length, sfx: timeline.sfx.length}, null, 2));
