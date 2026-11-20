const {buildPhraseTimeline} = require('./phrase-timeline.cjs');
const buildEventTimeline = (mapping, speech, props) => {
  const pauses={};
  const phrases=mapping.events.map((event,i)=>{
    const voice=event.voice_index===null?null:speech.phrases[event.voice_index-1];
    pauses[`Phrase ${i+1}`]=voice?(props['Pause After']?.[`Phrase ${event.voice_index}`] ?? voice.pauseAfter ?? 0):event.hold_duration;
    return {...voice,...event,id:event.event_id,clipDuration:voice?voice.clipDuration:0,maskStopY:event.mask_stop_y};
  });
  return buildPhraseTimeline({timelineModel:'voice-hold-gap-v1',phrases},{initialMargin:props['Initial Margin'],normalGap:props['Normal Gap'],pauses});
};
// During cross-image GAP the new image starts above its first new bubble.
// Prior overlap is history, never a second spoken event. Fixed-layout cuts are reported for review.
const visualState = (timeline,seconds) => {
  const list=timeline.phrases;
  for(let i=0;i<list.length-1;i++){
    const a=list[i],b=list[i+1];
    if(seconds<a.transitionStart) return {event:a,maskY:a.maskStopY};
    if(seconds<a.transitionEnd){
      const changing=a.screenshot!==b.screenshot;
      return {event:changing?b:a,fromY:changing?b.raw_top_y:a.maskStopY,toY:b.maskStopY,
        transitionStart:a.transitionStart,transitionEnd:a.transitionEnd};
    }
  }
  return {event:list.at(-1),maskY:list.at(-1).maskStopY};
};
module.exports={buildEventTimeline,visualState};
