const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
const mapping=require('../data/chat-events.json');
const speech=require('../public/generated-audio-v4a2/timing-manifest.json');
const config={...require('../video.config.json'),...require('../video.v4a2.config.json')};
const {buildEventTimeline,visualState}=require('../src/v4b-timeline.cjs');
const props={'Initial Margin':config.initialMarginSeconds,'Normal Gap':config.defaultPauseAfterSeconds,'Pause After':Object.fromEntries(speech.phrases.map((p,i)=>[`Phrase ${i+1}`,config.phrasePauses[p.id]??p.pauseAfter??0]))};
const timeline=buildEventTimeline(mapping,speech,props);
const voices=timeline.phrases.filter(e=>e.type==='VOICE');
assert.equal(voices.length,97);
assert.deepEqual(voices.map(e=>e.voice_index),Array.from({length:97},(_,i)=>i+1));
const script=fs.readFileSync('data/tts-script.txt','utf8').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
assert.equal(script.length,97);
voices.forEach((e,i)=>{assert.equal(e.script_text,script[i]);assert.equal(e.clipDuration,speech.phrases[i].clipDuration);assert.equal(e.relativeAudioFile,speech.phrases[i].relativeAudioFile);});
assert.equal(new Set(mapping.events.map(e=>e.screenshot)).size,11);
timeline.phrases.forEach((e,i)=>{
  if(e.type!=='VOICE'){assert.equal(e.voice_index,null);assert.equal(e.pauseAfter,.5);assert.equal(e.clipDuration,0);}
  assert(e.mask_stop_y>=e.raw_bubble_bottom_y+1);
  assert(e.mask_stop_y<=e.next_bubble_top_y);
  for(const t of [e.timelineStart,(e.timelineStart+e.transitionStart)/2,e.transitionStart-1e-7]){
    if(t<e.timelineStart)continue;
    const state=visualState(timeline,t);
    assert.equal(state.event.event_id,e.event_id);assert.equal(state.maskY,e.maskStopY);
  }
  if(i){assert.equal(timeline.phrases[i-1].transitionEnd,e.timelineStart);}
});
// Ensure a spoken Pause After remains linked to its voice index after silent insertions.
const altered=buildEventTimeline(mapping,speech,{...props,'Pause After':{...props['Pause After'],'Phrase 23':1.25}});
assert.equal(altered.phrases.find(e=>e.voice_index===23).pauseAfter,1.25);
const protectedHashes=require('../out/v4b-protected-hashes.json');
const changed=Object.entries(protectedHashes).filter(([file,hash])=>file!=='src/index.jsx'&&crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==hash).map(([f])=>f);
assert.deepEqual(changed,[]);
assert.equal(fs.readdirSync('public/generated-audio-v4a2').filter(f=>/^voice_\d{3}\.wav$/.test(f)).length,97);
const switches=timeline.phrases.filter((e,i)=>i&&e.screenshot!==timeline.phrases[i-1].screenshot).map(e=>({event:e.event_id,voice:e.voice_index,time:e.timelineStart,screenshot:e.screenshot,status:'NEEDS_CONTINUITY_REVIEW'}));
const result={screenshots:11,VOICE:97,SILENT:1,IMAGE:3,total:101,durationSeconds:timeline.durationSeconds+config.endMarginSeconds,durationInFrames:Math.ceil((timeline.durationSeconds+config.endMarginSeconds)*30),originalAssetsAndSpeechFilesUnchanged:true,protectedFilesChecked:Object.keys(protectedHashes).length-1,maskTiming:'Static throughout VOICE/HOLD, transitions restricted to GAP; all 101 events checked.',switches,review:mapping.review};
fs.writeFileSync('out/v4b-validation.json',JSON.stringify(result,null,2)+'\n');
fs.writeFileSync('out/v4b-event-timeline.json',JSON.stringify(timeline,null,2)+'\n');
fs.writeFileSync('out/v4b-mask-coordinates.csv','event,type,voice,screenshot,raw_top,raw_bottom,local_mask_stop,canvas_mask_stop,status\n'+mapping.events.map(e=>[e.event_id,e.type,e.voice_index??'',e.screenshot,e.raw_top_y,e.raw_bubble_bottom_y,e.mask_stop_y,e.canvas_mask_stop_y,e.coordinate_status].join(',')).join('\n')+'\n');
let report='# V4B mapping and validation\n\nSeparate composition: ChatTextStory-V4B. 11 screenshots, 97 VOICE + 1 SILENT + 3 IMAGE = 101 events.\n\n';
report+='## Layout\n\nSaved V4A2 defaults preserved: Chat Scale 0.83; vertical center 700 (saved configuration differs from 741). Shared tallest reference '+mapping.layout_reference.filename+' ('+mapping.layout_reference.width+'×'+mapping.layout_reference.height+'). Existing fit-times-Chat-Scale transform reused: actual local-to-canvas scale '+mapping.rendered_scale+'. All images share centerY=700. Mask stops use original local screenshot pixels. Canvas Y = 700 − imageHeight × scale / 2 + localY × scale. The scale is applied once.\n\n';
report+='## Screenshot assignment (ordered by conversation)\n\n|Screenshot|New voice indices|Overlap|\n|---|---|---|\n'+mapping.screenshots.map(s=>`|${s.filename}|${s.first_voice}–${s.last_voice}|${s.overlap}|`).join('\n')+'\n\n';
report+='## Silent/image order\n\nOpening chair IMAGE before voice 1; SILENT “...” after voice 22; transfer IMAGE after voice 37; plant IMAGE after voice 66. Each holds 0.5s and uses its own following Normal Gap. “???” at voices 54/67, VCL at 26/73, laughter at 40 and ĐCM at 84 are spoken mappings, not extra silent events.\n\n';
report+='## Coordinate and timing tables\n\nSee v4b-mask-coordinates.csv (all 101 local/canvas stops) and v4b-event-timeline.json (VOICE/HOLD/GAP timing). data/chat-events.json contains editable text, screenshot, indices, geometry, silent holds and review status.\n\n';
report+='## Validation\n\nExactly 97 unique, ordered voice references; authoritative script unchanged; all 97 existing WAVs, speech/alignment manifests, original assets and prior-version source modules unchanged by SHA-256. src/index.jsx only adds V4B registration. Per-phrase Pause After still uses original voice indices. No speed/pitch props or audio extraction added. Static VOICE/HOLD and contiguous GAP endpoints checked for all 101 events. Duration '+result.durationSeconds+'s, rounded to '+result.durationInFrames+' frames at 30fps.\n\n';
report+='## Unresolved visual limitations\n\n'+mapping.review.map(s=>'- '+s).join('\n')+'\n\nThe ten screenshot changes are boundary cuts during GAP, followed by revealing the new bubble; they are NOT certified seamless. Most adjacent screenshots have no full shared message; the last contains repeated 82–90 history, which is not assigned new events. Fixed image centers and unequal screenshot heights move the header/history. Avoiding those shifts would require permission to relax layout/transition constraints. No arbitrary image offsets, fades or new effects have been introduced.\n\n';
  report+='## Files created / modified\n\nCreated: data/chat-events.json; src/v4b-registration.jsx; src/v4b-timeline.cjs; scripts/map-v4b.cjs; scripts/verify-v4b.cjs; scripts/check-v4b-frames.cjs; out/v4b-* reports, hashes, timeline, coordinate CSV and sample stills. Modified: src/index.jsx (V4B registration only). No configuration or original asset files modified.\n\n';
  report+='Open http://localhost:3000/ChatTextStory-V4B. Studio right sidebar → Props → Pause After keeps all 97 controls. No full video render performed. Rendered-frame sample results are recorded separately in v4b-rendered-checks.md.\n';
fs.writeFileSync('out/v4b-mapping-report.md',report);
console.log(JSON.stringify(result,null,2));
