// Reuse the existing visualState/mask implementation. Transitions occupy existing
// trailing quiet (or the end of a silent event), never an extra audio gap.
const {visualState}=require('./v4b-timeline.cjs');
function buildEventTimeline(mapping,speech,props){
  let cursor=props['Initial Margin']??.05;
  const fps=30;
  const phrases=mapping.events.map((event,eventIndex)=>{
    const voice=event.type==='VOICE'?speech.phrases[event.voice_index-1]:null;
    if(voice&&voice.bubbleId!==event.event_id)throw Error('Unvalidated CapCut/bubble mapping');
    const duration=voice?voice.processedDuration:event.hold_duration;
    const start=cursor,end=start+duration;
    const pause=voice?(props['Pause After']?.[`Phrase ${event.voice_index}`]??0):0;
    cursor=end+pause;
    // Complete the reveal on the last video frame at/before the next WAV onset.
    const transitionEnd=Math.floor((cursor+1e-9)*fps)/fps;
    const available=voice?voice.trailingSilence+pause:duration;
    const quietStart=cursor-available;
    const transitionStart=Math.min(transitionEnd,Math.max(
      Math.ceil((quietStart-1e-9)*fps)/fps,
      transitionEnd-(props['Normal Gap']??.1)));
    return {...voice,...event,eventIndex:eventIndex+1,voiceIndex:event.voice_index,
      id:event.event_id,label:voice?.spokenText??event.text,clipDuration:voice?duration:0,
      maskStopY:event.mask_stop_y,timelineStart:start,timelineEnd:end,holdEnd:cursor,
      transitionStart,transitionEnd};
  });
  return {phrases,durationSeconds:cursor,timelineModel:'independent-wavs-with-embedded-tail-transition'};
}
module.exports={buildEventTimeline,visualState};
