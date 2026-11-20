// Isolate the next version without editing working V4C files.
const fs=require('node:fs');
let engine=fs.readFileSync('scripts/audio-boundary-nudge.cjs','utf8')
  .replace('V4C only.','V4D only.').replace('V4C ready:','V4D ready:')
  .replaceAll('generated-audio-v4c','generated-audio-v4d')
  .replaceAll('audio-boundary-overrides.json','audio-boundary-overrides-v4d.json')
  .replaceAll('v4c-manual-boundary-nudge','v4d-auto-base-manual-nudge')
  .replaceAll('ChatTextStory-V4C-AudioNudge','ChatTextStory-V4D-AudioCalibrated')
  .replace("const rate=44100,channels=2,frameBytes=4;","const bases=require('../data/audio-boundary-bases.json');\nconst {summarize}=require('./report-audio-boundaries.cjs');\nconst rate=44100,channels=2,frameBytes=4;")
  .replace(/^const originalCuts=.*;$/m,'const originalCuts=[bases.outerStartSample,...bases.boundaries.map(b=>b.autoCorrectedBaseSample),bases.outerEndSample];')
  .replace("manualBoundaryOverrides:{...overrides},","manualBoundaryOverrides:{...overrides},autoBaseFingerprint:digest(Buffer.from(JSON.stringify(bases))),boundaryCorrections:bases.boundaries.map((b,i)=>({...b,manualOverrideMs:overrides[key(i+1)]??0,finalBoundary:cuts[i+1]/rate})),")
  .replace("const writes=indices.map", "const report=summarize(manifest);\n  const writes=indices.map")
  .replace("const backups=writes.map", "writes.push([path.join(root,'out/v4d-boundary-report.json'),Buffer.from(JSON.stringify({summary:report.summary,boundaries:report.boundaries},null,2)+'\\n')],[path.join(root,'out/v4d-boundary-report.csv'),Buffer.from(report.csv)]);\n  const backups=writes.map")
  .replace("const hash=digest(fs.readFileSync(source));","const hash=digest(fs.readFileSync(source));\n  if(hash!==bases.sourceHash)throw Error('Master changed: regenerate automatic base analysis before extraction');")
  .replace("if(!current||JSON.stringify", "if(!current||current.autoBaseFingerprint!==digest(Buffer.from(JSON.stringify(bases)))||JSON.stringify")
  .replace("original:originalCuts[n]/rate,correctionMs:","originalAlignmentBoundary:bases.boundaries[i].originalAlignmentBoundary,autoCorrectedBaseBoundary:originalCuts[n]/rate,automaticDeltaMs:bases.boundaries[i].automaticDeltaMs,status:bases.boundaries[i].status,reasons:bases.boundaries[i].reasons,original:originalCuts[n]/rate,correctionMs:")
  .replace('Run node scripts/audio-nudge-server.cjs','Run node scripts/audio-nudge-server-v4d.cjs');
fs.writeFileSync('scripts/audio-boundary-nudge-v4d.cjs',engine);
fs.writeFileSync('scripts/audio-nudge-server-v4d.cjs',fs.readFileSync('scripts/audio-nudge-server.cjs','utf8')
  .replace('./audio-boundary-nudge.cjs','./audio-boundary-nudge-v4d.cjs').replace('const port=3010','const port=3011').replace('audio-nudge-ui.html','audio-nudge-ui-v4d.html'));
fs.writeFileSync('scripts/audio-nudge-ui-v4d.html',fs.readFileSync('scripts/audio-nudge-ui.html','utf8')
  .replaceAll('ChatTextStory-V4C-AudioNudge','ChatTextStory-V4D-AudioCalibrated').replaceAll('V4C','V4D')
  .replace('For existing source gaps, the original V4D cut is their midpoint. RESET restores that cut.','Automatic base searches ±80 ms around alignment; uncertain cuts stay unchanged and are flagged. RESET restores the automatic base. Existing V4C manual corrections are preserved in their own version.')
  .replace('Original boundary: ${fmt(b.original)} s','Alignment: ${fmt(b.originalAlignmentBoundary)} s · Auto base: ${fmt(b.original)} s (${signed(Math.round(b.automaticDeltaMs))} ms)')
  .replace('article.append(info);','article.append(info); const review=document.createElement(\'small\');review.textContent=b.status+(b.reasons.length?\' — \'+b.reasons.join(\', \'):\'\');article.append(review,document.createElement(\'br\'));'));
fs.writeFileSync('src/v4d-registration.jsx',fs.readFileSync('src/v4c-registration.jsx','utf8')
  .replaceAll('ChatTextStory-V4C-AudioNudge','ChatTextStory-V4D-AudioCalibrated').replace('generated-audio-v4c','generated-audio-v4d'));
console.log('Created isolated V4D engine, editor, and composition; V4C untouched.');
