const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const os=require('os');
const path=require('path');
const {readCapcut,mapSegments}=require('../lib/capcut.cjs');
const {processAudio,wav}=require('../lib/audio.cjs');
const {buildTimeline}=require('../lib/timeline.cjs');
const {scheduleSfx}=require('../lib/sfx.cjs');

const writeJson=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));};
const writeWav=(file,seconds=.25,rate=24000)=>{const frames=Math.round(seconds*rate),data=Buffer.alloc(frames*2);for(let i=0;i<frames;i++)data.writeInt16LE(Math.round(Math.sin(i/7)*12000),i*2);const out=Buffer.alloc(44+data.length);out.write('RIFF');out.writeUInt32LE(36+data.length,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(1,22);out.writeUInt32LE(rate,24);out.writeUInt32LE(rate*2,28);out.writeUInt16LE(2,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(data.length,40);data.copy(out,44);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,out);};
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function fixture(count){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'capcut-reader-v2-')),drafts=[],outer=[];
 const descriptors=[];
 for(let i=0;i<count;i++){
  const stableId=`material-${String(i+1).padStart(3,'0')}`,draftId=`draft-${String(i+1).padStart(3,'0')}`,linkId=`link-${String(i+1).padStart(3,'0')}`,text=`Line ${i+1}`,audioFile=path.join(root,'audio',`${stableId}.wav`);writeWav(audioFile);
  const audio={material_id:stableId,source_timerange:{start:0,duration:120000},target_timerange:{start:0,duration:100000},speed:1.2,reverse:false,is_loop:false,extra_material_refs:[]};
  const textSegment={material_id:`text-${i+1}`,target_timerange:{start:0,duration:100000}};
  const nested={id:draftId,tracks:[{type:'audio',segments:[audio]},{type:'text',segments:[textSegment]}],materials:{audios:[{id:stableId,name:text,path:audioFile,tone_speaker:'fixture-speaker'}],texts:[{id:`text-${i+1}`,content:JSON.stringify({text})}],speeds:[]}};
  writeJson(path.join(root,'subdraft',draftId,'draft_content.json'),{materials:{drafts:[{draft:{id:draftId,...nested}}]}});
  drafts.push({id:linkId,draft:{id:draftId,tracks:[{type:'audio',segments:[audio]}]}});
  outer.push({id:`outer-${i+1}`,extra_material_refs:[linkId],source_timerange:{start:0,duration:100000},target_timerange:{start:i*100000,duration:100000},speed:1,reverse:false,is_loop:false,volume:1});
  descriptors.push({stableId,text});
 }
 writeJson(path.join(root,'draft_content.json'),{materials:{drafts},tracks:[{segments:outer}]});
 return {root,descriptors};
}
const voice=(i,text,ids)=>({id:`event-${i}`,type:'VOICE',clipId:`clip-${i}`,text,screenshot:'screen',maskStopY:100,ttsSegmentIds:ids});
const input=(root,events)=>({capcut:{draftDirectory:root},visuals:{events},audio:{trimPolicy:{binSeconds:.01,leadingGuardSeconds:.02,maxTrailingSilenceSeconds:.15},trimExceptions:[],timeline:{initialMarginSeconds:0,baseGapSeconds:.15,endMarginSeconds:.1}},episode:{fps:30}});

