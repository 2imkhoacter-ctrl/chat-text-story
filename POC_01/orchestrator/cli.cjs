#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cp = require('child_process');
const net = require('net');
const http = require('http');

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => {const index = args.indexOf(name); return index < 0 ? null : args[index + 1];};
const promptFile = flag('--prompt');
const workspaceArg = flag('--workspace');
const noRender = args.includes('--no-render');
const renderRequested = args.includes('--render');
const noStudio = args.includes('--no-studio');
const studioPortArg = flag('--studio-port');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const writeJson = (file, value) => {fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);};

function parsePrompt(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/```one-prompt\s*([\s\S]*?)```/i);
  if (!match) throw new Error('Prompt must contain one ```one-prompt ... ``` build contract block');
  return {text, contract: JSON.parse(match[1])};
}

function validateContract(contract) {
  const missing = [];
  for (const key of ['version', 'episode', 'sources', 'creative', 'render']) if (!Object.hasOwn(contract, key)) missing.push(key);
  if (contract.version !== 1) missing.push('version=1');
  for (const key of ['id', 'compositionId', 'title', 'width', 'height', 'fps']) if (!Object.hasOwn(contract.episode || {}, key)) missing.push(`episode.${key}`);
  for (const key of ['capcutDraft', 'screenshots', 'gameplay', 'music', 'sfxAssets']) if (!Object.hasOwn(contract.sources || {}, key)) missing.push(`sources.${key}`);
  for (const key of ['script', 'visualEvents', 'sfxCues', 'audio', 'props']) if (!Object.hasOwn(contract.creative || {}, key)) missing.push(`creative.${key}`);
  if (missing.length) throw new Error(`Incomplete one-prompt contract: ${missing.join(', ')}`);
  if (!Array.isArray(contract.creative.script) || !contract.creative.script.length) throw new Error('creative.script must contain ordered dialogue lines');
  if (!Array.isArray(contract.creative.visualEvents) || !contract.creative.visualEvents.length) throw new Error('creative.visualEvents requires reviewed/proposed geometry');
  const unresolved = contract.creative.visualEvents.filter((event) => !Number.isFinite(event.rawTopY) || !Number.isFinite(event.maskStopY));
  if (unresolved.length) throw new Error(`Geometry review required for events: ${unresolved.map((event) => event.id).join(', ')}`);
  if (contract.creative.geometryStatus !== 'APPROVED' && contract.creative.geometryStatus !== 'VERIFIED') throw new Error('Geometry must be APPROVED or VERIFIED before build/render');
}

function resolveSource(promptDir, value) {
  return path.isAbsolute(value) ? value : path.resolve(promptDir, value);
}

function generateInput(contract, promptDir, workspace) {
  const screenshots = contract.sources.screenshots.map((shot) => ({...shot, file: resolveSource(promptDir, shot.file)}));
  const screenshotIds = new Set(screenshots.map((shot) => shot.id));
  const scriptById = new Map(contract.creative.script.map((line) => [line.id, line]));
  const events = contract.creative.visualEvents.map((event) => {
    if (!screenshotIds.has(event.screenshot)) throw new Error(`Unknown screenshot ${event.screenshot} in ${event.id}`);
    if (event.type === 'VOICE') {
      const line = scriptById.get(event.id);
      if (!line) throw new Error(`No script line for voice event ${event.id}`);
      return {...event, clipId: line.clipId || line.id, text: line.spokenText || line.text, pauseAfterSeconds: line.pauseAfterSeconds || 0, ...(line.ttsSegmentIds ? {ttsSegmentIds: line.ttsSegmentIds} : {})};
    }
    return event;
  });
  const approved = {...contract.creative.props};
  const normalGap = approved['Normal Gap'] ?? contract.creative.audio?.timeline?.baseGapSeconds ?? 0.15;
  approved['Normal Gap'] = normalGap;
  const defaults = {...(contract.creative.defaultProps || approved), 'Normal Gap': (contract.creative.defaultProps || {})['Normal Gap'] ?? normalGap};
  const audio = {...contract.creative.audio, timeline: {...contract.creative.audio.timeline, baseGapSeconds: contract.creative.audio.timeline?.baseGapSeconds ?? normalGap}};
  return {
    version: 1,
    episode: contract.episode,
    capcut: {draftDirectory: resolveSource(promptDir, contract.sources.capcutDraft)},
    audio,
    visuals: {
      layoutReference: contract.creative.layoutReference || screenshots[0],
      bubbleRevealDurationSeconds: contract.creative.props['Bubble Reveal Duration'],
      screenshots,
      events,
    },
    background: {
      gameplay: {...contract.sources.gameplay, file: resolveSource(promptDir, contract.sources.gameplay.file)},
      music: {...contract.sources.music, file: resolveSource(promptDir, contract.sources.music.file)},
    },
    sfx: {
      assets: contract.sources.sfxAssets.map((asset) => ({...asset, file: resolveSource(promptDir, asset.file)})),
      cues: contract.creative.sfxCues,
    },
    zoomEvents: contract.creative.zoomEvents || [],
    props: {defaults, approved, authorityNote: contract.creative.authorityNote || 'Generated from one-prompt approved contract'},
    output: {directory: workspace},
  };
}

