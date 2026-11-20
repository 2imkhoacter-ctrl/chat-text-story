const {fs,path,readJson,ensure,hashFile}=require('./utils.cjs');
const required=(o,keys,label)=>keys.forEach(k=>ensure(Object.hasOwn(o,k),`${label}.${k} is required`));
function loadInput(file){
  const absolute=path.resolve(file),input=readJson(absolute); required(input,['version','episode','capcut','audio','visuals','background','sfx','props','output'],'input');
  ensure(input.version===1,'Unsupported input version'); required(input.episode,['id','compositionId','title','width','height','fps'],'episode');
  ensure(/^[A-Za-z0-9-]+$/.test(input.episode.compositionId),'Invalid compositionId');
  ensure(fs.existsSync(input.capcut.draftDirectory),'CapCut draft directory missing');
  ensure(fs.existsSync(path.join(input.capcut.draftDirectory,'draft_content.json')),'CapCut draft_content.json missing');
  ensure(Array.isArray(input.visuals.screenshots)&&input.visuals.screenshots.length,'screenshots required');
  ensure(Array.isArray(input.visuals.events)&&input.visuals.events.length,'events required');
  const ids=new Set(); for(const e of input.visuals.events){required(e,['id','type','screenshot'],'visual event');ensure(!ids.has(e.id),`Duplicate event ${e.id}`);ids.add(e.id);if(e.type==='VOICE'){required(e,['clipId','text','maskStopY'],'voice event');if(Object.hasOwn(e,'ttsSegmentIds')){ensure(Array.isArray(e.ttsSegmentIds)&&e.ttsSegmentIds.length,`VOICE ${e.id} ttsSegmentIds must be a non-empty array`);ensure(e.ttsSegmentIds.every(x=>typeof x==='string'&&x),`VOICE ${e.id} has invalid ttsSegmentIds`);ensure(new Set(e.ttsSegmentIds).size===e.ttsSegmentIds.length,`VOICE ${e.id} has duplicate ttsSegmentIds`);}}}
  const screenshots=new Set(input.visuals.screenshots.map(s=>s.id)); for(const e of input.visuals.events)ensure(screenshots.has(e.screenshot),`Unknown screenshot ${e.screenshot}`);
  const voices=input.visuals.events.filter(e=>e.type==='VOICE'),clips=voices.map(e=>e.clipId);ensure(new Set(clips).size===clips.length,'Duplicate clipId');const explicit=voices.some(e=>Object.hasOwn(e,'ttsSegmentIds'));ensure(!explicit||voices.every(e=>Object.hasOwn(e,'ttsSegmentIds')),'Explicit CapCut mapping requires ttsSegmentIds on every VOICE');
  for(const x of input.audio.trimExceptions||[]){ensure(x.match&&Object.keys(x.match).length,'Trim exception needs stable match');ensure(!Object.hasOwn(x.match,'voiceIndex'),'Trim exception cannot depend on voiceIndex');}
  const base=path.dirname(absolute); input.__inputFile=absolute;input.__inputDirectory=base;input.__inputSha256=hashFile(absolute);return input;
}
function resolveInputPath(input,value){return path.isAbsolute(value)?value:path.resolve(input.__inputDirectory,value);}
module.exports={loadInput,resolveInputPath};
