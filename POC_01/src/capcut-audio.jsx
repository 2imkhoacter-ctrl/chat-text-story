const React=require('react');
const {Audio}=require('@remotion/media');
const {staticFile,useVideoConfig}=require('remotion');
module.exports=({phrases})=>{
  const {fps}=useVideoConfig();
  return <>{phrases.map(p=><Audio key={p.id} name={p.label}
    src={staticFile(p.relativeAudioFile)+'?revision='+p.processedSha256}
    from={p.timelineStart*fps} durationInFrames={p.processedDuration*fps}/>)}</>;
};
