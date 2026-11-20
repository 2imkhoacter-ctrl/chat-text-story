// V4D only. Decode the untouched master once; partition its PCM on shared sample boundaries.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'public/full_tts.mp3.MP3');
const baseline=require('../public/generated-audio-v4a2/timing-manifest.json');
const output=path.join(root,'public/generated-audio-v4d');
const overridesFile=path.join(root,'data/audio-boundary-overrides-v4d.json');
const manifestFile=path.join(output,'timing-manifest.json');
const bases=require('../data/audio-boundary-bases.json');
const {summarize}=require('./report-audio-boundaries.cjs');
const rate=44100,channels=2,frameBytes=4;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const key=i=>`boundary_${String(i).padStart(3,'0')}`;
const originalCuts=[bases.outerStartSample,...bases.boundaries.map(b=>b.autoCorrectedBaseSample),bases.outerEndSample];
let master;
const atomic=(file,bytes)=>{fs.writeFileSync(file+'.tmp',bytes);fs.renameSync(file+'.tmp',file);};
const readOverrides=()=>fs.existsSync(overridesFile)?JSON.parse(fs.readFileSync(overridesFile,'utf8')):{};
const cutsFor=overrides=>{
  for(const [name,ms] of Object.entries(overrides)){
    if(!/^boundary_\d{3}$/.test(name)||Number(name.slice(9))<1||Number(name.slice(9))>96||!Number.isSafeInteger(ms))throw Error('Invalid boundary override: '+name);
  }
  const cuts=originalCuts.map((sample,i)=>sample+Math.round((overrides[key(i)]??0)*rate/1000));
  for(let i=1;i<cuts.length;i++)if(cuts[i]<=cuts[i-1])throw Error(`Boundary ${i}: corrected cut must remain strictly between its neighbors. Other overrides were not changed.`);
  return cuts;
};
const wav=(a,b)=>{
  const pcm=master.subarray(a*frameBytes,b*frameBytes),header=Buffer.alloc(44);
  header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(channels,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*frameBytes,28);header.writeUInt16LE(frameBytes,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
  return Buffer.concat([header,pcm]);
};
const makeManifest=(overrides,cuts)=>({...baseline,alignmentVersion:'v4d-auto-base-manual-nudge',manualBoundaryOverrides:{...overrides},autoBaseFingerprint:digest(Buffer.from(JSON.stringify(bases))),boundaryCorrections:bases.boundaries.map((b,i)=>({...b,manualOverrideMs:overrides[key(i+1)]??0,finalBoundary:cuts[i+1]/rate})),sourcePartition:'shared-sample-boundaries',sampleRate:rate,
  phrases:baseline.phrases.map((p,i)=>({...p,sourceStart:cuts[i]/rate,sourceEnd:cuts[i+1]/rate,sourceStartSample:cuts[i],sourceEndSample:cuts[i+1],clipDuration:(cuts[i+1]-cuts[i])/rate,
    relativeAudioFile:`generated-audio-v4d/${p.audioFile}`,audioRevision:digest(master.subarray(cuts[i]*frameBytes,cuts[i+1]*frameBytes)).slice(0,16)}))});
const publish=(overrides,indices)=>{
  const cuts=cutsFor(overrides);
  if(cuts[0]<0||cuts.at(-1)*frameBytes>master.length)throw Error('Cut outside master source');
  const manifest=makeManifest(overrides,cuts);
  const report=summarize(manifest);
  const writes=indices.map(i=>[path.join(output,baseline.phrases[i].audioFile),wav(cuts[i],cuts[i+1])]);
  writes.push([manifestFile,Buffer.from(JSON.stringify(manifest,null,2)+'\n')],[overridesFile,Buffer.from(JSON.stringify(overrides,null,2)+'\n')]);
  writes.push([path.join(root,'out/v4d-boundary-report.json'),Buffer.from(JSON.stringify({summary:report.summary,boundaries:report.boundaries},null,2)+'\n')],[path.join(root,'out/v4d-boundary-report.csv'),Buffer.from(report.csv)]);
  const backups=writes.map(([f])=>[f,fs.existsSync(f)?fs.readFileSync(f):null]);
  try{for(const [f,b] of writes)atomic(f,b);}catch(error){for(const [f,b]of backups){if(b)atomic(f,b);else if(fs.existsSync(f))fs.unlinkSync(f);}throw error;}
  return manifest;
};
const initialize=()=>{
  fs.mkdirSync(output,{recursive:true});
  const cache=path.join(root,'out/v4c-master.wav'),stamp=cache+'.sha256';
  const hash=digest(fs.readFileSync(source));
  if(hash!==bases.sourceHash)throw Error('Master changed: regenerate automatic base analysis before extraction');
  if(!fs.existsSync(cache)||!fs.existsSync(stamp)||fs.readFileSync(stamp,'utf8')!==hash){
    const ffmpeg=path.join(require('@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
    const result=spawnSync(ffmpeg,['-y','-hide_banner','-loglevel','error','-i',source,'-map','0:a:0','-ar',String(rate),'-ac',String(channels),'-c:a','pcm_s16le',cache],{encoding:'utf8'});
    if(result.status!==0)throw Error(result.stderr||'Master decode failed');
    fs.writeFileSync(stamp,hash);
  }
  const decoded=fs.readFileSync(cache);
  for(let offset=12;offset+8<=decoded.length;){const size=decoded.readUInt32LE(offset+4);if(decoded.toString('ascii',offset,offset+4)==='data'){master=decoded.subarray(offset+8,offset+8+size);break;}offset+=8+size+(size%2);}
  if(!master)throw Error('Decoded master has no PCM data');
  const overrides=readOverrides();cutsFor(overrides);
  const current=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):null;
  if(!current||current.autoBaseFingerprint!==digest(Buffer.from(JSON.stringify(bases)))||JSON.stringify(current.manualBoundaryOverrides)!==JSON.stringify(overrides)||baseline.phrases.some(p=>!fs.existsSync(path.join(output,p.audioFile))))publish(overrides,Array.from({length:97},(_,i)=>i));
  return getState();
};
const getState=()=>{
  const overrides=readOverrides(),cuts=cutsFor(overrides);
  return {composition:'ChatTextStory-V4D-AudioCalibrated',sampleRate:rate,overrides,boundaries:Array.from({length:96},(_,i)=>{
    const n=i+1;return {index:n,key:key(n),previousText:baseline.phrases[i].text,nextText:baseline.phrases[i+1].text,
      originalAlignmentBoundary:bases.boundaries[i].originalAlignmentBoundary,autoCorrectedBaseBoundary:originalCuts[n]/rate,automaticDeltaMs:bases.boundaries[i].automaticDeltaMs,status:bases.boundaries[i].status,reasons:bases.boundaries[i].reasons,original:originalCuts[n]/rate,correctionMs:overrides[key(n)]??0,final:cuts[n]/rate,
      previousStart:cuts[n-1]/rate,nextEnd:cuts[n+1]/rate};
  })};
};
const update=(index,ms)=>{
  if(!master)throw Error('Initialize first');
  if(!Number.isInteger(index)||index<1||index>96||!Number.isSafeInteger(ms))throw Error('Expected boundary 1–96 and integer milliseconds');
  const overrides=readOverrides();if(ms===0)delete overrides[key(index)];else overrides[key(index)]=ms;
  const manifest=publish(overrides,[index-1,index]);
  return {state:getState(),affected:manifest.phrases.slice(index-1,index+1).map(p=>({voice:p.audioFile,sourceStart:p.sourceStart,sourceEnd:p.sourceEnd,clipDuration:p.clipDuration}))};
};
module.exports={initialize,getState,update,cutsFor,originalCuts,rate,output,manifestFile,overridesFile};
if(require.main===module){const state=initialize();console.log(`V4D ready: ${state.boundaries.length} shared boundaries, 97 WAVs. Run node scripts/audio-nudge-server-v4d.cjs for controls.`);}
