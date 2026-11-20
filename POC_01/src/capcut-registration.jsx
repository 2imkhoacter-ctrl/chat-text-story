const React=require('react');
const {Composition,Img,staticFile,useCurrentFrame,useVideoConfig,interpolate,Easing}=require('remotion');
const {Video,Audio}=require('@remotion/media');
const {getAudioDurationInSeconds}=require('@remotion/media-utils');
const {Input,UrlSource,MP4}=require('mediabunny');
const {z}=require('zod');
const speech=require('../public/capcut-tts/active.json');
const mapping=speech.mapping;
if(!speech.validated)throw Error('CapCut audio validation required');
const AudioTimeline=require('./capcut-audio.jsx');
const {buildEventTimeline,visualState}=require('./capcut-timeline.cjs');
const {applySfxTimeline}=require('./sfx-test01-timeline.cjs');
const SfxTimeline=require('./sfx-test01-audio.jsx');
const sfxPlan=require('../data/sfx-test01-plan.json');
const buildTimeline=props=>{
  const timeline=buildEventTimeline(mapping,speech,props);
  return props.sfxTest?applySfxTimeline(timeline,sfxPlan):timeline;
};
const config={...require('../video.config.json'),...require('../video.v4a2.config.json')};
const BUBBLE_ANIMATION_SECONDS=0.23;
const BACKGROUND_MUSIC='audio/background music.MP3';
const BACKGROUND_MUSIC_REVISION='21e1cb7932a75a28df1f1bca1416d47c5db9aa522e398a13d0d790d64f4001f8';
// Source includes -9.4dB; user requested an additional -6dB for music only.
const BACKGROUND_MUSIC_GAIN=0.5011872336272722;
const BackgroundMusic=({durationSeconds,gain})=>{
  const {fps,durationInFrames}=useVideoConfig();
  if(!(durationSeconds>0)||!(gain>0))return null;
  const length=durationSeconds*fps,crossfade=Math.min(.5*fps,length/4),step=length-crossfade;
  const count=durationInFrames<=length?1:1+Math.ceil((durationInFrames-length)/step);
  return <>{Array.from({length:count},(_,i)=><Audio key={i} name="Background music"
    src={staticFile(BACKGROUND_MUSIC)+'?revision='+BACKGROUND_MUSIC_REVISION} from={i*step} durationInFrames={Math.min(length,durationInFrames-i*step)}
    volume={f=>gain*(i>0?Math.sin(Math.min(1,Math.max(0,f/crossfade))*Math.PI/2):1)
      *(i<count-1?Math.cos(Math.min(1,Math.max(0,(f-(length-crossfade))/crossfade))*Math.PI/2):1)}/>)}</>;
};
const defaults={
  'Normal Gap':config.defaultPauseAfterSeconds,'Initial Margin':config.initialMarginSeconds,
  'End Margin':config.endMarginSeconds,'Chat Scale':config.chatScale,'Chat Vertical Position':config.chatVerticalPosition,
  'Pause After':Object.fromEntries(speech.phrases.map((p,i)=>[`Phrase ${i+1}`,0])),
};
const Story=props=>{
  const {width,height,fps,durationInFrames}=useVideoConfig();
  const seconds=useCurrentFrame()/fps;
  const timeline=buildTimeline(props);
  const state=visualState({...timeline,phrases:timeline.phrases.map((p,i)=>({...p,
    transitionEnd:Math.min(p.transitionStart+BUBBLE_ANIMATION_SECONDS,timeline.phrases[i+1]?.transitionStart??Infinity),
  }))},seconds);
  const dimensions=mapping.screenshots.find(s=>s.filename===state.event.screenshot);
  const reference=mapping.layout_reference;
  const sourceScale=Math.min(width/reference.width,height/reference.height)*props['Chat Scale'];
  const maskY=state.maskY??interpolate(seconds,[state.transitionStart,state.transitionEnd],[state.fromY,state.toY],{
    easing:Easing.inOut(Easing.cubic),extrapolateLeft:'clamp',extrapolateRight:'clamp',
  });
  return <>
    <div style={{position:'absolute',inset:0,background:'#000'}}/>
    <Video name="Gameplay background" src={staticFile(config.gameplay.replace(/^public\//,''))} from={0} trimBefore={0}
      durationInFrames={durationInFrames} volume={10**(-9.4/20)} objectFit="cover" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>
    <div data-event={state.event.event_id} data-mask-y={maskY} style={{position:'absolute',
      left:(width-dimensions.width)/2,top:props['Chat Vertical Position']-dimensions.height/2,
      width:dimensions.width,height:dimensions.height,scale:sourceScale,transformOrigin:'center center',overflow:'hidden',
      clipPath:`inset(0px 0px ${Math.max(0,dimensions.height-maskY)}px 0px)`}}>
      <Img src={staticFile('chat-screenshots/'+dimensions.filename)} style={{width:'100%',height:'100%'}}/>
    </div>
    <AudioTimeline phrases={timeline.phrases.filter(p=>p.type==='VOICE')}/>
    <BackgroundMusic durationSeconds={props.backgroundMusicDurationSeconds} gain={BACKGROUND_MUSIC_GAIN}/>
    {props.sfxTest?<SfxTimeline sounds={timeline.sfx} assets={sfxPlan.assets}/>:null}
  </>;
};
module.exports=({id='ChatTextStory-CapCut-WAV',sfxTest=false}={})=> <Composition id={id} component={Story} width={1080} height={1920} fps={30}
  schema={z.object({
    'Normal Gap':z.number().min(0).max(10).step(.01),'Initial Margin':z.number().min(0).max(10).step(.01),
    'End Margin':z.number().min(0).max(10).step(.01),'Chat Scale':z.number().min(.1).max(2).step(.01),
    'Chat Vertical Position':z.number().min(-1920).max(3840),
    'Pause After':z.object(Object.fromEntries(speech.phrases.map((_,i)=>[`Phrase ${i+1}`,z.number().min(0).max(300).step(.01)]))),
  })}
  durationInFrames={Math.ceil((buildTimeline({...defaults,sfxTest}).durationSeconds+(sfxTest?0:defaults['End Margin']))*30)}
  defaultProps={{...defaults,sfxTest}}
  calculateMetadata={async({props})=>{
    const durationInFrames=Math.ceil((buildTimeline(props).durationSeconds+(props.sfxTest?0:props['End Margin']))*30);
    const input=new Input({source:new UrlSource(staticFile(config.gameplay.replace(/^public\//,''))),formats:[MP4]});
    try{
      const track=await input.getPrimaryVideoTrack();
      if(!track)throw Error('Gameplay has no video track');
      if(await track.computeDuration()<durationInFrames/30)throw Error('Gameplay is too short for V4B; looping is not enabled.');
    }finally{input.dispose();}
    return {durationInFrames,props:{...props,backgroundMusicDurationSeconds:await getAudioDurationInSeconds(staticFile(BACKGROUND_MUSIC)+'?revision='+BACKGROUND_MUSIC_REVISION)}};
  }}/>;
