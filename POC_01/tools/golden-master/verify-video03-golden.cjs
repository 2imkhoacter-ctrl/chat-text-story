const fs=require('fs'); const path=require('path'); const crypto=require('crypto');
const root=path.resolve(__dirname,'../..');
const golden=path.join(root,'golden-masters/girlfriend03-approved-20261028');
const manifest=JSON.parse(fs.readFileSync(path.join(golden,'SHA256_MANIFEST.json'),'utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const failures=[];
for(const item of manifest.files){const file=path.join(golden,'episode',item.path); if(!fs.existsSync(file)) failures.push(`${item.path}: missing`); else if(hash(file)!==item.sha256) failures.push(`${item.path}: hash mismatch`);}
const state=JSON.parse(fs.readFileSync(path.join(golden,'VIDEO03_APPROVED_STATE.json'),'utf8'));
const result={files:manifest.files.length,voices:state.voices.length,screenshots:state.screenshots.length,sfx:state.sfxCues.length,normalGap:state.props['Normal Gap'],failures};
console.log(JSON.stringify(result,null,2)); if(failures.length||result.voices!==76||result.screenshots!==12||result.sfx!==19||result.normalGap!==0)process.exit(1);
