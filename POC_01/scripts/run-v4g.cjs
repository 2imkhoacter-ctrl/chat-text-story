// One reusable run; never invoke any previous version's production generator.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
process.chdir(root);
const files=['data/chat-events.json','data/tts-script.txt','data/audio-boundary-overrides.json','scripts/audio-boundary-nudge.cjs','src/v4b-timeline.cjs','src/phrase-timeline.cjs','public/full_tts.mp3.MP3',
  ...fs.readdirSync('src').filter(f=>/^v4[b-f]-/.test(f)).map(f=>'src/'+f),
  ...['public/generated-audio-v4a2','public/generated-audio-v4c','public/generated-audio-v4d','public/generated-audio-v4e','public/generated-audio-v4f'].flatMap(d=>fs.existsSync(d)?fs.readdirSync(d).map(f=>d+'/'+f):[])];
fs.writeFileSync('out/v4g-protected-hashes.json',JSON.stringify(Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')])),null,2));
const python=path.join(root,'.venv-speech/Scripts/python.exe');
for(const [program,args]of [[python,['-X','utf8','scripts/test-v4g-detectors.py']],[python,['-X','utf8','scripts/auto-edge-repair-v4g.py']],[process.execPath,['scripts/finalize-v4g.cjs']]]){
  const result=spawnSync(program,args,{cwd:root,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
