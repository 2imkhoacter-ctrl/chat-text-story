const assert=require('assert');
const path=require('path');
const {validateContract,generateInput}=require('../cli.cjs');

const contract={version:1,episode:{id:'v2-test',compositionId:'V2-Test',title:'V2 Test',width:1080,height:1920,fps:30},sources:{capcutDraft:'capcut',screenshots:[{id:'screen-1',file:'screen.png',width:1080,height:1920}],gameplay:{file:'game.mp4'},music:{file:'music.mp3'},sfxAssets:[]},creative:{script:[{id:'line-1',clipId:'clip-1',text:'Xin chào',spokenText:'Xin chào',pauseAfterSeconds:0}],visualEvents:[{id:'line-1',type:'VOICE',screenshot:'screen-1',rawTopY:100,maskStopY:300}],geometryStatus:'VERIFIED',sfxCues:[],audio:{trimPolicy:{binSeconds:.01,leadingGuardSeconds:.02,maxTrailingSilenceSeconds:.15},timeline:{initialMarginSeconds:0,endMarginSeconds:.15}},props:{'Initial Margin':0,'End Margin':.15,'Chat Scale':1,'Chat Vertical Position':960,'Bubble Reveal Duration':.17,'Screenshot X Offset':0,'Screenshot Y Offset':0,'Per-Screenshot Y Offset':{'screen-1':0},'Pause After':{'clip-1':0},'Bubble Mask Y':{'line-1':300}}},render:{enabled:false}};
validateContract(contract);
const generated=generateInput(contract,'C:/fixture','C:/fixture/out');
assert.equal(generated.audio.timeline.baseGapSeconds,.15);
assert.equal(generated.props.approved['Normal Gap'],.15);
assert.equal(generated.props.defaults['Normal Gap'],.15);
assert.equal(generated.visuals.events.length,1);
assert.equal(generated.visuals.events[0].clipId,'clip-1');
assert.equal(generated.background.gameplay.file,path.resolve('C:/fixture','game.mp4'));
console.log(JSON.stringify({status:'PASS',checks:['contract validation','input generation','Normal Gap 0.15 fallback','render disabled contract']}));
