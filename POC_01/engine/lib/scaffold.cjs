const {fs,path,writeJson}=require('./utils.cjs');

const labels={
  normalGap:'Khoảng nghỉ mặc định (giây)',
  initialMargin:'Thời gian chờ đầu video (giây)',
  endMargin:'Thời gian chờ cuối video (giây)',
  chatScale:'Tỷ lệ ảnh chat',
  chatVertical:'Vị trí dọc ảnh chat (pixel)',
  reveal:'Thời gian hiện tin nhắn (giây)',
  xOffset:'Dịch ngang ảnh chat (pixel)',
  yOffset:'Dịch dọc toàn bộ ảnh chat (pixel)',
  perScreen:'Dịch dọc từng ảnh (pixel)',
  pauseAfter:'Nghỉ sau câu thoại (giây)',
  imageHold:'Giữ bubble không thoại (giây)',
  bubbleMask:'Mép hiển thị từng tin nhắn (pixel ảnh nguồn)',
};

function localizeProps(props){return {
  [labels.normalGap]:props['Normal Gap'],
  [labels.initialMargin]:props['Initial Margin'],
  [labels.endMargin]:props['End Margin'],
  [labels.chatScale]:props['Chat Scale'],
  [labels.chatVertical]:props['Chat Vertical Position'],
  [labels.reveal]:props['Bubble Reveal Duration'],
  [labels.xOffset]:props['Screenshot X Offset'],
  [labels.yOffset]:props['Screenshot Y Offset'],
  [labels.perScreen]:props['Per-Screenshot Y Offset']||{},
  [labels.pauseAfter]:props['Pause After']||{},
  [labels.imageHold]:props['Image Hold']||{},
  [labels.bubbleMask]:props['Bubble Mask Y']||{},
};}

