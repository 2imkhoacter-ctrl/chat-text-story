const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const {scaffold}=require('../lib/scaffold.cjs');

const requestedOut=process.env.V2_SCAFFOLD_OUT;
const out=requestedOut?path.resolve(requestedOut):fs.mkdtempSync(path.join(os.tmpdir(),'chat-story-scaffold-v2-'));
if(requestedOut){assert(!fs.existsSync(out),`Fixture output already exists: ${out}`);fs.mkdirSync(out,{recursive:true});}
const input={
  episode:{id:'v2-fixture',compositionId:'V2-Fixture',title:'V2 Fixture',width:1080,height:1920,fps:30},
  audio:{timeline:{initialMarginSeconds:.05,baseGapSeconds:.15,endMarginSeconds:.15}},
  visuals:{layoutReference:{width:1080,height:1920},events:[]},
  zoomEvents:[],
};
const timeline={events:[
  {id:'fixture-001',type:'VOICE',clipId:'clip-001',text:'Xin chào',screenshot:'screen-a',rawTopY:100,maskStopY:300,startFrame:2,durationInFrames:30,timelineStart:2/30,timelineEnd:32/30,holdEnd:32/30,relativeAudioFile:'audio/tts/clip-001.wav',gain:1,retainedLeadingSilenceSeconds:0,retainedTrailingSilenceSeconds:0},
  {id:'fixture-image-01',type:'IMAGE',text:'Ảnh gửi',screenshot:'screen-b',rawTopY:120,maskStopY:420,startFrame:32,durationInFrames:15,timelineStart:32/30,timelineEnd:47/30,holdEnd:47/30},
]};
const assets={screenshots:{'screen-a':{relativeFile:'screenshots/a.png',width:1080,height:1920,scale:1},'screen-b':{relativeFile:'screenshots/b.png',width:1080,height:1920,scale:1}},gameplay:{relativeFile:'background/gameplay.mp4',durationSeconds:10,gain:.3,loop:true,objectFit:'cover',objectPosition:'center center'},music:{relativeFile:'background/music.mp3',durationSeconds:10,gain:.5,loop:true,crossfadeSeconds:.5},sfx:{BOOM:{relativeFile:'sfx/boom.mp3',durationSeconds:1.75,gain:1}}};
const sfx={cues:[{id:'cue-1',eventId:'fixture-001',assetId:'BOOM',trigger:'TAIL',timelineStart:.8,timelineEnd:2.55,gain:1,overlap:true,preserveFullDuration:true}],durationSeconds:2.55};
const props={'Normal Gap':.15,'Initial Margin':.05,'End Margin':.15,'Chat Scale':.83,'Chat Vertical Position':960,'Bubble Reveal Duration':.17,'Screenshot X Offset':0,'Screenshot Y Offset':0,'Per-Screenshot Y Offset':{'screen-a':0,'screen-b':0},'Pause After':{'clip-001':0},'Bubble Mask Y':{'fixture-001':300,'fixture-image-01':420}};
scaffold(input,out,{assets,timeline,sfx,audit:{durationInFrames:82}},props);
const source=fs.readFileSync(path.join(out,'src/registration.tsx'),'utf8');
assert(source.includes("'Dịch dọc từng ảnh (pixel)':z.object(Object.fromEntries(perScreenshotKeys"));
assert(source.includes("'Nghỉ sau câu thoại (giây)':z.object(Object.fromEntries(pauseAfterKeys"));
assert(source.includes("'Mép hiển thị từng tin nhắn (pixel ảnh nguồn)':z.object(Object.fromEntries(bubbleMaskKeys"));
assert(!source.includes('z.record('));
assert(source.includes('calculateMetadata={calculateMetadata}'));
assert(source.includes("'screen-a': 0")&&source.includes("'screen-b': 0"));
assert(source.includes("'clip-001': 0"));
assert(source.includes("'fixture-image-01': 420"));
assert(source.includes("props['Normal Gap']"));
console.log(JSON.stringify({status:'PASS',out,checks:['Vietnamese Inspector','dynamic fields','editable objects','technical-key compatibility','dynamic metadata']}));
