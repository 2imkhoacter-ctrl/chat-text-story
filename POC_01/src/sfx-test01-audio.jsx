const React=require('react');
const {Audio}=require('@remotion/media');
const {staticFile,useVideoConfig}=require('remotion');
module.exports=({sounds,assets})=>{
  const {fps}=useVideoConfig();
  return <>{sounds.map(s=><Audio key={s.eventId} name={`${s.effect} · ${s.voiceIndex??s.eventId}`}
    src={staticFile(assets[s.effect].relativeAudioFile)+'?revision='+assets[s.effect].sha256}
    from={s.timelineStart*fps} durationInFrames={assets[s.effect].durationSeconds*fps}
    volume={s.gain??1} playbackRate={1}/>)}</>;
};
