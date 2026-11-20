const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const golden = path.join(root, 'golden-masters/girlfriend03-approved-20261028');
const state = JSON.parse(fs.readFileSync(path.join(golden, 'VIDEO03_APPROVED_STATE.json'), 'utf8'));
const chat = JSON.parse(fs.readFileSync(path.join(golden, 'episode/data/chat-events.json'), 'utf8'));
const frozenSource = fs.readFileSync(path.join(golden, 'episode/src/registration.tsx'), 'utf8');
const canonicalDir = path.join(root, 'docs/chat-text-story-system/canonical');
const canonicalFile = path.join(canonicalDir, 'video03-approved-props-v2.json');

const frozenOffsetBlock = frozenSource.match(/'Per-Screenshot Y Offset': \{([\s\S]*?)\n  \},\n  'Pause After'/);
if (!frozenOffsetBlock) throw new Error('Cannot read approved Per-Screenshot Y Offset from frozen runtime');
const screenOffsetValues = [...frozenOffsetBlock[1].matchAll(/:\s*(-?\d+),/g)].map((match) => Number(match[1]));
if (screenOffsetValues.length !== state.screenshots.length) throw new Error(`Expected ${state.screenshots.length} frozen screenshot offsets, found ${screenOffsetValues.length}`);
const pauseValues = Object.values(state.props['Pause After']);
const maskValues = Object.values(state.props['Bubble Mask Y']);
const voiceEvents = chat.events.filter((event) => event.type === 'VOICE');
const props = {
  'Normal Gap': state.props['Normal Gap'],
  'Initial Margin': state.props['Initial Margin'],
  'End Margin': state.props['End Margin'],
  'Chat Scale': state.props['Chat Scale'],
  'Chat Vertical Position': state.props['Chat Vertical Position'],
  'Bubble Reveal Duration': 0.17,
  'Screenshot X Offset': state.props['Screenshot X Offset'],
  'Screenshot Y Offset': state.props['Screenshot Y Offset'],
  'Per-Screenshot Y Offset': Object.fromEntries(state.screenshots.map((shot, index) => [shot.filename, screenOffsetValues[index]])),
  'Pause After': Object.fromEntries(voiceEvents.map((event, index) => [event.event_id, pauseValues[index] ?? 0])),
  'Bubble Mask Y': Object.fromEntries(chat.events.map((event, index) => [event.event_id, maskValues[index] ?? event.mask_stop_y])),
};

fs.mkdirSync(canonicalDir, {recursive: true});
fs.writeFileSync(canonicalFile, `${JSON.stringify(props, null, 2)}\n`);
console.log(canonicalFile);
