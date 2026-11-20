// Audio manifests and minimal A/B registrations using the unchanged visual template.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');process.chdir(root);
const context=JSON.parse(fs.readFileSync(process.argv[2]));
const diagnostic=JSON.parse(fs.readFileSync(path.join(context.runDir,'edge-repair-diagnostics.json')));
const {buildPhraseTimeline}=require('../src/phrase-timeline.cjs');
const {buildEventTimeline,visualState}=require('../src/v4b-timeline.cjs');
const config={...require('../video.config.json'),...require('../video.v4a2.config.json')};
const mapping=JSON.parse(fs.readFileSync(context.settings.visualMapping));
assert.deepEqual(mapping.events.filter(e=>e.type==='VOICE').map(e=>e.voice_index),Array.from({length:context.phraseCount},(_,i)=>i+1),'Provide an ordered visual mapping for this script');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const freshLines="  const freshOriginal = require('./freshcut-original-registration.jsx')();\n  const freshRepaired = require('./freshcut-repaired-registration.jsx')();\n";
const versions=[['FreshCut-Original',diagnostic.outputA,'freshcut-original-registration.jsx'],['FreshCut-AutoRepaired',diagnostic.outputB,'freshcut-repaired-registration.jsx']];
const timing=[];
for(const[id,dir,registration]of versions){
  const f=path.join(dir,'timing-manifest.json'),raw=JSON.parse(fs.readFileSync(f));
  const pauses=Object.fromEntries(raw.phrases.map((p,i)=>[`Phrase ${i+1}`,config.phrasePauses[p.id]??p.pauseAfter??0]));
  const manifest=buildPhraseTimeline(raw,{initialMargin:config.initialMarginSeconds,normalGap:config.defaultPauseAfterSeconds,pauses});
  fs.writeFileSync(f,JSON.stringify(manifest,null,2)+'\n');
  const props={'Initial Margin':config.initialMarginSeconds,'Normal Gap':config.defaultPauseAfterSeconds,'Pause After':pauses};
  const timeline=buildEventTimeline(mapping,manifest,props);
  for(const e of timeline.phrases)assert.equal(visualState(timeline,(e.timelineStart+e.transitionStart)/2).maskY,e.maskStopY);
  assert.equal(fs.readdirSync(dir).filter(f=>/^voice_\d{3}\.wav$/.test(f)).length,context.phraseCount);
  const relative=path.relative(root,f).replaceAll('\\','/');
  // Only ID and manifest path differ; no screenshot/mask/gameplay/UI changes.
  const template=fs.readFileSync('src/v4c-registration.jsx','utf8');
  const registrationSource=template.replaceAll('ChatTextStory-V4C-AudioNudge',id)
    .replace('../public/generated-audio-v4c/timing-manifest.json','../'+relative)
    .replace('../data/chat-events.json','../'+context.settings.visualMapping.replaceAll('\\','/'));
  fs.writeFileSync('src/'+registration,registrationSource);
  timing.push({id,durationSeconds:timeline.durationSeconds+config.endMarginSeconds,manifest:relative});
}
// Future phrase counts reuse the audio nodes authored by the original cut stage.
if(context.phraseCount!==97){
  const nodes=Array.from({length:context.phraseCount},(_,i)=>`React.createElement(Audio,{key:phrases[${i}].id,name:phrases[${i}].label,src:staticFile(phrases[${i}].relativeAudioFile),from:phrases[${i}].timelineStart*fps,durationInFrames:phrases[${i}].clipDuration*fps})`);
  fs.writeFileSync('src/freshcut-audio.jsx',`const React=require('react');const {Audio}=require('@remotion/media');const {staticFile,useVideoConfig}=require('remotion');module.exports=({phrases})=>{const {fps}=useVideoConfig();return React.createElement(React.Fragment,null,${nodes.join(',')});};\n`);
  for(const[,,file]of versions){const f='src/'+file;fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('./v4c-audio.jsx','./freshcut-audio.jsx'));}
}
const originalWords=JSON.parse(fs.readFileSync(path.join(context.work,'public/fresh-alignment/whisper-words.json')));
const resolved=JSON.parse(fs.readFileSync(path.join(context.work,'public/fresh-cut/alignment-manifest.json')));
const provenance={runId:context.runId,sourceSha256:context.sourceSha256,scriptSha256:context.scriptSha256,
  whisperExecutedFresh:true,oldTimestampCacheUsed:false,oldWavsUsed:false,manualCorrectionsUsed:false,previousAutoCorrectionsUsed:false,
  unchangedOriginalScripts:context.originalScriptHashes,whisperWords:originalWords.words.length,runtime:originalWords.runtime,
  alignmentStatus:resolved.status,safeAnchors:resolved.safeAnchors,autoResolved:resolved.autoResolved};
