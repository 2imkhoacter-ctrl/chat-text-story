const assert=require('assert'),fs=require('fs'),path=require('path');
const {loadInput}=require('../lib/input.cjs');const {readCapcut}=require('../lib/capcut.cjs');const {processAudio}=require('../lib/audio.cjs');
const root=path.resolve(__dirname,'../..');
const cases=[
 {name:'Video 04',input:'episodes/koa04-background-swap-r1/episode-input.generated.json',approved:'episodes/koa04-background-swap-r1/data/audio-processing.json',out:'reconstruction-tests/capcut-reader-v2-koa04-tts-20261106'},
 {name:'Video 05',input:'episodes/koa05-bonsai-bathtub-r1/episode-input.generated.json',approved:'episodes/koa05-bonsai-bathtub-r1/data/audio-processing.json',out:'reconstruction-tests/capcut-reader-v2-koa05-tts-20261106'},
];
const results=[];
for(const spec of cases){
 const input=loadInput(path.join(root,spec.input)),rows=readCapcut(input),out=path.join(root,spec.out),audio=processAudio(input,rows,out),approvedFile=path.join(root,spec.approved);
 assert.equal(audio.length,input.visuals.events.filter(x=>x.type==='VOICE').length,`${spec.name} voice count`);for(const item of audio){const file=path.join(out,'public',item.processedFile);assert(fs.existsSync(file),`${spec.name} missing ${item.clipId}`);}
 let baseline='NO_APPROVED_AUDIO_MANIFEST',matches=null;if(fs.existsSync(approvedFile)){const approved=JSON.parse(fs.readFileSync(approvedFile,'utf8')).files,mismatches=audio.filter(x=>{const old=approved.find(y=>y.clipId===x.clipId);return !old||old.processedSha256!==x.processedSha256||old.speed!==x.speed||old.gain!==x.gain;}).map(x=>x.clipId);assert.equal(audio.length,approved.length,`${spec.name} approved voice count`);assert.deepEqual(mismatches,[],`${spec.name} processed audio regression`);baseline='APPROVED_MANIFEST';matches=audio.length;}
 results.push({name:spec.name,status:'PASS',voices:audio.length,sourceSegments:rows.reduce((sum,x)=>sum+x.segments.length,0),baseline,hashSpeedGainMatches:matches,output:out});
}
console.log(JSON.stringify({status:'PASS',results},null,2));
