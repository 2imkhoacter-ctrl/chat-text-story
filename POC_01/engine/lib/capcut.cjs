const util=require('util');
const {fs,path,readJson,hashFile,normalize,ensure}=require('./utils.cjs');

const one=(xs,label)=>{ensure(xs.length===1,`${label}: expected one, found ${xs.length}`);return xs[0];};

const linkedDraftSegments=(main)=>{
  const draftIds=new Set((main.materials.drafts||[]).map(d=>d.id));
  return main.tracks.flatMap(t=>t.segments||[])
    .filter(segment=>(segment.extra_material_refs||[]).some(ref=>draftIds.has(ref)))
    .sort((a,b)=>a.target_timerange.start-b.target_timerange.start);
};

function describeSegment(source,main,outer,index,usedSources,usedDrafts,usedStableIds){
  const link=one(main.materials.drafts.filter(d=>(outer.extra_material_refs||[]).includes(d.id)),`composition ${index+1}`);
  ensure(!usedDrafts.has(link.draft.id),`Repeated subdraft ${link.draft.id}`);usedDrafts.add(link.draft.id);
  const subFile=path.join(source,'subdraft',link.draft.id,'draft_content.json'),sub=readJson(subFile);
  const nested=one(sub.materials.drafts.filter(d=>d.draft.id===link.draft.id),'nested draft').draft;
  const audio=one(nested.tracks.filter(t=>t.type==='audio').flatMap(t=>t.segments||[]),'audio segment');
  const material=one(nested.materials.audios.filter(a=>a.id===audio.material_id),'audio material');
  const stableId=material.id;ensure(stableId,`Missing stable audio material ID at composition ${index+1}`);
  ensure(!usedStableIds.has(stableId),`Duplicate stable audio material ID ${stableId}`);usedStableIds.add(stableId);
  const textSeg=one(nested.tracks.filter(t=>t.type==='text').flatMap(t=>t.segments||[]),'text segment');
  const textMat=one(nested.materials.texts.filter(t=>t.id===textSeg.material_id),'text material');
  const text=typeof textMat.content==='string'?JSON.parse(textMat.content).text:textMat.content.text;
  ensure(normalize(text)===normalize(material.name),`CapCut text/material mismatch for segment ${stableId}`);
  const snapshot=link.draft.tracks.filter(t=>t.type==='audio').flatMap(t=>t.segments||[]);
  ensure(util.isDeepStrictEqual(snapshot,nested.tracks.filter(t=>t.type==='audio').flatMap(t=>t.segments||[])),`Stale nested audio segment ${stableId}`);
  const portable=material.path.replace(/\\/g,'/');
  const relative=portable.startsWith('##_draftpath_placeholder_')?portable.replace(/^##[^/]+##\//,''):null;
  const sourceFile=relative?path.resolve(source,relative):path.resolve(material.path);
  ensure(fs.existsSync(sourceFile),`Missing TTS ${sourceFile}`);
  ensure(!usedSources.has(sourceFile.toLowerCase()),`Duplicate TTS ${sourceFile}`);usedSources.add(sourceFile.toLowerCase());
  for(const [level,s] of [['composition',outer],['audio',audio]]){
    ensure(s.speed>0&&!s.reverse&&!s.is_loop,`Unsupported ${level} speed for ${stableId}`);
    ensure(Math.abs(s.source_timerange.duration/s.speed-s.target_timerange.duration)<=2000,`${level} speed/range conflict for ${stableId}`);
    const refs=(nested.materials.speeds||[]).filter(x=>(s.extra_material_refs||[]).includes(x.id));
    ensure(!refs.some(x=>x.curve_speed),`Variable speed unsupported for ${stableId}`);
    ensure(!refs.some(x=>Math.abs(x.speed-s.speed)>1e-5),`Speed material conflict for ${stableId}`);
  }
  const os=outer.source_timerange,at=audio.target_timerange,ar=audio.source_timerange;
  const begin=Math.max(os.start,at.start),end=Math.min(os.start+os.duration,at.start+at.duration);
  ensure(end>begin,`Empty source range for ${stableId}`);
  return {
    order:index+1,stableId,text,speaker:material.tone_speaker||null,sourceFile,
    sourceSha256:hashFile(sourceFile),
    sourceStart:(ar.start+(begin-at.start)*audio.speed)/1e6,
    sourceDuration:(end-begin)*audio.speed/1e6,
    speed:outer.speed*audio.speed,
    speedLevels:{composition:outer.speed,audio:audio.speed},
    compositionVolume:outer.volume??1,audioVolume:audio.volume??1,
    gain:(outer.volume??1)*(audio.volume??1),subdraft:subFile,materialId:material.id,
  };
}

function mapSegments(voiceEvents,segments){
  const explicit=voiceEvents.some(event=>Object.hasOwn(event,'ttsSegmentIds'));
  if(!explicit){
    ensure(segments.length===voiceEvents.length,`CapCut ${segments.length} voices != input ${voiceEvents.length}; explicit ttsSegmentIds mapping is required for multi-segment VOICE`);
    return voiceEvents.map((event,index)=>({event,segments:[segments[index]]}));
  }
  ensure(voiceEvents.every(event=>Array.isArray(event.ttsSegmentIds)&&event.ttsSegmentIds.length>0),'Every VOICE must define a non-empty ttsSegmentIds array when explicit mapping is used');
  const byId=new Map(segments.map(segment=>[segment.stableId,segment])),used=new Set(),flattened=[];
  const groups=voiceEvents.map(event=>{
    const mapped=event.ttsSegmentIds.map(id=>{
      ensure(typeof id==='string'&&id,`Invalid stable ID in ${event.clipId}`);
      ensure(byId.has(id),`Unknown TTS stable ID ${id} for ${event.clipId}`);
      ensure(!used.has(id),`TTS stable ID ${id} is mapped more than once`);used.add(id);
      const segment=byId.get(id);flattened.push(segment);return segment;
    });
    return {event,segments:mapped};
  });
  const missing=segments.filter(segment=>!used.has(segment.stableId));
  ensure(!missing.length,`Unmapped CapCut TTS segments: ${missing.map(x=>x.stableId).join(', ')}`);
  ensure(flattened.length===segments.length&&flattened.every((segment,index)=>segment===segments[index]),'TTS mapping must preserve CapCut order and group only consecutive segments');
  return groups;
}

function readCapcut(input){
  const source=path.resolve(input.capcut.draftDirectory),main=readJson(path.join(source,'draft_content.json'));
  const voiceEvents=input.visuals.events.filter(e=>e.type==='VOICE');
  const usedSources=new Set(),usedDrafts=new Set(),usedStableIds=new Set();
  const segments=linkedDraftSegments(main).map((outer,index)=>describeSegment(source,main,outer,index,usedSources,usedDrafts,usedStableIds));
  return mapSegments(voiceEvents,segments).map(({event,segments:parts},index)=>{
    const text=parts.map(part=>part.text).join(' ');
    ensure(normalize(text)===normalize(event.text),`Text mismatch for ${event.clipId}: CapCut "${text}" != input "${event.text}"`);
    const speakers=new Set(parts.map(part=>part.speaker).filter(Boolean));
    ensure(speakers.size<=1,`Multiple speakers mapped to ${event.clipId}`);
    const common={order:index+1,clipId:event.clipId,eventId:event.id,text,speaker:parts[0].speaker||null,segmentIds:parts.map(x=>x.stableId),segments:parts};
    return parts.length===1?{...parts[0],...common}:common;
  });
}

module.exports={readCapcut,linkedDraftSegments,mapSegments};
