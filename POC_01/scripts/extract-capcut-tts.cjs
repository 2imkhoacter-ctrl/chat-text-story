// Independent TTS files only. No long-master alignment, repairs or saved overrides.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const normalize=s=>s.normalize('NFC').replace(/\s+/gu,' ').trim();
const one=(xs,label)=>{if(xs.length!==1)throw Error(`${label}: expected one link, found ${xs.length}`);return xs[0];};
const ffmpeg=path.join(require('@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
function run(args){const r=spawnSync(ffmpeg,['-hide_banner','-loglevel','error',...args],{maxBuffer:64*1024*1024,windowsHide:true});if(r.status!==0)throw Error(r.stderr.toString());return r.stdout;}
function wav(buffer){
  if(buffer.toString('ascii',0,4)!=='RIFF')throw Error('Not a RIFF WAV');
  let format,data;
  for(let i=12;i+8<=buffer.length;){const id=buffer.toString('ascii',i,i+4),n=buffer.readUInt32LE(i+4),start=i+8;
    if(id==='fmt ')format={code:buffer.readUInt16LE(start),channels:buffer.readUInt16LE(start+2),rate:buffer.readUInt32LE(start+4),bits:buffer.readUInt16LE(start+14)};
    if(id==='data'){data=buffer.subarray(start,Math.min(start+n,buffer.length));break;}i=start+n+(n%2);
  }
  if(!format||!data||format.code!==1||format.bits!==16)throw Error('Expected decoded PCM16 WAV');
  return {...format,data,frames:data.length/(format.channels*2),duration:data.length/(format.channels*2*format.rate)};
}
function encode(w,start,end){
  const data=w.data.subarray(start*w.channels*2,end*w.channels*2),b=Buffer.alloc(44+data.length);
  b.write('RIFF');b.writeUInt32LE(36+data.length,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);
  b.writeUInt16LE(w.channels,22);b.writeUInt32LE(w.rate,24);b.writeUInt32LE(w.rate*w.channels*2,28);
  b.writeUInt16LE(w.channels*2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(data.length,40);data.copy(b,44);return b;
}
function edges(w){
  // Five-ms frames, low threshold for quiet consonants, separate strong threshold
  // for confirmation (hysteresis). Only contiguous outer quiet is removable.
  const step=Math.max(1,Math.round(w.rate*.005)),bins=[];
  for(let f=0;f<w.frames;f+=step){let sum=0,peak=0,n=0;
    for(let j=f;j<Math.min(f+step,w.frames);j++)for(let c=0;c<w.channels;c++){
      const v=w.data.readInt16LE((j*w.channels+c)*2)/32768;sum+=v*v;peak=Math.max(peak,Math.abs(v));n++;
    }
    const rms=Math.sqrt(sum/n);bins.push({quiet:rms<.001&&peak<.003162278,strong:rms>.0177828});
  }
  const first=bins.findIndex(x=>!x.quiet),last=bins.findLastIndex(x=>!x.quiet);
  const confirmed=bins.some((b,i)=>b.strong&&bins[i+1]?.strong&&bins[i+2]?.strong&&bins[i+3]?.strong);
  if(first<0||!confirmed)return {start:0,end:w.frames,leading:0,trailing:0,review:['No confidently confirmed speech; WAV retained']};
  const leading=first*step/w.rate,trailing=(w.frames-Math.min(w.frames,(last+1)*step))/w.rate;
  const start=leading>=.14?Math.max(0,Math.floor((leading-.1)*w.rate)):0;
  const end=trailing>.15?Math.min(w.frames,(last+1)*step+Math.floor(.15*w.rate)):w.frames;
  const review=[];
  if(leading<.01)review.push('Speech/energy at source head; listen for existing source clipping');
  if(trailing<.02)review.push('Speech/energy at source tail; ending not confidently separated from edge');
  return {start,end,leading,trailing,review};
}
function resolve(source,mapping){
  const mainFile=path.join(source,'draft_content.json'),main=read(mainFile),inputs=new Set([mainFile]);
  const segments=main.tracks.flatMap(t=>t.segments).sort((a,b)=>a.target_timerange.start-b.target_timerange.start);
  const used=new Set(),drafts=new Set();
  return {inputs,rows:segments.map((outer,i)=>{
    if(i&&outer.target_timerange.start<=segments[i-1].target_timerange.start)throw Error('Ambiguous main timeline order');
    const link=one(main.materials.drafts.filter(d=>outer.extra_material_refs.includes(d.id)),'composition');
    if(drafts.has(link.draft.id))throw Error('Repeated subdraft');drafts.add(link.draft.id);
    const subFile=path.join(source,'subdraft',link.draft.id,'draft_content.json');inputs.add(subFile);
    const sub=read(subFile),nested=one(sub.materials.drafts.filter(d=>d.draft.id===link.draft.id),'nested draft').draft;
    const audio=one(nested.tracks.filter(t=>t.type==='audio').flatMap(t=>t.segments),'audio segment');
    const material=one(nested.materials.audios.filter(a=>a.id===audio.material_id),'audio material');
    const textSegment=one(nested.tracks.filter(t=>t.type==='text').flatMap(t=>t.segments),'text segment');
    const textMaterial=one(nested.materials.texts.filter(t=>t.id===textSegment.material_id),'text material');
    const text=typeof textMaterial.content==='string'?JSON.parse(textMaterial.content).text:textMaterial.content.text;
    if(typeof text!=='string'||normalize(text)!==normalize(material.name))throw Error(`TTS/text linkage mismatch at ${i+1}`);
    // Check the actual subdraft against the main draft's linked embedded snapshot.
    const snapshot=link.draft.tracks.filter(t=>t.type==='audio').flatMap(t=>t.segments);
    if(!require('node:util').isDeepStrictEqual(snapshot,nested.tracks.filter(t=>t.type==='audio').flatMap(t=>t.segments)))throw Error('Stale/conflicting nested audio segment');
    const portable=material.path.replace(/\\/g,'/');
    const relative=portable.startsWith('##_draftpath_placeholder_')?portable.replace(/^##[^/]+##\//,''):null;
    const sourceWav=relative?path.resolve(source,relative):path.resolve(material.path);
    if(!sourceWav.toLowerCase().startsWith((source+path.sep).toLowerCase())||!fs.existsSync(sourceWav))throw Error(`Missing/nonlocal WAV: ${sourceWav}`);
    if(used.has(sourceWav.toLowerCase()))throw Error('Duplicate WAV linkage');used.add(sourceWav.toLowerCase());inputs.add(sourceWav);
    for(const s of [outer,audio]){
      if(!(s.speed>0)||s.reverse||s.is_loop)throw Error('Unsupported speed/reverse/loop');
      if(Math.abs(s.source_timerange.duration/s.speed-s.target_timerange.duration)>2000)throw Error('Speed/range ratio conflict');
      const speedRefs=(nested.materials.speeds||[]).filter(x=>s.extra_material_refs.includes(x.id));
      if(speedRefs.some(x=>x.curve_speed))throw Error('Variable speed not supported');
      if(speedRefs.some(x=>Math.abs(x.speed-s.speed)>1e-5))throw Error('Speed material conflict');
    }
    const os=outer.source_timerange,at=audio.target_timerange,ar=audio.source_timerange;
    const begin=Math.max(os.start,at.start),end=Math.min(os.start+os.duration,at.start+at.duration);
    if(end<=begin)throw Error('No audio in composition source range');
    const start=(ar.start+(begin-at.start)*audio.speed)/1e6;
    const duration=(end-begin)*audio.speed/1e6,speed=outer.speed*audio.speed;
    const bubble=mapping.events.filter(e=>e.type==='VOICE')[i];
    const matches=bubble&&bubble.voice_index===i+1&&normalize(text)===normalize(bubble.script_text);
    return {index:i+1,text,sourceWav,timelineStart:outer.target_timerange.start/1e6,speed,
      speedLevels:{composition:outer.speed,audio:audio.speed},sourceStart:start,sourceDuration:duration,
      expectedPlaybackDuration:duration/speed,subdraft:subFile,materialId:material.id,
      bubbleId:matches?bubble.event_id:null,expectedBubbleId:bubble?.event_id,
      expectedText:bubble?.script_text,validationStatus:matches?'MATCH':'TEXT_MISMATCH'};
  })};
}
function main(){
  const [sourceArg,outputArg,...options]=process.argv.slice(2);
  if(!sourceArg||!outputArg)throw Error('Usage: node scripts/extract-capcut-tts.cjs <capcut-folder> <output-folder> [--sample]');
  const source=path.resolve(sourceArg),output=path.resolve(outputArg);
  if(!output.startsWith(root+path.sep)||output.startsWith(source+path.sep))throw Error('Output must be inside POC_01 and outside source');
  const mapping=read(path.join(root,'data/chat-events.json')),script=fs.readFileSync(path.join(root,'data/tts-script.txt'),'utf8').split(/\r?\n/).filter(s=>s.trim());
  const voices=mapping.events.filter(e=>e.type==='VOICE');
  if(voices.length!==script.length||voices.some((e,i)=>e.voice_index!==i+1||normalize(e.script_text)!==normalize(script[i])))throw Error('Existing bubble/script mapping is inconsistent');
  const {inputs,rows}=resolve(source,mapping),before=Object.fromEntries([...inputs].map(f=>[f,hash(f)]));
  const protectedFiles=[];
  const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(f===output||f===path.join(root,'public/capcut-tts'))continue;if(e.isDirectory())walk(f);else protectedFiles.push(f);}};
  for(const d of ['src','data','public'])walk(path.join(root,d));
  const protectedHashes=Object.fromEntries(protectedFiles.map(f=>[f,hash(f)]));
  if(fs.existsSync(output))throw Error('Output exists; use a new empty output directory');
  for(const dir of ['original','processed'])fs.mkdirSync(path.join(output,dir),{recursive:true});
  const selected=options.includes('--sample')?[rows.find(x=>x.speed===1),rows.find(x=>x.speed!==1),...rows.filter(x=>x.index===17)]:rows;
  for(const r of selected){
    const name=String(r.index).padStart(3,'0')+'.wav';
    r.originalWav=path.join(output,'original',name);r.processedWav=path.join(output,'processed',name);
    fs.copyFileSync(r.sourceWav,r.originalWav);
    const raw=wav(run(['-i',r.sourceWav,'-c:a','pcm_s16le','-f','wav','pipe:1']));
    r.originalDuration=raw.duration;
    if(r.sourceStart+r.sourceDuration>raw.duration+.002)throw Error('Source trim exceeds WAV');
    const filters=[`atrim=start=${r.sourceStart}:end=${Math.min(raw.duration,r.sourceStart+r.sourceDuration)}`,'asetpts=PTS-STARTPTS'];
    if(Math.abs(r.speed-1)>1e-6)filters.push(`atempo=${r.speed}`);
    const playback=wav(run(['-i',r.sourceWav,'-af',filters.join(','),'-c:a','pcm_s16le','-f','wav','pipe:1']));
    const e=edges(playback);r.preNormalizationDuration=playback.duration;
    r.leadingTrim=e.start/playback.rate;r.trailingTrim=(playback.frames-e.end)/playback.rate;
    r.detectedLeadingSilence=e.leading;r.detectedTrailingSilence=e.trailing;
    r.trailingSilence=Math.max(0,e.trailing-r.trailingTrim);
    r.reviewReasons=e.review;
    r.speedDurationError=playback.duration-r.expectedPlaybackDuration;
    if(Math.abs(r.speedDurationError)>.05)r.reviewReasons.push('Tempo output differs from ideal duration by >50ms');
    r.needsReview=r.reviewReasons.length>0||r.validationStatus!=='MATCH';
    const untouched=r.speed===1&&r.sourceStart===0&&Math.abs(r.sourceDuration-raw.duration)<1/raw.rate&&e.start===0&&e.end===playback.frames;
    if(untouched)fs.copyFileSync(r.sourceWav,r.processedWav);else fs.writeFileSync(r.processedWav,encode(playback,e.start,e.end));
    const verified=wav(run(['-i',r.processedWav,'-c:a','pcm_s16le','-f','wav','pipe:1']));
    r.processedDuration=verified.duration;r.originalSha256=hash(r.originalWav);r.processedSha256=hash(r.processedWav);
    if(!(r.processedDuration>0)||r.originalSha256!==before[r.sourceWav])throw Error('Invalid output/copy');
    if(r.trailingSilence>.15+1/playback.rate&&e.review.length===0)throw Error('Tail cap failed');
    console.log(`${r.index}: speed ${r.speed.toFixed(2)}, ${r.processedDuration.toFixed(3)}s, ${r.validationStatus}`);
  }
  for(const [f,h] of Object.entries({...before,...protectedHashes}))if(hash(f)!==h)throw Error('Protected file changed: '+f);
  const mismatches=rows.filter(r=>r.validationStatus!=='MATCH');
  const passed=!options.includes('--sample')&&rows.length===voices.length&&mismatches.length===0;
  const summary={validationStatus:passed?'PASS':'FAIL',expectedCount:script.length,extractedCount:selected.length,
    matchedTexts:rows.length-mismatches.length,textMismatches:mismatches.length,
    tailsTrimmed:selected.filter(r=>r.trailingTrim>0).length,tailsAlreadyWithinLimit:selected.filter(r=>r.detectedTrailingSilence<=.15).length,
    needsReview:selected.filter(r=>r.needsReview).length,sourceAndProductionUnchanged:true,remotionActivated:false,
    processedAudioDuration:selected.reduce((sum,r)=>sum+r.processedDuration,0)};
  const manifest={version:1,units:'seconds',source,summary,
    textComparison:'NFC + collapsed whitespace only; exact comparison with authoritative script_text of existing bubble events',
    silencePolicy:{frameSeconds:.005,quietRmsDb:-60,quietPeakDb:-50,strongRmsDb:-35,headGuardSeconds:.1,maxTailSeconds:.15,
      note:'Energy estimates are conservative, not phonetic verification. Internal silence is never removed.'},
    timingPolicy:'Consecutive processed WAV durations; no generic added speech gap. Special visual holds remain separate. Not activated while mapping fails.',
    sourceHashes:before,protectedHashes,phrases:selected};
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  const report=['# CapCut independent TTS validation','',JSON.stringify(summary,null,2),'',
    'Text mismatches block Remotion activation. No fuzzy substitutions or script edits were made.','',
    '| Index | CapCut TTS | Authoritative bubble script |','|---|---|---|',
    ...mismatches.map(r=>`| ${r.index} | ${r.text} | ${r.expectedText} |`),'',
    '## Listening review',...selected.filter(r=>r.needsReview).map(r=>`- ${r.index}: ${[...r.reviewReasons,...(r.validationStatus==='MATCH'?[]:['Text mismatch'])].join('; ')}`)];
  fs.writeFileSync(path.join(output,'validation.md'),report.join('\n')+'\n');
  console.log(JSON.stringify(summary,null,2));if(!passed)process.exitCode=2;
}
module.exports={resolve,wav,edges,run,normalize};
if(require.main===module){try{main();}catch(e){console.error(e.stack);process.exitCode=1;}}