function scaffold(input,out,built,props){
 const rootRel=path.relative(path.join(out,'src'),path.resolve(__dirname,'../remotion/GenericStory')).replace(/\\/g,'/');
 const data={episode:input.episode,audio:{initialMarginSeconds:input.audio.timeline.initialMarginSeconds,normalGapSeconds:props['Normal Gap']},visuals:{layoutReference:input.visuals.layoutReference,bubbleRevealDurationSeconds:props['Bubble Reveal Duration']},assets:built.assets,timeline:built.timeline,sfx:built.sfx,zoomEvents:input.zoomEvents||[]};
 writeJson(path.join(out,'data/build.json'),data);
 const fps=input.episode.fps,imageHold=Object.fromEntries(built.timeline.events.filter((event)=>event.type==='IMAGE').map((event)=>[event.id,Number((typeof event.durationSeconds==='number'?event.durationSeconds:event.durationInFrames/fps).toFixed(2))]));
 const defaults=JSON.stringify(localizeProps({...props,'Image Hold':imageHold}),null,2).replace(/"([^"\n]+)":/g,"'$1':");
 const registration=`import React from 'react';
import {Composition} from 'remotion';
import {z} from 'zod';
import {GenericStory,calculateStoryDurationInFrames} from '${rootRel}';
import data from '../data/build.json';
const perScreenshotKeys=Object.keys(data.assets.screenshots);
const pauseAfterEvents=data.timeline.events.filter((event:any)=>event.type==='VOICE');
const pauseAfterKeys=pauseAfterEvents.map((event:any)=>event.clipId);
const imageHoldKeys=data.timeline.events.filter((event:any)=>event.type==='IMAGE').map((event:any)=>event.id);
const bubbleMaskKeys=data.timeline.events.map((event:any)=>event.id);
const eventById=Object.fromEntries(data.timeline.events.map((event:any)=>[event.id,event]));
const eventByClipId=Object.fromEntries(pauseAfterEvents.map((event:any)=>[event.clipId,event]));
const sfxByEvent=Object.fromEntries(data.sfx.cues.map((cue:any)=>[cue.eventId,cue.assetId]));
const shortText=(text:string|undefined)=>text?text.replace(/\\s+/g,' ').trim().slice(0,46):'';
const screenshotDescription=(key:string,index:number)=>\`Ảnh \${String(index+1).padStart(2,'0')} (\${key}). Đơn vị: pixel video. Tăng để dịch riêng ảnh này xuống; giảm để dịch lên. Ví dụ +20 dịch xuống 20 pixel. Không đổi mask hoặc timing.\`;
const pauseDescription=(key:string,index:number)=>{const event:any=eventByClipId[key];const sfx=sfxByEvent[event?.id];return \`Câu \${String(index+1).padStart(2,'0')}: \${shortText(event?.text)||key}.\${sfx?\` SFX: \${sfx}.\`:''} Đơn vị: giây bổ sung sau câu. Tăng để câu sau bắt đầu muộn hơn; giảm để bắt đầu sớm hơn. Khoảng nghỉ thực tế còn phụ thuộc Normal Gap và silence được giữ trong WAV. Không sửa file, gain hoặc duration SFX.\`;};
const imageHoldDescription=(key:string,index:number)=>{const event:any=eventById[key];const sfx=sfxByEvent[key];return \`Bubble không thoại \${String(index+1).padStart(2,'0')}: \${shortText(event?.text)||key}.\${sfx?\` SFX: \${sfx}.\`:''} Đơn vị: giây giữ bubble này trước khi tin sau hiện. Tăng để tin sau đến muộn hơn; giảm để đến sớm hơn. Mặc định = thời lượng đã build. Không sửa file, gain hoặc duration SFX.\`;};
const maskDescription=(key:string,index:number)=>{const event:any=eventById[key];const sfx=sfxByEvent[key];return \`Tin \${String(index+1).padStart(2,'0')}: \${shortText(event?.text)||key}.\${sfx?\` SFX: \${sfx}.\`:''} Đơn vị: pixel ảnh nguồn. Tăng để hạ mép cắt và lộ thêm nội dung; giảm để nâng mép cắt. Ví dụ +300 lộ thêm 300 pixel nguồn. Chỉ đổi mép hiển thị event này, không dịch ảnh, avatar hay bubble.\`;};
const toEngineProps=(props:any)=>({
  'Normal Gap':props['${labels.normalGap}']??props['Normal Gap'],
  'Initial Margin':props['${labels.initialMargin}']??props['Initial Margin'],
  'End Margin':props['${labels.endMargin}']??props['End Margin'],
  'Chat Scale':props['${labels.chatScale}']??props['Chat Scale'],
  'Chat Vertical Position':props['${labels.chatVertical}']??props['Chat Vertical Position'],
  'Bubble Reveal Duration':props['${labels.reveal}']??props['Bubble Reveal Duration'],
  'Screenshot X Offset':props['${labels.xOffset}']??props['Screenshot X Offset'],
  'Screenshot Y Offset':props['${labels.yOffset}']??props['Screenshot Y Offset'],
  'Per-Screenshot Y Offset':props['${labels.perScreen}']??props['Per-Screenshot Y Offset'],
  'Pause After':props['${labels.pauseAfter}']??props['Pause After'],
  'Image Hold':props['${labels.imageHold}']??props['Image Hold'],
  'Bubble Mask Y':props['${labels.bubbleMask}']??props['Bubble Mask Y'],
});
const Story=(props:any)=><GenericStory data={data} {...props} {...toEngineProps(props)}/>;
const calculateMetadata=({props}:any)=>({durationInFrames:calculateStoryDurationInFrames(data,toEngineProps(props))});
export default ()=> <Composition id="${input.episode.compositionId}" component={Story} width={${input.episode.width}} height={${input.episode.height}} fps={${input.episode.fps}} durationInFrames={${built.audit.durationInFrames}} calculateMetadata={calculateMetadata} schema={z.object({
  '${labels.normalGap}':z.number().min(0).max(10).describe('Gap cơ bản giữa hai câu, đơn vị giây. Tăng làm hội thoại thưa hơn; giảm làm nhanh hơn. Ví dụ 0.15 = 0,15 giây. Runtime trừ phần leading/trailing silence còn giữ để không cộng gap hai lần.'),
  '${labels.initialMargin}':z.number().min(0).max(10).describe('Khoảng chờ trước event đầu tiên, đơn vị giây. Tăng để bắt đầu muộn hơn; giảm để bắt đầu sớm hơn. Có thể dịch toàn bộ timeline.'),
  '${labels.endMargin}':z.number().min(0).max(10).describe('Khoảng giữ sau event cuối, đơn vị giây. Tăng kéo dài composition; giảm rút ngắn. Duration preview được tính lại và vẫn bảo toàn đuôi SFX.'),
  '${labels.chatScale}':z.number().min(.1).max(3).describe('Tỷ lệ phóng ảnh chat, không có đơn vị. Tăng làm ảnh lớn hơn; giảm làm ảnh nhỏ hơn. Ví dụ 0.83 = 83%.'),
  '${labels.chatVertical}':z.number().min(-5000).max(5000).describe('Tâm dọc của toàn bộ ảnh chat, đơn vị pixel video. Tăng đưa ảnh xuống; giảm đưa ảnh lên. Avatar, bubble và ảnh đi cùng nhau.'),
  '${labels.reveal}':z.number().min(.01).max(3).describe('Thời gian nội suy mép mask giữa hai tin, đơn vị giây. Tăng reveal chậm hơn; giảm reveal nhanh hơn. Không dịch ảnh.'),
  '${labels.xOffset}':z.number().min(-5000).max(5000).describe('Dịch toàn bộ ảnh chat theo chiều ngang, đơn vị pixel video. Tăng sang phải; giảm sang trái.'),
  '${labels.yOffset}':z.number().min(-5000).max(5000).describe('Dịch tất cả screenshot theo chiều dọc, đơn vị pixel video. Tăng xuống; giảm lên. Mọi screenshot đều bị ảnh hưởng.'),
  '${labels.perScreen}':z.object(Object.fromEntries(perScreenshotKeys.map((key,index)=>[key,z.number().min(-5000).max(5000).step(1).describe(screenshotDescription(key,index))]))).describe('Chỉnh riêng vị trí dọc từng screenshot. Số trường được sinh từ asset thật của episode.'),
  '${labels.pauseAfter}':z.object(Object.fromEntries(pauseAfterKeys.map((key,index)=>[key,z.number().min(-.5).max(10).step(.01).describe(pauseDescription(key,index))]))).describe('Khoảng nghỉ bổ sung sau từng câu thoại (có thể âm, tối thiểu -0.5s, để kéo bubble sau nhảy sớm khớp SFX). Không dùng để sửa SFX và không được suy từ độ dài file SFX. Duration preview được tính lại.'),
  '${labels.imageHold}':z.object(Object.fromEntries(imageHoldKeys.map((key,index)=>[key,z.number().min(0).max(10).step(.01).describe(imageHoldDescription(key,index))]))).describe('Thời gian giữ từng bubble không thoại (ảnh, \"...\"), đơn vị giây. Mọi tin sau dịch theo; SFX gắn với event dịch cùng. Duration preview được tính lại.'),
  '${labels.bubbleMask}':z.object(Object.fromEntries(bubbleMaskKeys.map((key,index)=>[key,z.number().min(0).max(10000).step(1).describe(maskDescription(key,index))]))).describe('Mép dưới vùng được phép hiển thị cho từng VOICE/IMAGE, tính theo pixel ảnh nguồn. Chỉ đổi clip edge; không dịch screenshot, avatar hoặc bubble.')
})} defaultProps={${defaults}}/>;
`;
 fs.mkdirSync(path.join(out,'src'),{recursive:true});
 fs.writeFileSync(path.join(out,'src/registration.tsx'),registration);
 fs.writeFileSync(path.join(out,'src/index.tsx'),"import {registerRoot} from 'remotion'; import Registration from './registration'; registerRoot(Registration);\n");
 writeJson(path.join(out,'package.json'),{name:`chattextstory-${input.episode.id}`,private:true,type:'commonjs',scripts:{studio:`remotion studio src/index.tsx`,compositions:`remotion compositions src/index.tsx --disable-bundling-cache`},dependencies:{'@remotion/cli':'4.0.537','@remotion/media':'4.0.537',remotion:'4.0.537',react:'19.3.1','react-dom':'19.3.1',zod:'4.5.4'}});
}

module.exports={scaffold,localizeProps,labels};
