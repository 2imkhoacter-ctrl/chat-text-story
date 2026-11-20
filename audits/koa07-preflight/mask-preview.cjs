const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa07-001":[3417,3439],"koa07-002":[3911,3931],"koa07-003":[4229,4330],"koa07-004":[4628,4648],"koa07-005":[4946,4966],"koa07-006":[783,803],"koa07-007":[1275,1373],"koa07-008":[1671,1691],"koa07-009":[1989,2089],"koa07-010":[3265,3284],"koa07-011":[3582,3683],"koa07-012":[3981,null],"koa07-013":[826,927],"koa07-014":[1225,1326],"koa07-015":[1624,1725],"koa07-016":[2023,2124],"koa07-017":[2419,2438],"koa07-018":[2737,2838],"koa07-019":[3136,null],"koa07-020":[803,823],"koa07-021":[1121,1222],"koa07-022":[1520,1540],"koa07-023":[1838,1858],"koa07-024":[2156,2176],"koa07-025":[2474,2494],"koa07-026":[2792,null],"koa07-027":[2666,2684],"koa07-028":[2983,3002],"koa07-029":[3301,3398],"koa07-030":[3697,3716],"koa07-031":[4015,4115],"koa07-032":[4414,null],"koa07-033":[803,823],"koa07-034":[1295,1315],"koa07-035":[1787,1788],"koa07-036":[4104,4204],"koa07-037":[4502,4522],"koa07-038":[769,870],"koa07-039":[1165,1266],"koa07-040":[1564,1665],"koa07-041":[1963,1983],"koa07-042":[2455,2475],"koa07-043":[2773,2874],"koa07-044":[3173,3192],"koa07-045":[3490,3510],"koa07-046":[3982,null]};
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