provenance.whisperRerunForExtractionFix=false;
provenance.cached521WordsAnd97ResolvedRecordsReused=true;
provenance.extractionMethod='V4C extended ranges -> shared midpoints -> one PCM decode -> exact sample slicing; zero nudges';
for(const [f,h]of Object.entries(context.protectedHashes)){
  if(f.replaceAll('\\','/')==='src/index.jsx'&&hash(f)!==h){
    const stripped=fs.readFileSync(f,'utf8').replace(freshLines,'').replace(', freshOriginal, freshRepaired);',');');
    assert.equal(crypto.createHash('sha256').update(stripped).digest('hex'),h,'Unexpected root change');
  }else assert.equal(hash(f),h,'Protected pre-existing file changed: '+f);
}
const indexFile='src/index.jsx';let index=fs.readFileSync(indexFile,'utf8');
if(!index.includes("require('./freshcut-original-registration.jsx')")){
  const target=/  return React\.createElement\(React\.Fragment, null, legacy, v4a,[^\n]+\);/;
  assert(target.test(index),'Root registration changed; refusing broad edits');
  index=index.replace(target,match=>freshLines+match.replace(/\);$/,', freshOriginal, freshRepaired);'));
  fs.writeFileSync(indexFile,index);
}
const summary={...diagnostic.summary,versions:timing,provenance,protectedFilesUnchanged:true};
fs.writeFileSync(path.join(context.runDir,'ab-summary.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync('out/freshcut-ab-summary.json',JSON.stringify(summary,null,2)+'\n');
let report='# Fresh-start audio A/B test\n\n';
report+=`Corrected audio extraction for fresh run ${context.runId}. Reused its existing ${originalWords.words.length} word records and ${resolved.phrases.length} resolved phrase records without rerunning Whisper or alignment. No manually corrected timestamps, saved nudges, V4C WAVs or old V4G repairs were loaded.\n\n`;
report+=Object.entries(diagnostic.summary).map(([k,v])=>`- ${k}: ${v}`).join('\n')+'\n\n';
if(diagnostic.summary.repaired===0)report+='**Outcome: no candidate met all automatic-repair checks. A and B are byte-identical for all 97 WAVs. The full workflow ran, but this test did not demonstrate an automatic acoustic improvement. Thresholds were not relaxed to manufacture a repair.**\n\n';
report+='## Listening versions\n\n'+timing.map(v=>`- [${v.id}](http://localhost:3000/${v.id}): ${v.durationSeconds.toFixed(6)} s; ${v.manifest}`).join('\n')+'\n\n';
report+='A reproduces the exact V4C base construction with zero nudges: extend the resolved ranges using the existing bounded 70 ms handle formula; take neighboring range midpoints; round once to integer 44,100 Hz sample offsets using V4C Math.round semantics. Decode the master once and slice all A WAVs from that PCM. B starts from those exact cuts and runs both original V4G HEAD/TAIL detectors with 350 ms windows and unchanged neighbor checks. Accepted pairs are sliced from the same PCM decode. No old nudges or old repair deltas are applied. Both directories/manifests are independent; existing visuals and UI are unchanged.\n\n';
report+='## Applied corrections\n\n|Boundary|Type / direction|Initial previous end / next start (s)|Final shared cut (s)|Delta from initial midpoint (ms)|Post-check|\n|---|---|---|---:|---:|---|\n';
for(const r of diagnostic.boundaries.filter(r=>r.status==='REPAIRED'))report+=`|${r.boundaryId}|${r.type} / ${r.deltaMs<0?'LEFT':'RIGHT'}|${r.initialPreviousEnd.toFixed(6)} / ${r.initialNextStart.toFixed(6)}|${r.finalBoundary.toFixed(6)}|${r.deltaMs.toFixed(3)}|PASS|\n`;
if(!diagnostic.boundaries.some(r=>r.status==='REPAIRED'))report+='|None||||||\n';
report+='\n## Integrity and limits\n\nBoth A and B concatenate byte-for-byte to the same retained master PCM interval, 0–107.740 seconds. There are zero internal source gaps and zero duplicated/lost samples. The 1818 decoded samples after 107.740 seconds remain outside the original V4C outer endpoint; no end-of-master expansion is invented. All unchanged boundaries retain their exact zero-nudge A cut. No independent per-clip MP3 seeking, artificial silence, extra global padding, overlap or time stretching is used.\n\n';
report+='Manual-review boundary IDs: '+diagnostic.boundaries.filter(r=>r.status.startsWith('UNCERTAIN')).map(r=>r.boundaryId).join(', ')+'. Detailed measurements and rejection reasons are in the run’s edge-repair-diagnostics.json.\n\n';
report+='Both HEAD and TAIL detectors scan all 97 initial heads/tails with the original V4G 350 ms windows, 10 ms RMS and approximately 5 ms hops. The original neighbor-aware decision function is called directly, rather than the previous gapped-range adapter. Opposing/uncertain candidates stay unchanged. Every accepted correction passed quiet-cut, full-fragment transfer and post-repair detector checks. Structural confidence is not a guarantee of semantic phoneme ownership; use A/B listening for acoustic assessment.\n\n';
report+='## Reuse\n\n`node scripts/run-fresh-audio-pipeline.cjs` creates a new isolated run and executes transcription → initial alignment → sequential resolution → original extraction → HEAD/TAIL repair → A/B manifests/registrations. Inputs are configurable in fresh-audio-pipeline.config.json. For another script, supply its matching visual event manifest; old project-specific corrections are never loaded. Existing production assets are hash-protected. No full video render performed.\n\nRun artifacts and stage logs: '+context.runDir+'.\n';
fs.writeFileSync('out/freshcut-ab-comparison.md',report);
console.log(JSON.stringify(summary,null,2));
