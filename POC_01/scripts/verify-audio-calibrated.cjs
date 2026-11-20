const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const engine=require('./audio-boundary-nudge-v4d.cjs');
const bases=require('../data/audio-boundary-bases.json');
const baseline=require('../public/generated-audio-v4a2/timing-manifest.json');
const mapping=require('../data/chat-events.json');
const {buildEventTimeline,visualState}=require('../src/v4b-timeline.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
engine.initialize();
const load=()=>JSON.parse(fs.readFileSync(engine.manifestFile));
const original=load(),overrideBytes=fs.readFileSync(engine.overridesFile),manifestBytes=fs.readFileSync(engine.manifestFile);
assert.equal(original.phrases.length,97);assert.equal(original.boundaryCorrections.length,96);
assert.equal(fs.readdirSync(engine.output).filter(f=>/^voice_\d{3}\.wav$/.test(f)).length,97);
const originalHashes=original.phrases.map(p=>hash(fs.readFileSync(engine.output+'/'+p.audioFile)));
bases.boundaries.forEach((b,i)=>{
  assert(Math.abs(b.automaticDeltaMs)<=80+.03);
  assert.equal(b.originalSample,Math.round((baseline.phrases[i].end+baseline.phrases[i+1].start)/2*engine.rate));
  if(b.status==='NEEDS_MANUAL_REVIEW')assert.equal(b.autoCorrectedBaseSample,b.originalSample);
  assert.equal(original.boundaryCorrections[i].finalBoundary,b.autoCorrectedBaseBoundary+(original.manualBoundaryOverrides[b.boundaryId]??0)/1000);
});
const config={...require('../video.config.json'),...require('../video.v4a2.config.json')};
const props={'Initial Margin':config.initialMarginSeconds,'Normal Gap':config.defaultPauseAfterSeconds,'Pause After':{}};
const timeline=buildEventTimeline(mapping,original,props);
assert.equal(timeline.phrases.filter(p=>p.type==='VOICE').length,97);
original.phrases.forEach((p,i)=>{
  assert.equal(p.text,baseline.phrases[i].text);assert.equal(p.id,baseline.phrases[i].id);
  assert(p.sourceEndSample>p.sourceStartSample);if(i)assert.equal(p.sourceStartSample,original.phrases[i-1].sourceEndSample);
  const wav=fs.readFileSync(engine.output+'/'+p.audioFile);
  assert.equal(wav.readUInt32LE(40),(p.sourceEndSample-p.sourceStartSample)*4);
  assert.equal(p.clipDuration,(wav.length-44)/(44100*4));
});
const cache=fs.readFileSync('out/v4c-master.wav');let pcm;
for(let o=12;o+8<=cache.length;){const n=cache.readUInt32LE(o+4);if(cache.toString('ascii',o,o+4)==='data'){pcm=cache.subarray(o+8,o+8+n);break;}o+=8+n+n%2;}
assert.deepEqual(Buffer.concat(original.phrases.map(p=>fs.readFileSync(engine.output+'/'+p.audioFile).subarray(44))),pcm.subarray(bases.outerStartSample*4,bases.outerEndSample*4));
const selected=bases.boundaries.find(b=>Math.abs(b.automaticDeltaMs)>1);assert(selected);
const i=selected.index,prior=original.manualBoundaryOverrides[selected.boundaryId]??0;assert.equal(prior,0);
try{
  const changed=engine.update(i,10),m=load();
  assert.equal(m.phrases[i-1].sourceEndSample,selected.autoCorrectedBaseSample+441);
  assert.equal(m.phrases[i].sourceStartSample,m.phrases[i-1].sourceEndSample);
  for(let k=0;k<97;k++)if(k!==i-1&&k!==i)assert.equal(hash(fs.readFileSync(engine.output+'/'+m.phrases[k].audioFile)),originalHashes[k]);
  const moved=buildEventTimeline(mapping,m,props);
  const current=t=>t.phrases.find(p=>p.voice_index===i+1).timelineStart;
  assert(Math.abs(current(moved)-current(timeline)-.01)<1e-8);
  engine.update(i,0);
  assert.deepEqual(fs.readFileSync(engine.manifestFile),manifestBytes);
  assert.deepEqual(fs.readFileSync(engine.overridesFile),overrideBytes);
  original.phrases.forEach((p,k)=>assert.equal(hash(fs.readFileSync(engine.output+'/'+p.audioFile)),originalHashes[k]));
  assert.notEqual(engine.getState().boundaries[i-1].final,selected.originalAlignmentBoundary);
  assert.equal(engine.getState().boundaries[i-1].final,selected.autoCorrectedBaseBoundary);
  assert.throws(()=>engine.update(i,999999));
}finally{if((engine.getState().overrides[selected.boundaryId]??0)!==prior)engine.update(i,prior);}
for(const p of timeline.phrases){const state=visualState(timeline,(p.timelineStart+p.transitionStart)/2);assert.equal(state.maskY,p.maskStopY);}
for(let j=1;j<timeline.phrases.length;j++)assert.equal(timeline.phrases[j-1].transitionEnd,timeline.phrases[j].timelineStart);
const source=fs.readFileSync('src/v4c-registration.jsx','utf8').replaceAll('ChatTextStory-V4C-AudioNudge','ChatTextStory-V4D-AudioCalibrated').replace('generated-audio-v4c','generated-audio-v4d');
assert.equal(fs.readFileSync('src/v4d-registration.jsx','utf8'),source);
for(const [file,expected]of Object.entries(require('../out/v4d-protected-hashes.json')))assert.equal(hash(fs.readFileSync(file)),expected,'Protected file changed: '+file);
const result={status:'PASS',wavCount:97,boundaries:96,masterPcmPreservedExactly:true,sharedCutsNoGapsOrOverlap:true,flagsPreserveOriginalCuts:true,manualNudgeResetToNewBase:true,
  testedBoundary:selected.boundaryId,original:selected.originalAlignmentBoundary,newBase:selected.autoCorrectedBaseBoundary,plus10:load().boundaryCorrections[i-1].autoCorrectedBaseBoundary+.01,
  v4bAndV4cUnchanged:true,legacyManualCorrectionCount:Object.keys(require('../data/audio-boundary-overrides.json')).length,visualMappingAndTimelineCodeUnchanged:true,
  durationSeconds:timeline.durationSeconds+config.endMarginSeconds};
fs.writeFileSync('out/v4d-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
