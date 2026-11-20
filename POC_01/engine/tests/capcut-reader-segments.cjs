const assert=require('assert');
const {linkedDraftSegments}=require('../lib/capcut.cjs');

const tts=Array.from({length:46},(_,index)=>({
  target_timerange:{start:(45-index)*1000},
  extra_material_refs:[`link-${45-index}`],
}));
const background={
  target_timerange:{start:0},
  material_id:'background-image',
  extra_material_refs:[],
};
const main={
  materials:{drafts:Array.from({length:46},(_,index)=>({id:`link-${index}`,draft:{id:`draft-${index}`}}))},
  tracks:[{segments:[background,...tts]}],
};

const actual=linkedDraftSegments(main);
assert.equal(actual.length,46);
assert.deepEqual(actual.map(segment=>segment.target_timerange.start),Array.from({length:46},(_,index)=>index*1000));
assert(!actual.includes(background));
console.log('capcut-reader-segments: PASS');
