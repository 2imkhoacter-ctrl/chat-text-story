const path = require('node:path');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const { segment } = require('./segment-audio.cjs');

const root = path.resolve(__dirname, '..');
const config = require('../video.config.json');

(async () => {
  const manifest = segment(config);
  const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.jsx') });
  const inputProps = { config, manifest };
  const composition = await selectComposition({ serveUrl, id: 'ChatTextStory', inputProps });
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    audioCodec: 'aac',
    outputLocation: path.resolve(root, config.outputVideo),
    inputProps,
    pixelFormat: 'yuv420p',
  });
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
