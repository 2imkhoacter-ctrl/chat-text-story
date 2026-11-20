// SFX timing overlays the existing independent-WAV timeline; never changes clips.
function applySfxTimeline(base,plan){
  const cues=new Map(plan.cues.map(c=>[c.eventId,c]));
  let cursor=base.phrases[0].timelineStart;
  const sounds=[];
  const phrases=base.phrases.map((p,i)=>{
    const shift=cursor-p.timelineStart,cue=cues.get(p.event_id);
    const timelineStart=cursor,timelineEnd=p.timelineEnd+shift;
    const originalHold=p.holdEnd-p.timelineEnd;
    let holdEnd=timelineEnd+Math.max(originalHold,plan.eventHoldsSeconds?.[p.event_id]??0);
    if(cue){
      const startWithVoice=p.type==='VOICE'&&(cue.effect==='TING MES'||cue.effect==='EMOJI');
      const start=startWithVoice?timelineStart:cue.mode==='TAIL'?timelineStart+cue.localStartSeconds:
        p.type==='VOICE'?timelineEnd:timelineStart;
      sounds.push({...cue,timelineStart:start,timelineEnd:start+plan.assets[cue.effect].durationSeconds});
      if(p.type!=='VOICE')holdEnd=start+cue.gapSeconds;
      else if(!startWithVoice&&!cue.overlay&&!(i===base.phrases.length-1&&cue.effect==='hỗn loạn')){
        // A preserved silent event after a TAIL fits INSIDE the next-voice gap.
        let silentHold=0;
        if(cue.mode==='TAIL')for(let j=i+1;j<base.phrases.length&&base.phrases[j].type!=='VOICE';j++){
          const silent=base.phrases[j],silentCue=cues.get(silent.event_id);
          silentHold+=silentCue?.gapSeconds??(silent.holdEnd-silent.timelineStart);
        }
        holdEnd=Math.max(holdEnd,start+cue.gapSeconds-silentHold,
          cue.restAfterVoiceSeconds?timelineEnd+cue.restAfterVoiceSeconds:0);
      }
    }
    cursor=holdEnd;
    // Keep the original 230ms animation/easing and original mask coordinates.
    // At marked holds, move the same reveal window to the end of the new hold.
    const addedHold=holdEnd-(p.holdEnd+shift);
    return {...p,timelineStart,timelineEnd:p.type==='VOICE'?timelineEnd:holdEnd,holdEnd,
      transitionStart:p.transitionStart+shift+addedHold,
      transitionEnd:p.transitionEnd+shift+addedHold};
  });
  // Full SFX tails may outlast the story; they never block intermediate speech.
  return {...base,phrases,sfx:sounds,durationSeconds:Math.max(cursor,...sounds.map(s=>s.timelineEnd))};
}
module.exports={applySfxTimeline};
