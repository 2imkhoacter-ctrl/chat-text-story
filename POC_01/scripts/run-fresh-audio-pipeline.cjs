// Real fresh inference + unchanged original scripts inside an isolated workspace.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const write=(f,v)=>fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n');
const args=process.argv.slice(2),configArg=args.find(a=>!a.startsWith('--'))??'fresh-audio-pipeline.config.json';
const settings=JSON.parse(fs.readFileSync(path.resolve(root,configArg)));
const runId=new Date().toISOString().replace(/[:.]/g,'-');
const runDir=path.join(root,'out/fresh-audio-runs',runId),work=path.join(runDir,'work');
const count=fs.readFileSync(path.resolve(root,settings.script),'utf8').split(/\r?\n/).filter(s=>s.trim()).length;
for(const d of ['scripts','src','public','data','out'])fs.mkdirSync(path.join(work,d),{recursive:true});
// Junction is dependency reuse only; there are no old caches/WAVs/manifests here.
fs.symlinkSync(path.join(root,'node_modules'),path.join(work,'node_modules'),'junction');
fs.copyFileSync(path.resolve(root,settings.audio),path.join(work,'public/master-input.mp3'));
fs.copyFileSync(path.resolve(root,settings.script),path.join(work,'data/script.txt'));
const scriptNames=['transcribe-v4a1.py','align-v4a1.py','resolve-v4a2.py','finalize-v4a2.cjs','segment-audio.cjs'];
for(const f of scriptNames)fs.copyFileSync(path.join(root,'scripts',f),path.join(work,'scripts',f));
fs.copyFileSync(path.join(root,'src/phrase-timeline.cjs'),path.join(work,'src/phrase-timeline.cjs'));
fs.copyFileSync(path.join(root,'src/index.jsx'),path.join(work,'src/index.jsx'));
const layout=JSON.parse(fs.readFileSync(path.join(root,'video.config.json')));
const c1={...JSON.parse(fs.readFileSync(path.join(root,'video.v4a1.config.json'))),audio:'public/master-input.mp3',script:'data/script.txt',expectedPhraseCount:count,model:settings.model,language:settings.language,generatedAudioDir:'public/fresh-alignment',timingManifest:'public/fresh-alignment/timing-manifest.json',phrasePauses:{}};
const c2={...JSON.parse(fs.readFileSync(path.join(root,'video.v4a2.config.json'))),audio:c1.audio,script:c1.script,expectedPhraseCount:count,baselineAlignment:'public/fresh-alignment/alignment-manifest.json',cachedWords:'public/fresh-alignment/whisper-words.json',generatedAudioDir:'public/fresh-cut',timingManifest:'public/fresh-cut/timing-manifest.json',phrasePauses:{}};
write(path.join(work,'video.config.json'),layout);write(path.join(work,'video.v4a1.config.json'),c1);write(path.join(work,'video.v4a2.config.json'),c2);
const protectedFiles=[];
for(const dir of ['public','data','src']){
  const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(!f.includes(path.join('public','freshcut-'))&&!path.basename(f).startsWith('freshcut-'))protectedFiles.push(f);}};walk(path.join(root,dir));
}
for(const f of fs.readdirSync(root).filter(f=>/^video.*\.json$/.test(f)))protectedFiles.push(path.join(root,f));
const protectedHashes=Object.fromEntries(protectedFiles.map(f=>[path.relative(root,f),digest(f)]));
const context={runId,runDir,work,settings,phraseCount:count,sourceSha256:digest(path.resolve(root,settings.audio)),scriptSha256:digest(path.resolve(root,settings.script)),originalScriptHashes:Object.fromEntries(scriptNames.map(f=>[f,digest(path.join(root,'scripts',f))])),protectedHashes,startedAt:new Date().toISOString()};
write(path.join(runDir,'context.json'),context);write(path.join(root,'out/fresh-audio-current-run.json'),{runDir});
const python=path.join(root,'.venv-speech/Scripts/python.exe');
const execute=(program,argv,label,accepted=[0])=>new Promise((resolve,reject)=>{
  console.log(`\n[FRESH] ${label}`);
  const log=fs.createWriteStream(path.join(runDir,label+'.log'));
  const child=spawn(program,argv,{cwd:work,env:process.env,stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',b=>{process.stdout.write(b);log.write(b);});child.stderr.on('data',b=>{process.stderr.write(b);log.write(b);});
  child.on('error',reject);child.on('close',code=>{log.end();accepted.includes(code)?resolve():reject(Error(`${label} failed (${code}); outputs preserved at ${runDir}`));});
});
(async()=>{
  console.log(`Fresh run ${runId}; ${count} script phrases; no old timestamps or overrides staged.`);
  await execute(python,['-X','utf8','scripts/transcribe-v4a1.py'],'01-whisper-large-v2');
  await execute(python,['-X','utf8','scripts/align-v4a1.py'],'02-ordered-alignment',[0,2]);
  await execute(python,['-X','utf8','scripts/resolve-v4a2.py'],'03-sequential-resolution');
  for(const f of scriptNames)if(digest(path.join(work,'scripts',f))!==context.originalScriptHashes[f])throw Error('Original algorithm script changed: '+f);
  context.initialAlignmentComplete=true;write(path.join(runDir,'context.json'),context);
  if(args.includes('--initial-only')){console.log(`Fresh alignment ready for the shared-PCM extraction stage: ${runDir}`);return;}
  await execute(python,[path.join(root,'scripts/repair-fresh-audio.py'),path.join(runDir,'context.json')],'05-head-tail-repair');
  await execute(process.execPath,[path.join(root,'scripts/finalize-fresh-audio.cjs'),path.join(runDir,'context.json')],'06-ab-compositions');
})().catch(e=>{console.error(e);process.exitCode=1;});
