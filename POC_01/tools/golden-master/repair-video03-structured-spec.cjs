const fs=require('fs'); const path=require('path');
const root=path.resolve(__dirname,'../..');
const golden=path.join(root,'golden-masters/girlfriend03-approved-20261028');
const docs=path.join(root,'docs/chat-text-story-system');
const stateFile=path.join(golden,'VIDEO03_APPROVED_STATE.json');
const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));
for(const voice of state.voices){
  voice.speaker=/\.mp3$/i.test(voice.sourceFile||'')?'multi_female_skye_uranus_bigtts':'unresolved_capcut_voice_id';
}
const my=state.voices.filter(x=>x.speaker==='multi_female_skye_uranus_bigtts');
if(my.length!==13)throw Error(`Expected 13 My clips, found ${my.length}`);
state.myFinalState={speaker:'multi_female_skye_uranus_bigtts',identificationEvidence:'13 MP3 TTS sources; audio-processing summary records the selective My tail cut on voice indices 58 and 59',count:13,retainedExtraTailCutVoiceIndices:[58,59],retainedExtraTailCutTexts:['Ồ','Thế để công bằng'],restoredOtherCount:11,rule:'Preserve the frozen processed audio hashes; never recreate this state by rerunning trim.'};
let shift=(state.props['Initial Margin']??.05)-.05;
for(const voice of state.voices){
  voice.baseTimelineStart=voice.timelineStart; voice.baseTimelineEnd=voice.timelineEnd;
  const pause=state.props['Pause After']?.[`Phrase ${voice.voiceIndex}`]??0;
  const desired=Math.max(0,(state.props['Normal Gap']??.1)-(voice.retainedLeadingSilenceSeconds+voice.retainedTrailingSilenceSeconds));
  const gapDelta=voice.voiceIndex===31?0:desired-(voice.timelineGapSeconds??.1);
  voice.timelineStart+=shift; voice.timelineEnd+=shift; voice.pauseAfter=pause;
  shift+=pause+gapDelta;
}
const shiftByEvent=new Map(state.voices.map(v=>[v.eventId,v.timelineStart-v.baseTimelineStart]));
for(const cue of state.sfxCues){cue.baseTimelineStart=cue.timelineStart; cue.baseTimelineEnd=cue.timelineEnd; const d=shiftByEvent.get(cue.eventId)??0; cue.timelineStart+=d; cue.timelineEnd+=d; if(cue.speechEnd!=null)cue.speechEnd+=d; if(cue.decayStart!=null)cue.decayStart+=d;}
state.dimensions.baseTimelineDurationSeconds=state.dimensions.durationSeconds;
state.dimensions.baseTimelineDurationInFrames=state.dimensions.durationInFrames;
state.dimensions.durationSeconds=93.7; state.dimensions.durationInFrames=2811;
state.timelineSemantics='Effective Studio timeline applies approved Props to the base timeline. Composition listing is authoritative for effective duration.';
fs.writeFileSync(stateFile,JSON.stringify(state,null,2)+'\n');
const rows=state.voices.map(x=>`| ${x.voiceIndex} | ${x.speaker} | ${x.text.replaceAll('|','\\|')} | ${x.speed} | ${x.gain} | ${x.timelineStart.toFixed(6)} | ${x.processedDuration.toFixed(6)} | ${x.pauseAfter} | \`${x.processedSha256}\` |`).join('\n');
let spec=fs.readFileSync(path.join(docs,'VIDEO03_APPROVED_SPEC.md'),'utf8')
  .replace('- Duration: 95.01033366666667s / 2851 frames','- Effective Studio duration: 93.70s / 2811 frames. Base timeline snapshot: 95.01033366666667s / 2851 frames; approved Props (Normal Gap 0) produce the effective runtime timeline.')
  .replace('- My: 0 clips. Only','- My: 13 clips. Only')
  .replace(/\| # \| Speaker \| Text[\s\S]*?\n\n## SFX cues/,`| # | Speaker | Text | Speed | Gain | Start (s) | WAV duration (s) | Pause After | SHA-256 |\n|---:|---|---|---:|---:|---:|---:|---:|---|\n${rows}\n\nSpeaker note: My is evidenced by the 13 MP3 TTS sources and the audio-processing policy. The other 63 per-line speaker IDs are not persisted in the runtime metadata, so they are marked unresolved instead of guessed.\n\n## SFX cues`);
const cueRows=state.sfxCues.map(x=>`| ${x.effect} | ${x.eventId} | ${x.mode} | ${x.timelineStart.toFixed(6)} | ${(x.timelineEnd-x.timelineStart).toFixed(6)} | ${x.gain??1} |`).join('\n');
spec=spec.replace(/\| Effect \| Event \| Mode[\s\S]*?\n\nAll visual coordinates/,`| Effect | Event | Mode | Effective start (s) | Duration (s) | Gain |\n|---|---|---|---:|---:|---:|\n${cueRows}\n\nAll visual coordinates`);
fs.writeFileSync(path.join(docs,'VIDEO03_APPROVED_SPEC.md'),spec);
const catalogFile=path.join(docs,'SFX_CATALOG.json'); const catalog=JSON.parse(fs.readFileSync(catalogFile,'utf8'));
catalog.approvedVideo03Cues=state.sfxCues; catalog.timelineNote='Cues use the effective Studio timeline after approved Props, not raw base timeline timestamps.';
fs.writeFileSync(catalogFile,JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({myVoices:my.map(x=>({voiceIndex:x.voiceIndex,text:x.text,sha256:x.processedSha256})),otherSpeakerIds:'unresolved rather than guessed'},null,2));
