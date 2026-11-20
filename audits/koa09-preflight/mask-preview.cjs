const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa09-001":[3767,3792],"koa09-002":[4261,4362],"koa09-003":[4660,4680],"koa09-004":[4978,4998],"koa09-005":[5296,null],"koa09-006":[814,834],"koa09-007":[1132,1233],"koa09-008":[1531,1632],"koa09-009":[1930,1950],"koa09-010":[2248,2349],"koa09-011":[2647,2667],"koa09-012":[2965,3066],"koa09-013":[3364,3384],"koa09-014":[4555,null],"koa09-015":[802,902],"koa09-016":[1201,1301],"koa09-017":[1600,1619],"koa09-018":[1918,1919],"koa09-019":[3751,3770],"koa09-020":[4069,4170],"koa09-021":[4468,null],"koa09-022":[813,914],"koa09-023":[1212,1232],"koa09-024":[1530,1631],"koa09-025":[1929,2030],"koa09-026":[3027,3128],"koa09-027":[3430,null],"koa09-028":[2013,2032],"koa09-029":[2330,2431],"koa09-030":[2729,2749],"koa09-031":[3045,3145],"koa09-032":[3443,3544],"koa09-033":[3843,3936],"koa09-034":[4242,4261],"koa09-035":[4560,4579],"koa09-036":[751,769],"koa09-037":[1072,1087],"koa09-038":[1385,1486],"koa09-039":[1958,2059],"koa09-040":[2357,2377],"koa09-041":[2675,2776],"koa09-042":[3074,3174],"koa09-043":[3470,null],"koa09-044":[807,908],"koa09-045":[1206,1307],"koa09-046":[1605,1706],"koa09-047":[2004,2105],"koa09-048":[2403,2423],"koa09-049":[2721,2741],"koa09-050":[3039,null]};
const shot=Object.fromEntries(c.sources.screenshots.map(s=>[s.id,s]));const fails=[];
for(const e of c.creative.visualEvents){const s=shot[e.screenshot],[bottom,next]=REF[e.id],m=e.maskStopY;
 if(!(e.rawTopY<bottom))fails.push(e.id+' rawTopY>=bottom');
 if(!(m>bottom))fails.push(e.id+' mask cắt vào bubble hiện tại');
 if(next!==null&&m>next)fails.push(e.id+' mask lộ phần tử kế tiếp');
 if(m>s.height)fails.push(e.id+' mask vượt chiều cao ảnh');
 cp.execFileSync(ff,['-y','-loglevel','error','-i',s.file,'-vf',`crop=iw:${m}:0:0,scale=1000:-1`,path.join(out,e.id+'.png')]);
 const top=Math.max(0,m-420);cp.execFileSync(ff,['-y','-loglevel','error','-i',s.file,'-vf',`crop=iw:${m-top}:0:${top},scale=1200:-1`,path.join(out,e.id+'_edge.png')]);}
fs.writeFileSync(path.join(out,'mask-check.json'),JSON.stringify({events:c.creative.visualEvents.length,fails},null,2));
if(fails.length)throw Error('MASK_CHECK_FAIL '+fails.join(' | '));console.log('MASK_CHECK_PASS',c.creative.visualEvents.length);
