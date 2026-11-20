const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const engine=require('./audio-boundary-nudge.cjs');
const mapping=require('../data/chat-events.json');
const {buildEventTimeline,visualState}=require('../src/v4b-timeline.cjs');
const config={...require('../video.config.json'),...require('../video.v4a2.config.json')};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=()=>JSON.parse(fs.readFileSync(engine.manifestFile));
const props={'Initial Margin':config.initialMarginSeconds,'Normal Gap':config.defaultPauseAfterSeconds,'Pause After':{}};
const timeline=()=>buildEventTimeline(mapping,manifest(),props);
engine.initialize();
const originalOverrides=fs.readFileSync(engine.overridesFile),originalManifest=fs.readFileSync(engine.manifestFile);
const originalHashes=Object.fromEntries(Array.from({length:97},(_,i)=>{const f=`voice_${String(i+1).padStart(3,'0')}.wav`;return [f,hash(fs.readFileSync(engine.output+'/'+f))];}));
const initial=manifest(),initialTimeline=timeline(),original=engine.getState().boundaries[1].original;
const oldCorrection=JSON.parse(originalOverrides).boundary_002??0;
assert.equal(oldCorrection,0,'Run test on an uncorrected Boundary 002; existing corrections will not be discarded');
const results=[];
try{
  for(const ms of [10,50,-10,0]){
    const result=engine.update(2,ms),m=manifest(),t=timeline();
    const previous=m.phrases[1],next=m.phrases[2];
    assert.equal(previous.sourceEndSample,next.sourceStartSample);
    assert.equal(previous.sourceEndSample,engine.originalCuts[2]+ms*engine.rate/1000);
    assert.equal(previous.sourceStart,initial.phrases[1].sourceStart);assert.equal(next.sourceEnd,initial.phrases[2].sourceEnd);
    const delta=ms/1000;
    assert(Math.abs((previous.clipDuration-initial.phrases[1].clipDuration)-delta)<1e-9);
    assert(Math.abs((next.clipDuration-initial.phrases[2].clipDuration)+delta)<1e-9);
    assert(Math.abs(t.phrases.find(p=>p.voice_index===3).timelineStart-initialTimeline.phrases.find(p=>p.voice_index===3).timelineStart-delta)<1e-8);
    assert.equal(t.phrases.find(p=>p.voice_index===4).timelineStart,initialTimeline.phrases.find(p=>p.voice_index===4).timelineStart);
    for(let i=0;i<97;i++){if(i===1||i===2)continue;const p=m.phrases[i];assert.equal(hash(fs.readFileSync(engine.output+'/'+p.audioFile)),originalHashes[p.audioFile]);}
    results.push({correctionMs:ms,boundary:previous.sourceEnd,previous:{start:previous.sourceStart,end:previous.sourceEnd},next:{start:next.sourceStart,end:next.sourceEnd},voice3TimelineStart:t.phrases.find(p=>p.voice_index===3).timelineStart,voice4TimelineStart:t.phrases.find(p=>p.voice_index===4).timelineStart});
  }
  assert.deepEqual(fs.readFileSync(engine.overridesFile),originalOverrides);
  assert.deepEqual(fs.readFileSync(engine.manifestFile),originalManifest);
  for(const [file,expected]of Object.entries(originalHashes))assert.equal(hash(fs.readFileSync(engine.output+'/'+file)),expected);
  assert.throws(()=>engine.update(2,999999));
  assert.deepEqual(fs.readFileSync(engine.overridesFile),originalOverrides);
  assert.deepEqual(fs.readFileSync(engine.manifestFile),originalManifest);
  // All WAV PCM data concatenates to the original decoded source interval exactly.
  const decoded=fs.readFileSync('out/v4c-master.wav');let master;
  for(let offset=12;offset+8<=decoded.length;){const n=decoded.readUInt32LE(offset+4);if(decoded.toString('ascii',offset,offset+4)==='data'){master=decoded.subarray(offset+8,offset+8+n);break;}offset+=8+n+n%2;}
  const all=Buffer.concat(initial.phrases.map(p=>fs.readFileSync(engine.output+'/'+p.audioFile).subarray(44)));
  assert.deepEqual(all,master.subarray(engine.originalCuts[0]*4,engine.originalCuts.at(-1)*4));
  const t=timeline();
  for(const p of t.phrases){const seconds=(p.timelineStart+p.transitionStart)/2;const s=visualState(t,seconds);assert.equal(s.maskY,p.maskStopY);}
  const protectedHashes=require('../out/v4c-protected-hashes.json');
  for(const [file,expected]of Object.entries(protectedHashes))assert.equal(hash(fs.readFileSync(file)),expected,'Baseline modified: '+file);
  assert.equal(fs.readdirSync(engine.output).filter(f=>/^voice_\d{3}\.wav$/.test(f)).length,97);
  const v4b=buildEventTimeline(mapping,require('../public/generated-audio-v4a2/timing-manifest.json'),props);
  const report={status:'PASS',originalBoundary002:original,tests:results,resetRestoresAllWavHashesAndManifest:true,all97PcmConcatenatesExactlyToMaster:true,invalidCrossingRejected:true,selectiveRegeneration:'Only voices 002 and 003 changed; all other WAV hashes stayed equal.',v4bProtected:true,v4bDurationSeconds:v4b.durationSeconds+config.endMarginSeconds,v4cDurationSeconds:t.durationSeconds+config.endMarginSeconds,sharedPartitionAddedSourceSilenceSeconds:Number((t.durationSeconds-v4b.durationSeconds).toFixed(9)),overrides:JSON.parse(originalOverrides)};
  fs.writeFileSync('out/v4c-nudge-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{if(JSON.stringify(engine.getState().overrides)!==JSON.stringify(JSON.parse(originalOverrides)))engine.update(2,oldCorrection);}
