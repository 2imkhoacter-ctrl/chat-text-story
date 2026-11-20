// Generated only after the alignment production gate passes.
const React = require('react');
const {z} = require('zod');
const AudioTimeline = require('./v4a2-audio.jsx');
module.exports = (base, schema) => {
  const config = {...require('../video.config.json'), ...require('../video.v4a2.config.json')};
  const manifest = require('../public/generated-audio-v4a2/timing-manifest.json');
  if (manifest.validationStatus !== 'VALIDATED' || manifest.phrases.length !== config.expectedPhraseCount) throw new Error('V4A.2 manifest is not validated');
  const SharedStory = base.props.component;
  const AlignedStory = (props) => React.createElement(SharedStory, {...props, phraseAudioComponent: AudioTimeline});
  const pauses = Object.fromEntries(manifest.phrases.map((p,i)=>['Phrase '+(i+1), config.phrasePauses[p.id] ?? p.pauseAfter ?? 0]));
  return React.cloneElement(base, {id:'ChatTextStory-V4A2', component:AlignedStory, schema:schema.extend({'Pause After':z.object(Object.fromEntries(manifest.phrases.map((_,i)=>['Phrase '+(i+1),z.number().min(0).max(300).step(0.01)])))}), durationInFrames:Math.ceil((manifest.durationSeconds+config.endMarginSeconds)*config.fps), defaultProps:{...base.props.defaultProps,config,manifest,'Pause After':pauses}});
};
