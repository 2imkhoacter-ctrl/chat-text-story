
import React from 'react';
import {AbsoluteFill,Easing,Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Audio,Video} from '@remotion/media';
import {ZoomOverlay} from './ZoomOverlay';

export const runtimeEvents=(data:any,props:any)=>{
 const fps=data.episode.fps;
 let cursor=Math.round((props['Initial Margin']??data.audio.initialMarginSeconds)*fps),previous:any=null;
 return data.timeline.events.map((event:any)=>{
  if(event.type==='IMAGE'){
   // Thời gian giữ bubble không thoại chỉnh được từ Inspector; thiếu prop thì giữ nguyên durationInFrames đã build.
   const hold=props['Image Hold']?.[event.id];
   const frames=typeof hold==='number'&&Number.isFinite(hold)?Math.max(0,Math.round(hold*fps)):event.durationInFrames;
   const q={...event,durationInFrames:frames,startFrame:cursor,timelineStart:cursor/fps,timelineEnd:(cursor+frames)/fps,holdEnd:(cursor+frames)/fps,maskStopY:props['Bubble Mask Y']?.[event.id]??event.maskStopY};
   cursor+=frames;
   previous=null;
   return q;
  }
  if(previous){
   const credit=(previous.retainedTrailingSilenceSeconds||0)+(event.retainedLeadingSilenceSeconds||0),gap=Math.max(0,(props['Normal Gap']??data.audio.normalGapSeconds)-credit);
   cursor+=Math.ceil(gap*fps-1e-9);
  }
  const pause=props['Pause After']?.[event.clipId]??event.pauseAfterSeconds??0;
  const q={...event,startFrame:cursor,timelineStart:cursor/fps,timelineEnd:(cursor+event.durationInFrames)/fps,holdEnd:(cursor+event.durationInFrames+Math.round(pause*fps))/fps,maskStopY:props['Bubble Mask Y']?.[event.id]??event.maskStopY};
  cursor+=event.durationInFrames+Math.round(pause*fps);
  previous=event;
  return q;
 });
};

const shiftedSfxCues=(data:any,events:any[])=>data.sfx.cues.map((cue:any)=>{
 const original=data.timeline.events.find((x:any)=>x.id===cue.eventId);
 const current=events.find((x:any)=>x.id===cue.eventId);
 const delta=(current?.timelineStart??0)-(original?.timelineStart??0);
 return {...cue,timelineStart:cue.timelineStart+delta};
});

export const calculateStoryDurationInFrames=(data:any,props:any)=>{
 const fps=data.episode.fps,events=runtimeEvents(data,props);
 const eventEnd=Math.max(0,...events.map((event:any)=>event.holdEnd??event.timelineEnd??0))+(props['End Margin']??0);
 const sfxEnd=Math.max(0,...shiftedSfxCues(data,events).filter((cue:any)=>cue.preserveFullDuration!==false).map((cue:any)=>cue.timelineStart+(data.assets.sfx[cue.assetId]?.durationSeconds??0)));
 return Math.max(1,Math.ceil(Math.max(eventEnd,sfxEnd)*fps));
};

const BackgroundMusic=({asset}:any)=>{
 const {fps,durationInFrames}=useVideoConfig();
 const length=Math.max(1,Math.round(asset.durationSeconds*fps));
 const crossfade=Math.min(Math.round(asset.crossfadeSeconds*fps),Math.floor(length/4));
 if(!asset.loop||crossfade<=0)return <Audio name="Background music" src={staticFile(asset.relativeFile)} loop={asset.loop} volume={asset.gain}/>;
 const step=length-crossfade,count=durationInFrames<=length?1:1+Math.ceil((durationInFrames-length)/step);
 return <>{Array.from({length:count},(_,i)=><Audio key={i} name="Background music" src={staticFile(asset.relativeFile)} from={i*step} durationInFrames={Math.min(length,durationInFrames-i*step)} volume={(f)=>asset.gain*(i>0?Math.sin(Math.min(1,Math.max(0,f/crossfade))*Math.PI/2):1)*(i<count-1?Math.cos(Math.min(1,Math.max(0,(f-(length-crossfade))/crossfade))*Math.PI/2):1)}/>)}</>;
};

