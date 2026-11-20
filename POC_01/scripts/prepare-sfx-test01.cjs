const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const config=read('data/sfx-test01-config.json'),speech=read('public/capcut-tts/active.json');
const {buildEventTimeline,visualState}=require('../src/capcut-timeline.cjs');
const {applySfxTimeline}=require('../src/sfx-test01-timeline.cjs');
const ffprobe=path.join(require('@remotion/compositor-win32-x64-msvc').dir,'ffprobe.exe');
function probe(file){
  const r=spawnSync(ffprobe,['-v','error','-show_entries','format=duration:stream=codec_type','-of','json',file],{encoding:'utf8',windowsHide:true});
  assert.equal(r.status,0,r.stderr);const d=JSON.parse(r.stdout);assert(d.streams.some(s=>s.codec_type==='audio'));return +d.format.duration;
}
function waveform(file){
  const b=fs.readFileSync(file);assert.equal(b.toString('ascii',0,4),'RIFF');let rate,channels,data;
  for(let i=12;i+8<=b.length;){const n=b.readUInt32LE(i+4),start=i+8,key=b.toString('ascii',i,i+4);
    if(key==='fmt '){assert.equal(b.readUInt16LE(start),1);assert.equal(b.readUInt16LE(start+14),16);channels=b.readUInt16LE(start+2);rate=b.readUInt32LE(start+4);}
    if(key==='data'){data=b.subarray(start,start+n);break;}i=start+n+n%2;
  }
  assert(data&&rate&&channels);return {rate,channels,data,duration:data.length/(2*channels*rate)};
}
function detectTail(file,advanceSeconds,offsetSeconds){
  const w=waveform(file),step=Math.round(w.rate*.005),bins=[];
  for(let f=0;f<w.data.length/(2*w.channels);f+=step){let sum=0,n=0;
    for(let j=f;j<Math.min(f+step,w.data.length/(2*w.channels));j++)for(let c=0;c<w.channels;c++){
      const v=w.data.readInt16LE((j*w.channels+c)*2)/32768;sum+=v*v;n++;
    }bins.push({time:f/w.rate,end:Math.min((f+step)/w.rate,w.duration),rms:Math.sqrt(sum/n)});
  }
  const overall=Math.max(...bins.map(b=>b.rms)),threshold=Math.max(.001,overall*.0125);
  const last=bins.findLastIndex(b=>b.rms>threshold);assert(last>=0,'No speech energy');
  let start=last,quiet=0;
  for(let i=last;i>=0&&bins[last].end-bins[i].time<.4;i--){
    if(bins[i].rms<=threshold)quiet++;else quiet=0;
    if(quiet>=6){start=i+quiet;break;}start=i;
  }
  let peak=start;for(let i=start;i<=last;i++)if(bins[i].rms>bins[peak].rms)peak=i;
  const candidates=[];
  for(let i=peak+1;i<=last;i++)if(bins[i].rms>threshold&&bins[i].rms<=bins[peak].rms*.4&&
    bins[i].rms<bins[i-1].rms&&bins[i+1]?.rms<=bins[peak].rms*.5)candidates.push(i);
  let chosen=candidates.find(i=>bins[last].end-bins[i].time<=.12);
  const review=[];
  if(chosen===undefined){
    chosen=last;
    for(let i=last;i>peak;i--)if(bins[last].end-bins[i].time>=.025&&bins[i].rms>threshold){chosen=i;break;}
    review.push('No sustained low-energy decay found; conservative final-active-region fallback');
  }
  const boomTime=bins[chosen].time;
  const desired=boomTime-advanceSeconds+offsetSeconds;
  // Do not advance into the strong peak/main body of the estimated final syllable.
  const earliest=advanceSeconds>0?Math.min(boomTime,bins[peak].end):bins[start].time;
  const selected=bins.filter((b,i)=>i>=start&&i<=last&&b.time>=earliest&&b.rms>threshold)
    .reduce((a,b)=>Math.abs(b.time-desired)<Math.abs(a.time-desired)?b:a,bins[chosen]);
  if(advanceSeconds>0&&boomTime-selected.time<.06)review.push('Earlier TAIL clamped to final-syllable peak; less than 60ms safe advance available');
  if(selected.rms>bins[peak].rms*.5)review.push('TAIL still above half of final-region peak; listen for masking');
  if(bins[last].end-selected.time<.015)review.push('Very short remaining active tail');
  return {localStartSeconds:selected.time,estimatedSpeechEndSeconds:bins[last].end,
    offsetFromSpeechEndSeconds:selected.time-bins[last].end,offsetFromWavEndSeconds:selected.time-w.duration,
    boomReferenceSeconds:boomTime,actualAdvanceSeconds:boomTime-selected.time,
    estimatedFinalSyllableStart:bins[start].time,peakSeconds:bins[peak].time,
    onsetRms:selected.rms,finalRegionPeakRms:bins[peak].rms,activeThresholdRms:threshold,
    confidence:review.length?'REVIEW':'ENERGY_DECAY',review,
    method:'5ms RMS; final active island after >=30ms quiet; descending reduced-energy tail, not phonetic recognition'};
}
function main(){
  const before=read('out/sfx-test01-before.json');
  const lines=fs.readFileSync(path.join(root,'data/sfx-test01-script.txt'),'utf8').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const voices=speech.mapping.events.filter(e=>e.type==='VOICE'),cues=[];let count=0,rest=false;
  for(const line of lines){
    if(line.startsWith('(Nghỉ')){assert.equal(count,40);cues.at(-1).restAfterVoiceSeconds=1;rest=true;continue;}
    const spoken=line.replace(/\[SFX:[^\]]+\]/g,'').replace(/\([^)]*\)/g,'').trim();
    if(spoken){count++;assert.equal(spoken,voices[count-1]?.script_text,'Annotation script order differs at '+count);}
    const tag=line.match(/\[SFX:([^\]]+)\]/)?.[1];if(!tag)continue;
    const effect=tag.split('|')[0].trim();assert(config.files[effect],'Unresolved SFX file: '+effect);
    const mode=/tail/i.test(tag)?'TAIL':'NORMAL',overlay=/OVERLAY/i.test(tag);
    let event;
    if(spoken)event=voices[count-1];
    else {
      const position=count? speech.mapping.events.findIndex(e=>e.voice_index===count)+1:0;
      event=speech.mapping.events[position];assert.equal(event.type,'IMAGE','Image annotation incorrectly mapped');
    }
    assert(!cues.some(c=>c.eventId===event.event_id));
    const cue={eventId:event.event_id,voiceIndex:event.voice_index,scriptText:spoken||event.text,effect,mode,
      gapSeconds:overlay?0:mode==='TAIL'?(config.tailEffects[effect]?.nextVoiceSeconds??config.tailNextVoiceSeconds):+tag.match(/GAP:\s*([\d.]+)s/i)[1]};
    if(overlay)cue.overlay=true;
    if(config.tailEffects[effect]?.gainDb!==undefined)cue.gain=10**(config.tailEffects[effect].gainDb/20);
    if(mode==='TAIL')Object.assign(cue,detectTail(speech.phrases[event.voice_index-1].processedWav,
      config.tailEffects[effect]?.advanceSeconds??0,config.eventTailOffsetsSeconds[event.event_id]??0));
    cues.push(cue);
  }
  assert.equal(count,voices.length);assert(rest,'Missing special rest');
  const assets={};
  for(const effect of new Set(cues.map(c=>c.effect))){
    const source=path.join(config.libraryDirectory,config.files[effect]);assert(fs.existsSync(source),'Missing SFX: '+source);
    const revision=hash(source),relativeAudioFile='sfx/test01/'+config.files[effect],target=path.join(root,'public',relativeAudioFile);
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);assert.equal(hash(target),revision);
    assets[effect]={source,relativeAudioFile,durationSeconds:probe(source),sha256:revision};
  }
  const plan={version:1,units:'seconds',assets,cues,eventHoldsSeconds:config.eventHoldsSeconds??{}};
  const configVideo={...read('video.config.json'),...read('video.v4a2.config.json')};
  const props={'Initial Margin':configVideo.initialMarginSeconds,'Normal Gap':configVideo.defaultPauseAfterSeconds,'Pause After':{}};
  const base=buildEventTimeline(speech.mapping,speech,props),timeline=applySfxTimeline(base,plan);
  const frames=Math.ceil(timeline.durationSeconds*30);
  assert.equal(timeline.phrases.filter(p=>p.type==='VOICE').length,voices.length);
  assert.equal(timeline.phrases.length,base.phrases.length);
  timeline.phrases.forEach((p,i)=>{
    const original=base.phrases[i];
    for(const key of ['voiceIndex','event_id','screenshot','maskStopY','relativeAudioFile','clipDuration'])assert.equal(p[key],original[key]);
    if(p.type==='VOICE'){
      assert(Math.abs(p.timelineEnd-p.timelineStart-original.clipDuration)<1e-8);
      const state=visualState({...timeline,phrases:timeline.phrases.map((q,j)=>({...q,transitionEnd:Math.min(q.transitionStart+.23,timeline.phrases[j+1]?.transitionStart??Infinity)}))},
        Math.ceil(p.timelineStart*30)/30);
      // The approved 230ms reveal can still be in motion at WAV onset. In a
      // same-image reveal visualState labels the outgoing event until it ends.
      assert.equal(state.event.screenshot,p.screenshot,'Wrong screenshot at voice onset');
      assert(state.event.event_id===p.event_id||state.toY===p.maskStopY,'Wrong reveal target at voice onset');
    }
    if(i+1<timeline.phrases.length)assert(timeline.phrases[i+1].timelineStart>=p.timelineEnd-1e-8,'Unexpected TTS overlap');
  });
  const placements=timeline.sfx.map(s=>{
    const i=timeline.phrases.findIndex(p=>p.event_id===s.eventId),p=timeline.phrases[i];
    const next=timeline.phrases[i+1],nextVoice=timeline.phrases.slice(i+1).find(q=>q.type==='VOICE');
    if(s.mode==='NORMAL'){
      const startWithVoice=p.type==='VOICE'&&(s.effect==='TING MES'||s.effect==='EMOJI');
      assert(Math.abs(s.timelineStart-(startWithVoice?p.timelineStart:p.type==='VOICE'?p.timelineEnd:p.timelineStart))<1e-8);
      if(next)assert(Math.abs(next.timelineStart-(startWithVoice?p.holdEnd:s.timelineStart+s.gapSeconds))<1e-8);
    }else {
      assert(s.onsetRms>s.activeThresholdRms,'TAIL starts in silence');
      assert(s.localStartSeconds<s.estimatedSpeechEndSeconds);
      const silentHold=timeline.phrases.slice(i+1).filter(q=>q.timelineStart<(nextVoice?.timelineStart??Infinity)).reduce((sum,q)=>sum+q.holdEnd-q.timelineStart,0);
      if(s.overlay&&next)assert(Math.abs(next.timelineStart-p.holdEnd)<1e-8);
      else if(nextVoice&&!s.restAfterVoiceSeconds)assert(Math.abs(nextVoice.timelineStart-Math.max(p.timelineEnd+silentHold,s.timelineStart+s.gapSeconds))<1e-8);
      if(s.restAfterVoiceSeconds)assert(Math.abs(nextVoice.timelineStart-p.timelineEnd-1)<1e-8);
    }
    assert(s.timelineEnd<=frames/30,'SFX tail would be cut');
    return {...s,nextVoiceStart:nextVoice?.timelineStart??null,nextEventStart:next?.timelineStart??null};
  });
  for(const [f,h] of Object.entries(before.hashes))assert.equal(hash(path.resolve(root,f)),h,'Protected file changed: '+f);
  for(const a of Object.values(assets))assert.equal(hash(a.source),a.sha256,'SFX library changed');
  const report={status:'PASS',spokenPhrases:count,silentEvents:timeline.phrases.filter(p=>p.type!=='VOICE').length,
    counts:Object.fromEntries(Object.keys(assets).map(k=>[k,cues.filter(c=>c.effect===k).length])),
    durationSeconds:timeline.durationSeconds,durationInFrames:frames,
    sfxEndMaximum:Math.max(...timeline.sfx.map(s=>s.timelineEnd)),protectedFilesUnchanged:true,
    composition:'ChatTextStory-SFX-Test-01',assets,placements,
    needsListeningReview:placements.filter(s=>s.mode==='TAIL').map(s=>({eventId:s.eventId,voiceIndex:s.voiceIndex,effect:s.effect,
      detectorConfidence:s.confidence,review:s.review,note:'Energy-based first placement; confirm by listening, no phonetic certainty claimed'}))};
  fs.writeFileSync(path.join(root,'data/sfx-test01-plan.json'),JSON.stringify(plan,null,2)+'\n');
  fs.writeFileSync(path.join(root,'out/sfx-test01-validation.json'),JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(path.join(root,'out/sfx-test01-timeline.json'),JSON.stringify(timeline,null,2)+'\n');
  const md=['# SFX Test 01','',`PASS: ${count} voices, ${cues.length} SFX, four non-voice events.`,
    `Duration ${report.durationSeconds.toFixed(6)}s; ${frames} frames at 30fps.`,
    'SFX gain defaults to 1.0; explicit per-effect gainDb overrides apply only to that effect. PlaybackRate 1.0, full source files. No trim/fade; speech waits use cue gaps, not SFX durations.',
    'The existing ... hold after voice 22 is contained inside the 0.85s TAIL-to-next-voice interval. Voice 40 uses max(BOOM gap, voice end + 1s), not both added.',
    'All TAIL placements should be heard in Studio. REVIEW indicates weaker energy evidence, not an audio modification.', '',
    '| Voice/event | Effect | Mode | Start (s) | Relative to speech end (ms) | Confidence |',
    '|---|---|---|---:|---:|---|',
    ...placements.map(s=>`| ${s.voiceIndex??s.eventId} | ${s.effect} | ${s.mode} | ${s.timelineStart.toFixed(3)} | ${s.offsetFromSpeechEndSeconds===undefined?'—':(s.offsetFromSpeechEndSeconds*1000).toFixed(1)} | ${s.confidence??'NORMAL'} |`),'',
    ...placements.filter(s=>s.review?.length).map(s=>`- Voice ${s.voiceIndex}: ${s.review.join('; ')}`),'',
    '## Sources',...Object.entries(assets).map(([k,a])=>`- ${k}: ${a.source} (${a.durationSeconds.toFixed(3)}s)`),
    '', 'Config: data/sfx-test01-config.json; per-effect advanceSeconds and optional eventTailOffsetsSeconds adjust TAIL placements without touching bubbles.',
    'Rebuild the SFX plan only: node scripts/prepare-sfx-test01.cjs. No TTS extraction or alignment is involved.'];
  fs.writeFileSync(path.join(root,'out/sfx-test01-report.md'),md.join('\n')+'\n');
  console.log(JSON.stringify({status:report.status,counts:report.counts,frames,durationSeconds:report.durationSeconds,
    tailReview:placements.filter(s=>s.confidence==='REVIEW').map(s=>s.voiceIndex)},null,2));
}
module.exports={detectTail};
if(require.main===module){try{main();}catch(e){console.error(e.stack);process.exitCode=1;}}
