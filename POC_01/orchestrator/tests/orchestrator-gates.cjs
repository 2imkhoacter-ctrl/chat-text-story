const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '../..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'one-prompt-gate-'));
const prompt = path.join(tmp, 'prompt.md');
const workspace = path.join(tmp, 'build');
const contract = {
  version: 1,
  episode: {id: 'gate-test', compositionId: 'Gate-Test', title: 'Gate test', width: 1080, height: 1920, fps: 30},
  sources: {capcutDraft: 'missing', screenshots: [], gameplay: {file: 'missing'}, music: {file: 'missing'}, sfxAssets: []},
  creative: {
    script: [{id: 'line-1', text: 'Test'}],
    visualEvents: [{id: 'line-1', type: 'VOICE', screenshot: 'screen-1', rawTopY: null, maskStopY: null}],
    geometryStatus: 'PROPOSED',
    sfxCues: [],
    audio: {trimPolicy: {binSeconds: .01, leadingGuardSeconds: .02, maxTrailingSilenceSeconds: .15}, timeline: {initialMarginSeconds: 0, baseGapSeconds: .15, endMarginSeconds: .15}},
    props: {},
  },
  render: {enabled: false},
};
fs.writeFileSync(prompt, `# Test\n\n\`\`\`one-prompt\n${JSON.stringify(contract, null, 2)}\n\`\`\`\n`);
const result = cp.spawnSync(process.execPath, [path.join(root, 'orchestrator/cli.cjs'), '--prompt', prompt, '--workspace', workspace], {encoding: 'utf8'});
assert.notEqual(result.status, 0);
const report = JSON.parse(fs.readFileSync(path.join(workspace, 'audit/one-prompt-report.json')));
assert.equal(report.status, 'FAIL');
assert.match(report.error, /Geometry review required/);
assert(!fs.existsSync(path.join(workspace, 'episode-input.generated.json')));
console.log(JSON.stringify({status: 'PASS', test: 'unverified geometry blocks before input generation'}));
