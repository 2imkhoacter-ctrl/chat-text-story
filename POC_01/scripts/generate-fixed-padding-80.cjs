// Fixed independent handles only. No boundary refinement or neighboring clamps.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {extractClip,probeDuration}=require('./segment-audio.cjs');
const {buildPhraseTimeline}=require('../src/phrase-timeline.cjs');
const {buildEventTimeline}=require('../src/v4b-timeline.cjs');
const HEAD_PADDING_MS=80,TAIL_PADDING_MS=80;
const config={...require('../video.config.json'),...require('../video.v4a2.config.json')};
const aligned=require('../public/generated-audio-v4a2/alignment-manifest.json');
const baseline=require('../public/generated-audio-v4a2/timing-manifest.json');
const mapping=require('../data/chat-events.json');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'public/full_tts.mp3.MP3');
const output=path.join(root,'public/generated-audio-v4e');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(aligned.status,'VALIDATED');assert.equal(aligned.phrases.length,97);
assert.equal(digest(fs.readFileSync(source)),aligned.sourceSha256);
const masterDuration=probeDuration(source);
fs.mkdirSync(output,{recursive:true});
const round=n=>Number(n.toFixed(9));
const phrases=aligned.phrases.map((p,i)=>{
  const old=baseline.phrases[i];assert.equal(p.id,old.id);assert.equal(p.text,old.text);
  const sourceStart=round(Math.max(0,p.start-HEAD_PADDING_MS/1000));
  const sourceEnd=round(Math.min(masterDuration,p.end+TAIL_PADDING_MS/1000));
  assert(sourceStart>=0&&sourceEnd>sourceStart&&sourceEnd<=masterDuration);
  const destination=path.join(output,old.audioFile);
  extractClip({...config,audio:'public/full_tts.mp3.MP3'},{id:p.id,sourceStart,sourceEnd},destination);
  const clipDuration=probeDuration(destination);
  assert(Math.abs(clipDuration-(sourceEnd-sourceStart))<1/44100+.000002);
  return {...old,alignedStart:p.start,alignedEnd:p.end,sourceStart,sourceEnd,clipDuration,
    headPaddingMs:HEAD_PADDING_MS,tailPaddingMs:TAIL_PADDING_MS,
    actualHeadPaddingMs:round((p.start-sourceStart)*1000),actualTailPaddingMs:round((sourceEnd-p.end)*1000),
    extraHeadHandleSeconds:round(p.start-sourceStart),extraTailHandleSeconds:round(sourceEnd-p.end),
    relativeAudioFile:`generated-audio-v4e/${old.audioFile}`,audioRevision:digest(fs.readFileSync(destination)).slice(0,16)};
});
const manifest=buildPhraseTimeline({...baseline,alignmentVersion:'v4e-fixed-80ms-safety-padding',phrases,
  extractionPolicy:{HEAD_PADDING_MS,TAIL_PADDING_MS,clamp:'master-only',neighborSourceOverlap:'allowed',energyRefinement:false,manualOverridesApplied:false},
},{initialMargin:config.initialMarginSeconds,normalGap:config.defaultPauseAfterSeconds});
fs.writeFileSync(path.join(output,'timing-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
// Reuse identical visual code and dynamic timeline, changing only ID and audio input.
const composition=fs.readFileSync(path.join(root,'src/v4c-registration.jsx'),'utf8')
  .replaceAll('ChatTextStory-V4C-AudioNudge','ChatTextStory-V4E-SafetyPadding80').replace('generated-audio-v4c','generated-audio-v4e');
fs.writeFileSync(path.join(root,'src/v4e-registration.jsx'),composition);
const files=fs.readdirSync(output).filter(f=>/^voice_\d{3}\.wav$/.test(f));assert.equal(files.length,97);
const props={'Initial Margin':config.initialMarginSeconds,'Normal Gap':config.defaultPauseAfterSeconds,'Pause After':Object.fromEntries(phrases.map((p,i)=>[`Phrase ${i+1}`,config.phrasePauses[p.id]??p.pauseAfter??0]))};
const timeline=buildEventTimeline(mapping,manifest,props);
assert.deepEqual(timeline.phrases.filter(p=>p.type==='VOICE').map(p=>p.voice_index),Array.from({length:97},(_,i)=>i+1));
for(const [file,hash]of Object.entries(require('../out/v4e-protected-hashes.json')))assert.equal(digest(fs.readFileSync(path.join(root,file))),hash,file);
const examples=[0,48,96].map(i=>({phrase:i+1,text:phrases[i].text,before:[aligned.phrases[i].start,aligned.phrases[i].end],after:[phrases[i].sourceStart,phrases[i].sourceEnd],actualHeadPaddingMs:phrases[i].actualHeadPaddingMs,actualTailPaddingMs:phrases[i].actualTailPaddingMs}));
const result={status:'PASS',HEAD_PADDING_MS,TAIL_PADDING_MS,phraseCount:97,masterDuration,examples,clamp:'master-only',
  overlappingNeighborSourceRanges:phrases.slice(1).filter((p,i)=>p.sourceStart<phrases[i].sourceEnd).length,
  headClamped:phrases.flatMap((p,i)=>p.actualHeadPaddingMs<80-.0001?[i+1]:[]),
  tailClamped:phrases.filter(p=>p.actualTailPaddingMs<80-.0001).map(p=>p.phrase),
  energyRefinementActive:false,whisperOrAlignmentRerun:false,visualLogicAndMappingUnchanged:true,previousVersionsUnchanged:true,
  durationSeconds:timeline.durationSeconds+config.endMarginSeconds,durationInFrames:Math.ceil((timeline.durationSeconds+config.endMarginSeconds)*config.fps)};
fs.writeFileSync(path.join(root,'out/v4e-fixed-padding-validation.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(root,'out/v4e-fixed-padding-ranges.csv'),'phrase,aligned_start,aligned_end,source_start,source_end,head_ms,tail_ms\n'+phrases.map((p,i)=>[i+1,p.alignedStart,p.alignedEnd,p.sourceStart,p.sourceEnd,p.actualHeadPaddingMs,p.actualTailPaddingMs].join(',')).join('\n')+'\n');
console.log(JSON.stringify(result,null,2));