export const GenericStory=({data,...props}:any)=>{
 const frame=useCurrentFrame();
 const {fps,width,height}=useVideoConfig();
 const time=frame/fps;
 const events=runtimeEvents(data,props);
let index=events.findLastIndex((x:any)=>
  (x.id==='koa06-024' ? frame>=850 : x.timelineStart<=time)
);
 if(index<0)index=0;

 const event=events[index];
 const screen=data.assets.screenshots[event.screenshot];
 const first=index===0||events[index-1].screenshot!==event.screenshot;
 const previous=first?event.rawTopY:(events[index-1].maskStopY??event.rawTopY);
 const reveal=props['Bubble Reveal Duration']??data.visuals.bubbleRevealDurationSeconds;

 // Riêng bubble "..." xuất hiện tức thì, không chạy hiệu ứng reveal.
 const mask=event.id==='koa06-024'
  ? event.maskStopY
  : first
   ? event.maskStopY
   : interpolate(
      time,
      [event.timelineStart,event.timelineStart+reveal],
      [previous,event.maskStopY],
      {
       easing:Easing.inOut(Easing.cubic),
       extrapolateLeft:'clamp',
       extrapolateRight:'clamp'
      }
     );

 const perY=props['Per-Screenshot Y Offset']?.[event.screenshot]??0;
 const globalY=props['Screenshot Y Offset']??0;
 const scale=Math.min(width/data.visuals.layoutReference.width,height/data.visuals.layoutReference.height)*(props['Chat Scale']??1);

 const shiftedSfx=shiftedSfxCues(data,events);
 const zoom=(data.zoomEvents||[]).find((z:any)=>z.enabled!==false&&z.eventId===event.id);

 return <AbsoluteFill style={{background:'#141821'}}>
  <Video name="Gameplay" src={staticFile(data.assets.gameplay.relativeFile)} loop={data.assets.gameplay.loop} volume={data.assets.gameplay.gain} objectFit={data.assets.gameplay.objectFit} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectPosition:data.assets.gameplay.objectPosition}}/>
  <div data-screenshot={event.screenshot} style={{position:'absolute',left:(width-screen.width)/2+(props['Screenshot X Offset']??0),top:(props['Chat Vertical Position']??height/2)-screen.height/2+globalY,width:screen.width,height:screen.height,scale:scale*(screen.scale??1),translate:`0px ${perY}px`,transformOrigin:'center center',overflow:'hidden',clipPath:`inset(0 0 ${Math.max(0,screen.height-mask)}px 0)`}}>
   <Img src={staticFile(screen.relativeFile)} style={{width:'100%',height:'100%'}}/>
  </div>
  <ZoomOverlay zoom={zoom} event={event} screen={screen} frame={frame} fps={fps} width={width} sourceScale={scale} chatVerticalPosition={props['Chat Vertical Position']??height/2} screenshotX={props['Screenshot X Offset']??0} screenshotY={globalY+perY}/>
  {events.filter((x:any)=>x.type==='VOICE').map((x:any)=><Audio key={x.id} name={x.text} src={staticFile(x.relativeAudioFile)} from={x.startFrame} durationInFrames={x.durationInFrames} volume={x.gain} playbackRate={1}/>)}
  <BackgroundMusic asset={data.assets.music}/>
  {shiftedSfx.map((x:any)=><Audio key={x.id} name={x.assetId} src={staticFile(data.assets.sfx[x.assetId].relativeFile)} from={Math.round(x.timelineStart*fps)} durationInFrames={Math.ceil(data.assets.sfx[x.assetId].durationSeconds*fps)} volume={x.gain}/>)}
 </AbsoluteFill>;
};
