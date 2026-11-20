// A few stills only: reuse one browser and bundle, never render a full video.
const fs=require('fs');
const {bundle}=require('@remotion/bundler');
const {getCompositions,renderStill,openBrowser}=require('@remotion/renderer');
(async()=>{
  fs.mkdirSync('out/v4b-frames',{recursive:true});
  const serveUrl=await bundle({entryPoint:require('path').resolve('src/index.jsx')});
  const browser=await openBrowser('chrome');
  try{
    const compositions=await getCompositions(serveUrl,{puppeteerInstance:browser,port:3019});
    fs.writeFileSync('out/v4b-compositions.json',JSON.stringify(compositions.map(({id,width,height,fps,durationInFrames})=>({id,width,height,fps,durationInFrames})),null,2));
    const composition=compositions.find(c=>c.id==='ChatTextStory-V4B');
    if(!composition)throw Error('V4B not registered');
    const timeline=require('../out/v4b-event-timeline.json');
    const targets=[1,6,16,24,34,41,52,63,66,67,69,80,91,97];
    const samples=targets.map(n=>{const event=timeline.phrases.find(e=>e.voice_index===n);return {voice:n,event:event.id,frame:Math.ceil(event.timelineStart*30)+1};});
    for(const sample of samples){
      await renderStill({serveUrl,composition,frame:sample.frame,output:`out/v4b-frames/voice-${String(sample.voice).padStart(3,'0')}.png`,puppeteerInstance:browser,port:3019,logLevel:'error'});
      console.log(`Checked still voice ${sample.voice}, frame ${sample.frame}`);
    }
    fs.writeFileSync('out/v4b-frame-samples.json',JSON.stringify(samples,null,2));
  }finally{await browser.close({silent:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