function portIsFree(port) {return new Promise((resolve) => {const server = net.createServer(); server.unref(); server.once('error', () => resolve(false)); server.listen({host: '127.0.0.1', port}, () => server.close(() => resolve(true)));});}
async function chooseStudioPort(preferred) {for (let port = preferred || 3000; port < (preferred || 3000) + 100; port++) if (await portIsFree(port)) return port; throw new Error('No free Remotion Studio port found in the requested range');}
function waitForStudio(port, timeoutMs = 20000) {const started = Date.now(); return new Promise((resolve, reject) => {const probe = () => {const request = http.get({host: '127.0.0.1', port, path: '/', agent: false}, (response) => {response.destroy();request.destroy();resolve();}); request.on('error', () => {if (Date.now() - started >= timeoutMs) reject(new Error(`Remotion Studio did not become ready on port ${port}`)); else setTimeout(probe, 250);}); request.setTimeout(1000, () => request.destroy());}; probe();});}
async function startStudio(workspace, compositionId, preferredPort) {const port = await chooseStudioPort(preferredPort); const remotionCli = path.join(projectRoot, 'node_modules/@remotion/cli/remotion-cli.js'); const stdout = fs.openSync(path.join(workspace, 'audit/studio.stdout.log'), 'a'); const stderr = fs.openSync(path.join(workspace, 'audit/studio.stderr.log'), 'a'); const child = cp.spawn(process.execPath, [remotionCli, 'studio', 'src/index.tsx', `--port=${port}`, '--no-open'], {cwd: workspace, detached: true, windowsHide: true, stdio: ['ignore', stdout, stderr]}); fs.closeSync(stdout); fs.closeSync(stderr); child.unref(); await waitForStudio(port); return {pid: child.pid, port, url: `http://localhost:${port}/${compositionId}`, entrypoint: path.join(workspace, 'src/index.tsx')};}

function run(command, commandArgs, options = {}) {
  const result = cp.spawnSync(command, commandArgs, {cwd: options.cwd || projectRoot, encoding: 'utf8', stdio: options.capture ? 'pipe' : 'inherit'});
  if (result.status !== 0) throw new Error(`${options.label || command} failed with exit ${result.status}${result.stderr ? `\n${result.stderr}` : ''}`);
  return result.stdout || '';
}

