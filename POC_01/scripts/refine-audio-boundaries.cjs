// Local PCM energy only. No transcription, alignment, or phrase remapping.
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const baseline=require('../public/generated-audio-v4a2/timing-manifest.json');
const rate=44100,channels=2;
const parameters={searchMs:80,energyWindowMs:6,stepMs:1,minimumQuietRunMs:12,quietThresholdDbfs:-42,minimumContrastDb:18,limitWarningMs:10,contextMs:200};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceHash=hash(fs.readFileSync(path.join(root,'public/full_tts.mp3.MP3')));
const cache=path.join(root,'out/v4c-master.wav');
// Reuse the existing original-master PCM decode only if its source hash matches.
const decodedFile=fs.existsSync(cache)&&fs.existsSync(cache+'.sha256')&&fs.readFileSync(cache+'.sha256','utf8')===sourceHash?cache:path.join(root,'out/v4d-master.wav');
if(decodedFile!==cache){
  const tool=path.join(require('@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
  const r=spawnSync(tool,['-y','-hide_banner','-loglevel','error','-i',path.join(root,'public/full_tts.mp3.MP3'),'-map','0:a:0','-ar',String(rate),'-ac','2','-c:a','pcm_s16le',decodedFile],{encoding:'utf8'});
  if(r.status!==0)throw Error(r.stderr);
}
const decoded=fs.readFileSync(decodedFile);let pcm,format;
for(let o=12;o+8<=decoded.length;){const n=decoded.readUInt32LE(o+4),tag=decoded.toString('ascii',o,o+4);if(tag==='fmt ')format={encoding:decoded.readUInt16LE(o+8),channels:decoded.readUInt16LE(o+10),rate:decoded.readUInt32LE(o+12),bits:decoded.readUInt16LE(o+22)};if(tag==='data')pcm=decoded.subarray(o+8,o+8+n);o+=8+n+n%2;}
if(!pcm||format.encoding!==1||format.channels!==channels||format.rate!==rate||format.bits!==16)throw Error('Expected 44,100 Hz stereo PCM16 master decode');
const length=pcm.length/4;
const rms=(center,halfMs=parameters.energyWindowMs/2)=>{
  const half=Math.round(halfMs*rate/1000),a=Math.max(0,center-half),b=Math.min(length,center+half);let sum=0;
  for(let i=a;i<b;i++)for(let c=0;c<channels;c++){const x=pcm.readInt16LE(i*4+c*2)/32768;sum+=x*x;}
  return Math.sqrt(sum/Math.max(1,(b-a)*channels));
};
const db=v=>20*Math.log10(Math.max(v,1e-9));
const round=v=>Number(v.toFixed(9));
const originals=[Math.round(baseline.phrases[0].sourceStart*rate),...baseline.phrases.slice(0,-1).map((p,i)=>Math.round((p.end+baseline.phrases[i+1].start)/2*rate)),Math.round(baseline.phrases.at(-1).sourceEnd*rate)];
const boundaries=originals.slice(1,-1).map((original,i)=>{
  const index=i+1,reasons=[];
  const samples=Array.from({length:161},(_,j)=>{const correction=j-80,sample=original+Math.round(correction*rate/1000);return {sample,correction,rms:rms(sample)};});
  const context=Array.from({length:81},(_,j)=>rms(original+Math.round((j-40)*5*rate/1000)));
  const peak=Math.max(...context),threshold=Math.min(10**(parameters.quietThresholdDbfs/20),peak*10**(-parameters.minimumContrastDb/20));
  const runs=[];let start=-1;
  for(let j=0;j<=samples.length;j++){
    const quiet=j<samples.length&&samples[j].rms<=threshold;
    if(quiet&&start<0)start=j;
    if(!quiet&&start>=0){if(j-start>=parameters.minimumQuietRunMs)runs.push({start,end:j-1,width:j-start});start=-1;}
  }
  // Prefer a sustained quiet plateau over isolated low-amplitude crossings.
  runs.sort((a,b)=>b.width-a.width||Math.abs((a.start+a.end)/2-80)-Math.abs((b.start+b.end)/2-80));
  // If the reference already sits safely inside any convincing quiet run,
  // preserve it instead of moving merely because another run is wider.
  const run=runs.find(r=>80>=r.start+4&&80<=r.end-4)??runs[0];let candidate=original;
  if(!run)reasons.push('NO_CONVINCING_LOW_ENERGY_INTERVAL');
  else{
    const originalInRun=80>=run.start+4&&80<=run.end-4;
    candidate=originalInRun?original:samples[Math.round((run.start+run.end)/2)].sample;
    if(Math.abs(candidate-original)/rate*1000>=parameters.searchMs-parameters.limitWarningMs)reasons.push('CANDIDATE_NEAR_SEARCH_LIMIT');
    if(db(peak)-db(rms(candidate))<parameters.minimumContrastDb)reasons.push('INSUFFICIENT_ENERGY_CONTRAST');
    if(db(rms(candidate))>parameters.quietThresholdDbfs)reasons.push('ACTIVE_SPEECH_RISK');
    // No evidence of speech on both sides: a quiet valley is not established.
    // Context may extend past the correction window; actual cuts never do.
    // A long genuine silence need not have both speech edges inside ±80 ms.
    const left=Math.max(...Array.from({length:39},(_,j)=>rms(candidate-Math.round((10+j*5)*rate/1000))),0);
    const right=Math.max(...Array.from({length:39},(_,j)=>rms(candidate+Math.round((10+j*5)*rate/1000))),0);
    if(Math.min(left,right)<threshold*2)reasons.push('TRANSITION_NOT_BRACKETED_BY_SPEECH_ENERGY');
  }
  if(candidate<=originals[index-1]||candidate>=originals[index+1])reasons.push('NEIGHBOR_CROSSING_RISK');
  const auto=reasons.length?original:candidate;
  return {boundaryId:`boundary_${String(index).padStart(3,'0')}`,index,originalAlignmentBoundary:original/rate,originalSample:original,
    autoCorrectedBaseBoundary:auto/rate,autoCorrectedBaseSample:auto,automaticDeltaMs:round((auto-original)*1000/rate),
    candidateBoundary:candidate/rate,candidateDeltaMs:round((candidate-original)*1000/rate),candidateEnergyDbfs:round(db(rms(candidate))),
    originalEnergyDbfs:round(db(rms(original))),quietThresholdDbfs:round(db(threshold)),quietRunMs:run?.width??0,
    quietRunTouchesSearchEdge:Boolean(run&&(run.start===0||run.end===160)),status:reasons.length?'NEEDS_MANUAL_REVIEW':'AUTO_ACCEPTED',reasons};
});
// Global order is authoritative. Revert conflicting automatic moves, never move another manual cut.
for(let i=1;i<boundaries.length;i++)if(boundaries[i].autoCorrectedBaseSample<=boundaries[i-1].autoCorrectedBaseSample){for(const b of [boundaries[i-1],boundaries[i]]){b.autoCorrectedBaseSample=b.originalSample;b.autoCorrectedBaseBoundary=b.originalAlignmentBoundary;b.automaticDeltaMs=0;b.status='NEEDS_MANUAL_REVIEW';b.reasons.push('GLOBAL_NEIGHBOR_ORDER_RISK');}}
const record={version:'v4d-energy-base-v1',sourceHash,sampleRate:rate,parameters,outerStartSample:originals[0],outerEndSample:originals.at(-1),boundaries};
fs.writeFileSync(path.join(root,'data/audio-boundary-bases.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({boundaries:96,earlier:boundaries.filter(b=>b.automaticDeltaMs<-.5).length,later:boundaries.filter(b=>b.automaticDeltaMs>.5).length,unchanged:boundaries.filter(b=>Math.abs(b.automaticDeltaMs)<=.5).length,flagged:boundaries.filter(b=>b.status==='NEEDS_MANUAL_REVIEW').length}));
