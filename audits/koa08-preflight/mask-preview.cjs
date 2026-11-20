const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa08-001":[3629,3651],"koa08-002":[3949,4050],"koa08-003":[4348,4368],"koa08-004":[4666,null],"koa08-005":[3073,3091],"koa08-006":[3387,3409],"koa08-007":[3705,3724],"koa08-008":[4023,4123],"koa08-009":[4421,4441],"koa08-010":[4739,null],"koa08-011":[797,817],"koa08-012":[1115,1135],"koa08-013":[1607,1627],"koa08-014":[1925,1945],"koa08-015":[2591,2611],"koa08-016":[2909,3010],"koa08-017":[3308,3409],"koa08-018":[3707,null],"koa08-019":[959,978],"koa08-020":[1448,1548],"koa08-021":[1847,1866],"koa08-022":[2164,2184],"koa08-023":[2482,2502],"koa08-024":[2800,2901],"koa08-025":[3199,3219],"koa08-026":[3517,3618],"koa08-027":[3916,null],"koa08-028":[829,930],"koa08-029":[1228,1329],"koa08-030":[1627,1647],"koa08-031":[2119,2139],"koa08-032":[2437,2538],"koa08-033":[2836,2937],"koa08-034":[3235,3255],"koa08-035":[3553,null],"koa08-036":[822,842],"koa08-037":[1140,1241],"koa08-038":[1539,1559],"koa08-039":[2032,2132],"koa08-040":[2605,2705],"koa08-041":[3004,3023],"koa08-042":[3322,3423],"koa08-043":[3721,3741],"koa08-044":[4039,4059],"koa08-045":[4357,4458],"koa08-046":[4756,null],"koa08-047":[794,814],"koa08-048":[1109,1132],"koa08-049":[1427,1447],"koa08-050":[1745,1846],"koa08-051":[2144,2164],"koa08-052":[2462,2482],"koa08-053":[2780,2881],"koa08-054":[3179,3199],"koa08-055":[3497,3517],"koa08-056":[3815,null],"koa08-057":[2531,2550],"koa08-058":[2848,2868],"koa08-059":[3166,3186],"koa08-060":[3484,null]};
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
