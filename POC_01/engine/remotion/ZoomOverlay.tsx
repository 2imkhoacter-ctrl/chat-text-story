import React from 'react';
import {Easing,Img,interpolate,staticFile} from 'remotion';

const pickEasing=(name:any)=>name==='linear'?Easing.linear:name==='ease-in'?Easing.in(Easing.cubic):name==='ease-out'?Easing.out(Easing.cubic):Easing.inOut(Easing.cubic);

// Tùy chọn zoom.translate (người dùng duyệt 2026-11-15, dùng từ KOA10): dời khung zoom theo mốc thời gian để làm hiệu ứng lướt ngang/dọc.
// zoom.translate = {times:[giây tính từ đầu event], x:[px video], y:[px video], easing?}. Không có zoom.translate → dời 0, y hệt bản cũ.
const translateAt=(tr:any,seconds:number,axis:'x'|'y')=>{
 if(!tr||!Array.isArray(tr.times)||!Array.isArray(tr[axis])||tr.times.length===0)return 0;
 if(tr.times.length===1)return tr[axis][0];
 return interpolate(seconds,tr.times,tr[axis],{easing:pickEasing(tr.easing),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
};

export const ZoomOverlay=({zoom,event,screen,frame,fps,width,sourceScale,chatVerticalPosition,screenshotX,screenshotY}:any)=>{
 if(!zoom||zoom.enabled===false||zoom.eventId!==event.id)return null;const local=frame-Math.round(event.timelineStart*fps),easing=pickEasing(zoom.easing),scale=interpolate(local,[zoom.startDelaySeconds*fps,(zoom.startDelaySeconds+zoom.durationSeconds)*fps],[zoom.startScale,zoom.endScale],{easing,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const tx=translateAt(zoom.translate,local/fps,'x'),ty=translateAt(zoom.translate,local/fps,'y');
 return <div data-zoom-event={zoom.id} style={{position:'absolute',left:(width-screen.width*sourceScale)/2+screenshotX+(zoom.anchorX??0),top:chatVerticalPosition-screen.height*sourceScale/2+screenshotY+(zoom.anchorY??0),width:zoom.crop.width*sourceScale,height:zoom.crop.height*sourceScale,overflow:'hidden',translate:`${tx}px ${ty}px`,scale,transformOrigin:zoom.transformOrigin??'center center'}}><Img src={staticFile(screen.relativeFile)} style={{position:'absolute',left:-zoom.crop.x*sourceScale,top:-zoom.crop.y*sourceScale,width:screen.width*sourceScale,height:screen.height*sourceScale}}/></div>;
};
