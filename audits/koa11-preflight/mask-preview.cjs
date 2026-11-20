const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa11-001":[3287,3309],"koa11-002":[3608,3708],"koa11-003":[4006,4026],"koa11-004":[4498,4518],"koa11-005":[4816,4836],"koa11-006":[5134,null],"koa11-007":[1769,1870],"koa11-008":[2168,2188],"koa11-009":[2486,2587],"koa11-010":[2885,2905],"koa11-011":[3203,3304],"koa11-012":[3602,null],"koa11-013":[815,835],"koa11-014":[1130,1153],"koa11-015":[1448,1549],"koa11-016":[1847,1948],"koa11-017":[2246,2347],"koa11-018":[2645,2665],"koa11-019":[2963,2983],"koa11-020":[3281,3382],"koa11-021":[3680,null],"koa11-022":[1558,1578],"koa11-023":[2050,2151],"koa11-024":[2449,null],"koa11-025":[1979,1999],"koa11-026":[2298,2317],"koa11-027":[2787,2887],"koa11-028":[3186,null],"koa11-029":[958,978],"koa11-030":[1276,1296],"koa11-031":[1594,1614],"koa11-032":[1912,2013],"koa11-033":[2312,2331],"koa11-034":[2630,2649],"koa11-035":[2948,null]};
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
