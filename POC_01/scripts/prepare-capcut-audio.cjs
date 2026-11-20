// Daily entry point: extract only if absent, validate, then prepare one composition.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {resolve,wav,edges,run,normalize}=require('./extract-capcut-tts.cjs');
const {buildEventTimeline,visualState}=require('../src/capcut-timeline.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const write=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n');
function main(){
  const [sourceArg,outputArg]=process.argv.slice(2);
  if(!sourceArg||!outputArg)throw Error('Usage: node scripts/prepare-capcut-audio.cjs <CapCut directory> <output directory inside public>');
  const source=path.resolve(sourceArg),output=path.resolve(outputArg),publicRoot=path.join(root,'public');
  assert(output.startsWith(publicRoot+path.sep),'Output must be inside public');
  const manifestFile=path.join(output,'manifest.json');
  if(!fs.existsSync(manifestFile)){
    const child=spawnSync(process.execPath,[path.join(__dirname,'extract-capcut-tts.cjs'),source,output],{stdio:'inherit',windowsHide:true});
    assert([0,2].includes(child.status),'Extraction failed');
  }
  const manifest=read(manifestFile),mapping=read(path.join(root,'data/chat-events.json'));
  const script=fs.readFileSync(path.join(root,'data/tts-script.txt'),'utf8').split(/\r?\n/).filter(x=>x.trim());
  const approvals=read(path.join(root,'data/capcut-tts-text-approvals.json')).approvals;
  const {rows,inputs}=resolve(source,mapping),voices=mapping.events.filter(e=>e.type==='VOICE');
  assert.equal(rows.length,voices.length);assert.equal(script.length,voices.length);assert.equal(manifest.phrases.length,voices.length);
  const sourceHashes=Object.fromEntries([...inputs].map(f=>[f,hash(f)]));
  for(const [f,h] of Object.entries(manifest.sourceHashes))assert.equal(hash(f),h,'Source changed; cache invalid: '+f);
  for(const dir of ['original','processed'])assert.equal(fs.readdirSync(path.join(output,dir)).filter(f=>/\.wav$/i.test(f)).length,voices.length);
  const results=[],issues=[],audioReview=[];
  for(let i=0;i<rows.length;i++){
    const r=rows[i],p=manifest.phrases[i],event=voices[i];
    assert.equal(event.voice_index,i+1);assert.equal(normalize(event.script_text),normalize(script[i]));
    for(const key of ['index','text','sourceWav','materialId','sourceStart','sourceDuration','speed','timelineStart'])assert.equal(p[key],r[key],`Stale ${key} at ${i+1}`);
    assert.equal(hash(p.originalWav),p.originalSha256);assert.equal(hash(p.processedWav),p.processedSha256);
    assert.equal(hash(p.sourceWav),p.originalSha256);
    const exact=normalize(p.text)===normalize(event.script_text);
    const approval=approvals.find(a=>a.voiceIndex===p.index&&a.eventId===event.event_id&&a.displayText===event.text&&a.scriptText===event.script_text&&a.spokenText===p.text);
    if(!exact&&!approval)issues.push({voiceIndex:p.index,displayText:event.text,spokenText:p.text,error:'Unapproved text difference'});
    // Read-only signal check against the existing speed/trim transformation.
    // Nothing is written, trimmed or resampled during this check.
    const original=wav(run(['-i',p.originalWav,'-c:a','pcm_s16le','-f','wav','pipe:1']));
    const originalEdges=edges(original);
    const filters=[`atrim=start=${p.sourceStart}:end=${Math.min(original.duration,p.sourceStart+p.sourceDuration)}`,'asetpts=PTS-STARTPTS'];
    if(Math.abs(p.speed-1)>1e-6)filters.push(`atempo=${p.speed}`);
    const reference=wav(run(['-i',p.originalWav,'-af',filters.join(','),'-c:a','pcm_s16le','-f','wav','pipe:1']));
    const actual=wav(run(['-i',p.processedWav,'-c:a','pcm_s16le','-f','wav','pipe:1']));
    assert(Math.abs(actual.duration-p.processedDuration)<1/actual.rate);
    const first=Math.round(p.leadingTrim*reference.rate)*reference.channels*2;
    const last=reference.data.length-Math.round(p.trailingTrim*reference.rate)*reference.channels*2;
    assert(reference.data.subarray(first,last).equals(actual.data),'Processed signal differs from recorded trims/speed');
    const headPreserved=p.leadingTrim===0;
    if(p.reviewReasons.length)audioReview.push({voiceIndex:p.index,originalHeadSeconds:originalEdges.leading,
      processedHeadSeconds:p.detectedLeadingSilence,headPreserved,referencePcmMatches:true,reasons:p.reviewReasons});
    results.push({...p,displayText:event.text,spokenText:p.text,scriptText:event.script_text,
      bubbleId:event.event_id,voiceIndex:p.index,eventIndex:mapping.events.indexOf(event)+1,
      validationStatus:exact?'ORDERED_TEXT_MATCH':approval?'APPROVED_INTENTIONAL_VARIATION':'FAIL',
      mappingEvidence:{capcutTimelineStart:p.timelineStart,materialId:p.materialId,subdraft:p.subdraft,approval:approval??null},
      needsReview:p.reviewReasons.length>0,relativeAudioFile:path.relative(publicRoot,p.processedWav).replace(/\\/g,'/'),
      originalTrailingSilence:originalEdges.trailing,headPreserved});
  }
  assert.equal(new Set(results.map(p=>p.relativeAudioFile)).size,voices.length);
  const config={...read(path.join(root,'video.config.json')),...read(path.join(root,'video.v4a2.config.json'))};
  const props={'Initial Margin':config.initialMarginSeconds,'Normal Gap':config.defaultPauseAfterSeconds,'End Margin':config.endMarginSeconds,'Pause After':{}};
  const speech={phrases:results},timeline=buildEventTimeline(mapping,speech,props),list=timeline.phrases;
  const screenshots=[];
  for(let i=0;i<list.length;i++){
    const e=list[i],next=list[i+1];
    if(screenshots.at(-1)!==e.screenshot)screenshots.push(e.screenshot);
    assert(e.timelineEnd>e.timelineStart);
    if(e.type!=='VOICE'){assert.equal(e.voiceIndex,null);assert.equal(e.timelineEnd-e.timelineStart,.5);}
    if(next)assert(Math.abs(next.timelineStart-e.timelineEnd)<1e-9,'Double gap/overlap');
    if(e.type==='VOICE'){
      const frame=Math.floor((e.timelineStart+1e-9)*30);
      const state=visualState(timeline,frame/30);
      assert.equal(state.event.event_id,e.event_id,'Bubble not ready before audio');
      assert.equal(state.maskY,e.maskStopY,'Bubble not fully revealed before audio');
      if(next)assert(e.transitionStart>=e.timelineEnd-e.trailingSilence-1e-8,'Mask moves during speech');
    }
  }
  assert.deepEqual(screenshots,mapping.screenshots.map(s=>s.filename));
  const durationSeconds=timeline.durationSeconds+props['End Margin'],durationInFrames=Math.ceil(durationSeconds*30);
  const passed=issues.length===0;
  const report={status:passed?'PASS':'FAIL',voiceEvents:voices.length,wavs:results.length,
    silentEvents:list.filter(e=>e.type!=='VOICE').map(e=>({eventId:e.event_id,type:e.type,hold:e.hold_duration,voiceIndex:e.voiceIndex})),
    intentionalVariations:results.filter(p=>p.validationStatus==='APPROVED_INTENTIONAL_VARIATION').map(p=>({voiceIndex:p.index,displayText:p.displayText,spokenText:p.spokenText})),
    audioReview,issues,screenshotOrder:screenshots,durationSeconds,durationInFrames,fps:30,
    noAdditionalInterVoiceGap:true,noAudioOverlap:true,existingWavsReused:true,allProcessedPcmVerified:true,
    originalTailRange:[Math.min(...results.map(p=>p.originalTrailingSilence)),Math.max(...results.map(p=>p.originalTrailingSilence))],
    processedTailRange:[Math.min(...results.map(p=>p.trailingSilence)),Math.max(...results.map(p=>p.trailingSilence))]};
  write(path.join(output,'integration-validation.json'),report);
  if(!passed)throw Error('Mapping validation failed; see integration-validation.json. Active Remotion source unchanged.');
  for(const [f,h] of Object.entries(sourceHashes))assert.equal(hash(f),h);
  manifest.phrases=results;manifest.summary={...manifest.summary,validationStatus:'PASS',intentionalTextVariations:report.intentionalVariations.length,
    unresolvedTextMismatches:0,needsReview:audioReview.length,remotionPrepared:true,remotionActivated:true};
  manifest.textComparison='Ordered event/voice indices and resolved CapCut links; exact script comparison with explicit, pinned intentional-variation approvals. displayText and spokenText remain separate.';
  manifest.timingPolicy='Consecutive processed WAVs without generic added gaps. Four existing silent/image holds remain separate. Mask transition occupies existing trailing silence.';
  write(manifestFile,manifest);
  write(path.join(publicRoot,'capcut-tts/active.json'),{version:1,validated:true,units:'seconds',
    mapping,phrases:results,durationSeconds,durationInFrames});
  write(path.join(output,'remotion-event-timeline.json'),timeline);
  fs.writeFileSync(path.join(output,'validation.md'),[
    '# CapCut integration validation', '',
    `PASS: ${results.length} WAVs / ${voices.length} voice events; ${report.silentEvents.length} non-voice events.`,
    `Duration before frame rounding: ${durationSeconds.toFixed(6)}s; ${durationInFrames} frames at 30fps.`,
    'All WAVs reused; no extra head/tail trim, no generic inter-voice gap or overlapping WAVs.', '',
    '## Explicitly approved TTS variations',
    '| Voice | Display text | Spoken text |','|---|---|---|',
    ...report.intentionalVariations.map(p=>`| ${p.voiceIndex} | ${p.displayText} | ${p.spokenText} |`), '',
    '## Listening review',
    'PCM matches the recorded speed/source-trim transformation. No additional head cut was introduced. Energy alone cannot establish phonetic completeness.',
    ...audioReview.map(p=>`- ${p.voiceIndex}: ${p.reasons.join('; ')}`),
  ].join('\n')+'\n');
  console.log(JSON.stringify({...report,audioReview:audioReview.map(x=>x.voiceIndex)},null,2));
}
try{main();}catch(e){console.error(e.stack);process.exitCode=1;}