async function main() {
  if (!promptFile || !workspaceArg) throw new Error('Usage: node orchestrator/cli.cjs --prompt <prompt.md> --workspace <new-directory> [--no-render] [--no-studio] [--studio-port <port>]');
  const absolutePrompt = path.resolve(promptFile);
  const workspace = path.resolve(workspaceArg);
  if (fs.existsSync(workspace)) throw new Error(`Clean workspace required; target already exists: ${workspace}`);
  fs.mkdirSync(path.join(workspace, 'audit'), {recursive: true});
  const stages = [];
  const stage = (name, fn) => {const started = Date.now(); try {const value = fn(); stages.push({name, status: 'PASS', milliseconds: Date.now() - started}); return value;} catch (error) {stages.push({name, status: 'FAIL', milliseconds: Date.now() - started, error: error.message}); throw error;}};
  let parsed;
  try {
    stage('system-documents', () => ['MASTER_BUILD_PROMPT.md', 'SYSTEM_RULES.md', 'SFX_CATALOG.json', 'SKILL_REGISTRY.md', 'episode-input.schema.json'].forEach((name) => {
      const file = name === 'episode-input.schema.json' ? path.join(projectRoot, 'engine', name) : path.join(projectRoot, 'docs/chat-text-story-system', name);
      if (!fs.existsSync(file)) throw new Error(`Missing system document ${file}`);
    }));
    parsed = stage('prompt-parse', () => parsePrompt(absolutePrompt));
    stage('contract-validation', () => validateContract(parsed.contract));
    const input = stage('input-generation', () => generateInput(parsed.contract, path.dirname(absolutePrompt), workspace));
    const inputFile = path.join(workspace, 'episode-input.generated.json');
    writeJson(inputFile, input);
    stage('input-validation', () => run(process.execPath, ['-e', `require(${JSON.stringify(path.join(projectRoot, 'engine/lib/input.cjs'))}).loadInput(${JSON.stringify(inputFile)})`], {capture: true, label: 'input validation'}));
    stage('generic-engine-build', () => run(process.execPath, [path.join(projectRoot, 'engine/cli.cjs'), 'build', '--input', inputFile, '--output', workspace], {label: 'Generic Engine build'}));
    let mp4 = null;
    if (parsed.contract.render.enabled && renderRequested && !noRender) {
      mp4 = path.join(workspace, 'output', parsed.contract.render.filename || `${parsed.contract.episode.id}.mp4`);
      fs.mkdirSync(path.dirname(mp4), {recursive: true});
      const remotion = path.join(projectRoot, 'node_modules/.bin/remotion.cmd');
      stage('render-mp4', () => run(remotion, ['render', 'src/index.tsx', parsed.contract.episode.compositionId, mp4, `--codec=${parsed.contract.render.codec || 'h264'}`, `--crf=${parsed.contract.render.crf ?? 18}`], {cwd: workspace, label: 'Remotion render'}));
    }
    stage('final-validation', () => {
      const pipelineReport = path.join(workspace, 'audit/pipeline-report.json');
      if (!fs.existsSync(pipelineReport)) throw new Error('Generic Engine pipeline report is missing');
      const pipeline = JSON.parse(fs.readFileSync(pipelineReport, 'utf8'));
      if (pipeline.status !== 'PASS') throw new Error('Generic Engine pipeline validation did not PASS');
      if (mp4 && (!fs.existsSync(mp4) || fs.statSync(mp4).size === 0)) throw new Error('Rendered MP4 is missing or empty');
    });
    let studio = null;
    if (!noStudio) studio = await startStudio(workspace, parsed.contract.episode.compositionId, studioPortArg ? Number(studioPortArg) : null);
    const report = {status: 'PASS', prompt: absolutePrompt, promptSha256: sha256(absolutePrompt), generatedInput: inputFile, generatedInputSha256: sha256(inputFile), workspace, mp4, mp4Sha256: mp4 ? sha256(mp4) : null, renderPolicy: mp4 ? 'explicit --render' : 'SKIPPED_BY_V2_DEFAULT', studio, provenance: parsed.contract.provenance || {}, stages};
    writeJson(path.join(workspace, 'audit/one-prompt-report.json'), report);
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const report = {status: 'FAIL', prompt: path.resolve(promptFile), workspace, error: error.message, stages};
    writeJson(path.join(workspace, 'audit/one-prompt-report.json'), report);
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports={parsePrompt,validateContract,generateInput,chooseStudioPort,waitForStudio,startStudio};
