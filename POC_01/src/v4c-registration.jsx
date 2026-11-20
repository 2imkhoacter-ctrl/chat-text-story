const React=require('react');
const {Composition,Img,staticFile,useCurrentFrame,useVideoConfig,interpolate,Easing}=require('remotion');
const {Video}=require('@remotion/media');
const {Input,UrlSource,MP4}=require('mediabunny');
const {z}=require('zod');
const mapping=require('../data/chat-events.json');
const speech=require('../public/generated-audio-v4c/timing-manifest.json');
const AudioTimeline=require('./v4c-audio.jsx');
const {buildEventTimeline,visualState}=require('./v4b-timeline.cjs');
const config={...require('../video.config.json'),...require('../video.v4a2.config.json')};
const defaults={
  'Normal Gap':config.defaultPauseAfterSeconds,'Initial Margin':config.initialMarginSeconds,
  'End Margin':config.endMarginSeconds,'Chat Scale':config.chatScale,'Chat Vertical Position':config.chatVerticalPosition,
  'Pause After':Object.fromEntries(speech.phrases.map((p,i)=>[`Phrase ${i+1}`,config.phrasePauses[p.id]??p.pauseAfter??0])),
};
const Story=props=>{
  const {width,height,fps,durationInFrames}=useVideoConfig();
  const seconds=useCurrentFrame()/fps;
  const timeline=buildEventTimeline(mapping,speech,props);
  const state=visualState(timeline,seconds);
  const dimensions=mapping.screenshots.find(s=>s.filename===state.event.screenshot);
  const reference=mapping.layout_reference;
  const sourceScale=Math.min(width/reference.width,height/reference.height)*props['Chat Scale'];
  const maskY=state.maskY??interpolate(seconds,[state.transitionStart,state.transitionEnd],[state.fromY,state.toY],{
    easing:Easing.inOut(Easing.ease),extrapolateLeft:'clamp',extrapolateRight:'clamp',
  });
  return <>
    <div style={{position:'absolute',inset:0,background:'#000'}}/>
    <Video name="Gameplay background" src={staticFile(config.gameplay.replace(/^public\//,''))} from={0} trimBefore={0}
      durationInFrames={durationInFrames} muted objectFit="cover" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>
    <div data-event={state.event.event_id} data-mask-y={maskY} style={{position:'absolute',
      left:(width-dimensions.width)/2,top:props['Chat Vertical Position']-dimensions.height/2,
      width:dimensions.width,height:dimensions.height,scale:sourceScale,transformOrigin:'center center',overflow:'hidden',
      clipPath:`inset(0px 0px ${Math.max(0,dimensions.height-maskY)}px 0px)`}}>
      <Img src={staticFile('chat-screenshots/'+dimensions.filename)} style={{width:'100%',height:'100%'}}/>
    </div>
    <AudioTimeline phrases={timeline.phrases.filter(p=>p.type==='VOICE')}/>
  </>;
};
module.exports=()=> <Composition id="ChatTextStory-V4C-AudioNudge" component={Story} width={1080} height={1920} fps={30}
  schema={z.object({
    'Normal Gap':z.number().min(0).max(10).step(.01),'Initial Margin':z.number().min(0).max(10).step(.01),
    'End Margin':z.number().min(0).max(10).step(.01),'Chat Scale':z.number().min(.1).max(2).step(.01),
    'Chat Vertical Position':z.number().min(-1920).max(3840),
    'Pause After':z.object(Object.fromEntries(speech.phrases.map((_,i)=>[`Phrase ${i+1}`,z.number().min(0).max(300).step(.01)]))),
  })}
  durationInFrames={Math.ceil((buildEventTimeline(mapping,speech,defaults).durationSeconds+defaults['End Margin'])*30)}
  defaultProps={{...defaults}}
  calculateMetadata={async({props})=>{
    const durationInFrames=Math.ceil((buildEventTimeline(mapping,speech,props).durationSeconds+props['End Margin'])*30);
    const input=new Input({source:new UrlSource(staticFile(config.gameplay.replace(/^public\//,''))),formats:[MP4]});
    try{
      const track=await input.getPrimaryVideoTrack();
      if(!track)throw Error('Gameplay has no video track');
      if(await track.computeDuration()<durationInFrames/30)throw Error('Gameplay is too short for V4B; looping is not enabled.');
    }finally{input.dispose();}
    return {durationInFrames};
  }}/>;
