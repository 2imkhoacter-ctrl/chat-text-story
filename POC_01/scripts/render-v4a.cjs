const path = require('node:path');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const { segmentV4A } = require('./segment-v4a.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  const manifest = segmentV4A();
  const config = { ...require('../video.config.json'), ...require('../video.v4a.config.json') };
  const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.jsx') });
  const inputProps = { config, manifest };
  const composition = await selectComposition({ serveUrl, id: 'ChatTextStory-V4A', inputProps });
  await renderMedia({ composition, serveUrl, inputProps, codec: 'h264', audioCodec: 'aac',
    pixelFormat: 'yuv420p', outputLocation: path.resolve(root, config.outputVideo) });
})().catch((error) => { console.error(error); process.exitCode = 1; });
