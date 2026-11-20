const fs=require('node:fs'),path=require('node:path');
const {bundle}=require('@remotion/bundler');
const {selectComposition,renderMedia}=require('@remotion/renderer');
const root=path.resolve(__dirname,'..');
(async()=>{
  const speech=require('../public/capcut-tts/active.json');
  if(!speech.validated)throw Error('Validate CapCut mapping first');
  const outputLocation=path.join(root,'out/capcut-wav-preview.mp4');
  if(fs.existsSync(outputLocation))throw Error('Preview exists; refusing to overwrite');
  const serveUrl=await bundle({entryPoint:path.join(root,'src/index.jsx')});
  const composition=await selectComposition({serveUrl,id:'ChatTextStory-CapCut-WAV',port:3019});
  if(composition.durationInFrames!==speech.durationInFrames)throw Error('Composition duration disagrees with validated timeline');
  fs.writeFileSync(path.join(root,'out/capcut-composition.json'),JSON.stringify(composition,null,2)+'\n');
  console.log(`Compiled ${composition.id}: ${composition.durationInFrames} frames, ${composition.width}x${composition.height}, ${composition.fps}fps`);
  let last=0;
  await renderMedia({serveUrl,composition,outputLocation,codec:'h264',audioCodec:'aac',
    crf:23,x264Preset:'veryfast',concurrency:4,port:3019,
    onProgress:p=>{if(Date.now()-last>15000){console.log(`Render ${Math.round(p.progress*100)}% (${p.renderedFrames} frames)`);last=Date.now();}}});
  console.log(outputLocation);
})().catch(e=>{console.error(e);process.exitCode=1;});
