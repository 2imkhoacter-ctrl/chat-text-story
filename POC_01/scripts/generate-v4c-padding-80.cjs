// Stage 1 is the existing V4C result, read-only. Stage 2 only expands its cuts.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {extractClip,probeDuration}=require('./segment-audio.cjs');
const {buildPhraseTimeline}=require('../src/phrase-timeline.cjs');
const {buildEventTimeline,visualState}=require('../src/v4b-timeline.cjs');
const root=path.resolve(__dirname,'..');
const baseFile=path.join(root,'public/generated-audio-v4c/timing-manifest.json');
const baseBytes=fs.readFileSync(baseFile),base=JSON.parse(baseBytes);
const config={...require('../video.config.json'),...require('../video.v4a2.config.json')};
const mapping=require('../data/chat-events.json');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const HEAD_PADDING_MS=80,TAIL_PADDING_MS=80;
const source=path.join(root,'public/full_tts.mp3.MP3');
const masterDuration=probeDuration(source);
const output=path.join(root,'public/generated-audio-v4f');
assert.equal(base.phrases.length,97);
// Do not recalculate V4C or silently ignore saved corrections not yet applied there.
assert.deepEqual(base.manualBoundaryOverrides,JSON.parse(fs.readFileSync(path.join(root,'data/audio-boundary-overrides.json'))),'Saved V4C overrides differ from the current V4C result; update V4C explicitly first.');
fs.mkdirSync(output,{recursive:true});
const round=n=>Number(n.toFixed(9));
const phrases=base.phrases.map((p,i)=>{
  const sourceStart=round(Math.max(0,p.sourceStart-.080));
  const sourceEnd=round(Math.min(masterDuration,p.sourceEnd+.080));
  assert(sourceEnd>sourceStart&&sourceStart>=0&&sourceEnd<=masterDuration);
  const destination=path.join(output,p.audioFile);
  extractClip({...config,audio:'public/full_tts.mp3.MP3'},{id:p.id,sourceStart,sourceEnd},destination);
  const clipDuration=probeDuration(destination);
  assert(Math.abs(clipDuration-(sourceEnd-sourceStart))<1/44100+.000002,`WAV duration mismatch: ${p.id}`);
  return {...p,v4cBaseSourceStart:p.sourceStart,v4cBaseSourceEnd:p.sourceEnd,
    sourceStart,sourceEnd,clipDuration,headPaddingMs:80,tailPaddingMs:80,
    actualHeadExpansionMs:round((p.sourceStart-sourceStart)*1000),actualTailExpansionMs:round((sourceEnd-p.sourceEnd)*1000),
    // Independent expanded ranges do not use V4C's shared-cut sample fields.
    sourceStartSample:Math.round(sourceStart*44100),sourceEndSample:Math.round(sourceEnd*44100),
    relativeAudioFile:`generated-audio-v4f/${p.audioFile}`,audioRevision:digest(fs.readFileSync(destination)).slice(0,16)};
});
const manifest=buildPhraseTimeline({...base,alignmentVersion:'v4f-v4c-cut-plus-80ms',phrases,
  sourcePartition:'independent-v4c-ranges-plus-handles',v4cBaseManifestSha256:digest(baseBytes),
  extractionPolicy:{baseline:'existing V4C sourceStart/sourceEnd result including applied manual nudges',HEAD_PADDING_MS,TAIL_PADDING_MS,
    clamp:'master-only',neighborSourceOverlap:'allowed',realMasterAudio:true,energyRefinement:false},
},{initialMargin:config.initialMarginSeconds,normalGap:config.defaultPauseAfterSeconds});
fs.writeFileSync(path.join(output,'timing-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(root,'out/v4f-v4c-base-snapshot.json'),baseBytes);
const composition=fs.readFileSync(path.join(root,'src/v4c-registration.jsx'),'utf8')
  .replaceAll('ChatTextStory-V4C-AudioNudge','ChatTextStory-V4F-V4C-Padding80').replace('generated-audio-v4c','generated-audio-v4f');
fs.writeFileSync(path.join(root,'src/v4f-registration.jsx'),composition);
assert.equal(fs.readdirSync(output).filter(f=>/^voice_\d{3}\.wav$/.test(f)).length,97);
assert.deepEqual(phrases.map(p=>p.id),base.phrases.map(p=>p.id));
const props={'Initial Margin':config.initialMarginSeconds,'Normal Gap':config.defaultPauseAfterSeconds,
  'Pause After':Object.fromEntries(base.phrases.map((p,i)=>[`Phrase ${i+1}`,config.phrasePauses[p.id]??p.pauseAfter??0]))};
const timeline=buildEventTimeline(mapping,manifest,props);
assert.deepEqual(timeline.phrases.filter(p=>p.type==='VOICE').map(p=>p.voice_index),Array.from({length:97},(_,i)=>i+1));
for(const p of timeline.phrases){assert.equal(visualState(timeline,(p.timelineStart+p.transitionStart)/2).maskY,p.maskStopY);}
for(const [file,hash]of Object.entries(require('../out/v4f-protected-hashes.json')))assert.equal(digest(fs.readFileSync(path.join(root,file))),hash,file);
const range=p=>({phrase:base.phrases.findIndex(b=>b.id===p.id)+1,v4c:[p.v4cBaseSourceStart,p.v4cBaseSourceEnd],v4f:[p.sourceStart,p.sourceEnd],headExpansionMs:p.actualHeadExpansionMs,tailExpansionMs:p.actualTailExpansionMs});
const result={status:'PASS',HEAD_PADDING_MS,TAIL_PADDING_MS,phraseCount:97,baseManifest:'public/generated-audio-v4c/timing-manifest.json',baseManifestSha256:digest(baseBytes),masterDuration,
  appliedV4cManualCorrections:Object.keys(base.manualBoundaryOverrides).length,examples:[0,1,48,95,96].map(i=>range(phrases[i])),
  headClamped:phrases.filter(p=>p.actualHeadExpansionMs<80-.0001).map(p=>p.id),tailClamped:phrases.filter(p=>p.actualTailExpansionMs<80-.0001).map(p=>p.id),
  overlappingAdjacentSourcePairs:phrases.slice(1).filter((p,i)=>p.sourceStart<phrases[i].sourceEnd).length,
  v4cCutsAndAllPriorVersionsUnchanged:true,realMasterAudio:true,neighborClamping:false,energyAnalysis:false,whisperRerun:false,
  visualMappingAndPauseGapLogicUnchanged:true,durationSeconds:timeline.durationSeconds+config.endMarginSeconds,durationInFrames:Math.ceil((timeline.durationSeconds+config.endMarginSeconds)*30)};
fs.writeFileSync(path.join(root,'out/v4f-validation.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(root,'out/v4f-source-ranges.csv'),'phrase,V4C_start,V4C_end,V4F_start,V4F_end,head_expansion_ms,tail_expansion_ms\n'+phrases.map(p=>{const r=range(p);return [r.phrase,...r.v4c,...r.v4f,r.headExpansionMs,r.tailExpansionMs].join(',');}).join('\n')+'\n');
console.log(JSON.stringify(result,null,2));
