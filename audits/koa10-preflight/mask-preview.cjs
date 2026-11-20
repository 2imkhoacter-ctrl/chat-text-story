const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa10-001":[3012,3033],"koa10-002":[3485,3503],"koa10-003":[3975,4073],"koa10-004":[4371,null],"koa10-005":[834,935],"koa10-006":[1584,1604],"koa10-007":[1902,2000],"koa10-008":[2298,2399],"koa10-009":[2697,2798],"koa10-010":[3096,3116],"koa10-011":[3414,null],"koa10-012":[1403,1422],"koa10-013":[1720,1821],"koa10-014":[2293,2394],"koa10-015":[2689,2790],"koa10-016":[3088,null],"koa10-017":[833,853],"koa10-018":[1151,1171],"koa10-019":[1469,1489],"koa10-020":[1787,1888],"koa10-021":[2186,2206],"koa10-022":[2504,2605],"koa10-023":[2903,null],"koa10-024":[996,1016],"koa10-025":[1314,1334],"koa10-026":[1632,1733],"koa10-027":[2031,2051],"koa10-028":[2697,2798],"koa10-029":[3096,3196],"koa10-030":[4093,null],"koa10-031":[820,840],"koa10-032":[1138,1158],"koa10-033":[1456,1476],"koa10-034":[1774,1875],"koa10-035":[2174,2193],"koa10-036":[2492,2493],"koa10-037":[3371,null],"koa10-038":[969,989],"koa10-039":[1284,1307],"koa10-040":[1602,1622],"koa10-041":[2094,2114],"koa10-042":[2412,2512],"koa10-043":[3616,3635],"koa10-044":[3934,null],"koa10-045":[797,817],"koa10-046":[1289,1309],"koa10-047":[1607,1708],"koa10-048":[2006,2026],"koa10-049":[2324,2425],"koa10-050":[2894,2995],"koa10-051":[3293,3394],"koa10-052":[3692,3712],"koa10-053":[4010,null],"koa10-054":[825,845],"koa10-055":[1143,1163],"koa10-056":[1461,1562],"koa10-057":[1860,1880],"koa10-058":[2178,2198],"koa10-059":[2496,null]};
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