const tests=[];const test=(name,fn)=>{try{fn();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',error:error.stack||error.message});}};

test('A legacy and explicit 1:1 map 50 VOICE to 50 segments',()=>{
 const f=fixture(50),legacy=Array.from({length:50},(_,i)=>{const e=voice(i+1,`Line ${i+1}`,[f.descriptors[i].stableId]);delete e.ttsSegmentIds;return e;});
 const oldRows=readCapcut(input(f.root,legacy));assert.equal(oldRows.length,50);assert(oldRows.every(x=>x.segments.length===1));
 const explicit=legacy.map((e,i)=>({...e,ttsSegmentIds:[f.descriptors[i].stableId]})),newRows=readCapcut(input(f.root,explicit));assert.deepEqual(newRows.map(x=>x.segmentIds),explicit.map(x=>x.ttsSegmentIds));
 fs.rmSync(f.root,{recursive:true,force:true});
});

test('B explicit 2:1 maps 50 VOICE to all 51 consecutive segments',()=>{
 const f=fixture(51),events=[];let at=0;for(let i=1;i<=50;i++){const take=i===3?2:1,parts=f.descriptors.slice(at,at+take);events.push(voice(i,parts.map(x=>x.text).join(' '),parts.map(x=>x.stableId)));at+=take;}
 const rows=readCapcut(input(f.root,events));assert.equal(rows.length,50);assert.equal(rows.reduce((sum,x)=>sum+x.segments.length,0),51);assert.deepEqual(rows[2].segmentIds,['material-003','material-004']);
 fs.rmSync(f.root,{recursive:true,force:true});
});

test('C IMAGE and silent bubble require no TTS mapping',()=>{
 const f=fixture(1),events=[voice(1,'Line 1',[f.descriptors[0].stableId]),{id:'silent-image',type:'IMAGE',screenshot:'screen',maskStopY:150,durationSeconds:.5,text:'...'}];
 assert.equal(readCapcut(input(f.root,events)).length,1);fs.rmSync(f.root,{recursive:true,force:true});
});

test('D invalid mappings block missing, duplicate, order, stable ID and text',()=>{
 const segments=['a','b','c'].map((stableId,order)=>({stableId,order:order+1,text:stableId}));
 assert.throws(()=>mapSegments([voice(1,'a',['a']),voice(2,'b',['b'])],segments),/Unmapped/);
 assert.throws(()=>mapSegments([voice(1,'a',['a']),voice(2,'a',['a']),voice(3,'c',['c'])],segments),/more than once/);
 assert.throws(()=>mapSegments([voice(1,'b',['b']),voice(2,'a',['a']),voice(3,'c',['c'])],segments),/preserve CapCut order/);
 assert.throws(()=>mapSegments([voice(1,'a',['missing']),voice(2,'b',['b']),voice(3,'c',['c'])],segments),/Unknown TTS stable ID/);
 const f=fixture(1);assert.throws(()=>readCapcut(input(f.root,[voice(1,'Wrong text',[f.descriptors[0].stableId])])),/Text mismatch/);fs.rmSync(f.root,{recursive:true,force:true});
});

test('F multi-segment audio has one VOICE, no internal gap, one speed/gain pass, pause and TAIL use full voice',()=>{
 const f=fixture(3),events=[voice(1,'Line 1 Line 2',['material-001','material-002']),{...voice(2,'Line 3',['material-003']),pauseAfterSeconds:.2}],rows=readCapcut(input(f.root,events)),out=path.join(f.root,'out');
 const audio=processAudio(input(f.root,events),rows,out);assert.equal(audio.length,2);assert.equal(audio[0].segments.length,2);assert.equal(audio[0].gain,1);assert(Math.abs(audio[0].speed-1.2)<1e-9);assert(Math.abs(audio[0].processedDuration-audio[0].segments.reduce((sum,x)=>sum+x.processedDuration,0))<1/24000);
 const joined=wav(fs.readFileSync(path.join(out,'public',audio[0].processedFile)));assert.equal(joined.frames,Math.round(audio[0].segments.reduce((sum,x)=>sum+x.processedDuration,0)*joined.rate));
 const timeline=buildTimeline(input(f.root,events),audio,out);assert.equal(timeline.events.length,2);assert.equal(timeline.events[0].durationInFrames,Math.ceil(audio[0].processedDuration*30));assert.equal(timeline.events[1].gapFrames,Math.ceil(.15*30-1e-9));
 fs.mkdirSync(path.join(out,'public/sfx'),{recursive:true});writeWav(path.join(out,'public/sfx/boom.wav'),.1);const sfx=scheduleSfx({...input(f.root,events),sfx:{cues:[{id:'tail',eventId:'event-1',assetId:'boom',trigger:'TAIL',offsetSeconds:0,preserveFullDuration:true,overlap:true}]}},timeline,{sfx:{boom:{durationSeconds:.1,gain:1}}},out);assert(sfx.cues[0].timelineStart>=timeline.events[0].timelineStart);assert(sfx.cues[0].timelineStart<timeline.events[0].timelineEnd);
 const changed=structuredClone(rows);changed[0].segments[1].gain=.5;assert.throws(()=>processAudio(input(f.root,events),changed,path.join(f.root,'bad-gain')),/different gains/);
 fs.rmSync(f.root,{recursive:true,force:true});
});

const report={status:tests.every(x=>x.status==='PASS')?'PASS':'FAIL',tests};console.log(JSON.stringify(report,null,2));if(report.status!=='PASS')process.exit(1);
