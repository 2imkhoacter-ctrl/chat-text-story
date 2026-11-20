const React = require('react');
const { Composition, registerRoot, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing } = require('remotion');
const { Audio, Video } = require('@remotion/media');
const { getImageDimensions } = require('@remotion/media-utils');
const { Input, UrlSource, MP4 } = require('mediabunny');
const { z } = require('zod');
const { buildPhraseTimeline } = require('./phrase-timeline.cjs');
const V4AAudioTimeline = require('./v4a-audio.jsx');

const calibrationSchema = z.object({
  'Mask Y1': z.number().min(0).max(726),
  'Mask Y2': z.number().min(0).max(726),
  'Mask Y3': z.number().min(0).max(726),
  'Mask Y4': z.number().min(0).max(726),
  'Mask Y5': z.number().min(0).max(726),
  'Normal Gap': z.number().min(0).max(10).step(0.01),
  'Initial Margin': z.number().min(0).max(10).step(0.01),
  'End Margin': z.number().min(0).max(10).step(0.01),
  'Chat Scale': z.number().min(0.1).max(2).step(0.01),
  'Chat Vertical Position': z.number().min(-1920).max(3840),
}).passthrough();

// Preview overrides only: preserve the generated manifest and its source boundaries.
const calibratedManifest = (props) => {
  const { config, manifest } = props;
  if (manifest.timelineModel === 'voice-hold-gap-v1') {
    return buildPhraseTimeline(manifest, {
      initialMargin: props['Initial Margin'], normalGap: props['Normal Gap'],
      pauses: props['Pause After'], maskStops: [1, 2, 3, 4, 5].map((n) => props[`Mask Y${n}`]),
    });
  }
  let offset = props['Initial Margin'] - manifest.initialMarginSeconds;
  const phrases = manifest.phrases.map((phrase, index) => {
    const pauseAfter = index === manifest.phrases.length - 1 ? 0
      : (config.phrases[index].pauseAfterSeconds ?? props['Normal Gap']);
    const calibrated = { ...phrase,
      timelineStart: phrase.timelineStart + offset,
      timelineEnd: phrase.timelineEnd + offset,
      pauseAfter,
      maskStopY: props[`Mask Y${index + 1}`],
    };
    offset += pauseAfter - phrase.pauseAfter;
    return calibrated;
  });
  return { ...manifest, phrases, durationSeconds: phrases.at(-1).timelineEnd };
};

const Story = (props) => {
  const { config, screenshot } = props;
  const manifest = calibratedManifest(props);
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  let maskY = manifest.phrases[0].maskStopY;

  for (let index = 0; index < manifest.phrases.length - 1; index++) {
    const phrase = manifest.phrases[index];
    const nextPhrase = manifest.phrases[index + 1];
    const transitionStart = phrase.transitionStart ?? phrase.timelineEnd;
    const transitionEnd = phrase.transitionEnd ?? (transitionStart + phrase.pauseAfter);
    if (seconds < transitionStart) {
      maskY = phrase.maskStopY;
      break;
    }
    if (seconds < transitionEnd) {
      maskY = interpolate(seconds, [transitionStart, transitionEnd], [phrase.maskStopY, nextPhrase.maskStopY], {
        easing: Easing.inOut(Easing.ease), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      });
      break;
    }
    maskY = nextPhrase.maskStopY;
  }

  const dimensions = props.screenshotDimensions || config.sourceDimensions;
  const reference = props.layoutReference || dimensions;
  const sourceScale = Math.min(width / reference.width, height / reference.height) * props['Chat Scale'];
  // Every image uses the longest image's scale and center, including shorter images.
  // The clip and screenshot stay together in original screenshot coordinates.
  const image = React.createElement('div', {
    style: { position: 'absolute', left: (width - dimensions.width) / 2, top: props['Chat Vertical Position'] - dimensions.height / 2, width: dimensions.width, height: dimensions.height, scale: sourceScale, transformOrigin: 'center center', overflow: 'hidden', clipPath: `inset(0px 0px ${Math.max(0, dimensions.height - maskY)}px 0px)` },
  }, React.createElement(Img, { src: screenshot, style: { width: '100%', height: '100%' } }));
  const PhraseAudioTimeline = props.phraseAudioComponent || V4AAudioTimeline;
  const audios = manifest.timelineModel === 'voice-hold-gap-v1'
    ? [React.createElement(PhraseAudioTimeline, { key: 'v4a-audio', phrases: manifest.phrases })]
    : manifest.phrases.map((phrase, index) => React.createElement(Audio, {
    key: phrase.id,
    name: `${phrase.id} — ${phrase.label}`,
    src: staticFile(phrase.relativeAudioFile),
    from: phrase.timelineStart * fps,
    durationInFrames: phrase.clipDuration * fps,
  }));

  return React.createElement(React.Fragment, null,
    React.createElement('div', { style: { position: 'absolute', inset: 0, background: '#000' } }),
    React.createElement(Video, {
      name: 'Gameplay background', src: staticFile(config.gameplay.replace(/^public\//, '')),
      from: 0, trimBefore: 0, durationInFrames, muted: true,
      style: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
      objectFit: 'cover',
    }),
    image,
    ...audios
  );
};

const V3Root = () => {
  const config = require('../video.config.json');
  const manifest = require('../public/generated-audio/timing-manifest.json');
  return React.createElement(Composition, {
    id: 'ChatTextStory',
    component: Story,
    width: config.width,
    height: config.height,
    fps: config.fps,
    schema: calibrationSchema,
    calculateMetadata: async ({ props }) => {
      const durationInFrames = Math.max(1, Math.ceil((calibratedManifest(props).durationSeconds + props['End Margin']) * props.config.fps));
      const gameplayInput = new Input({ source: new UrlSource(staticFile(props.config.gameplay.replace(/^public\//, ''))), formats: [MP4] });
      try {
        const videoTrack = await gameplayInput.getPrimaryVideoTrack();
        if (!videoTrack) throw new Error('Gameplay must contain a video track.');
        const gameplayDuration = await videoTrack.computeDuration();
        if (gameplayDuration < durationInFrames / props.config.fps) {
          throw new Error(`Gameplay is too short: ${gameplayDuration.toFixed(3)}s available, ${(durationInFrames / props.config.fps).toFixed(3)}s required. Choose a longer gameplay file; looping is not enabled.`);
        }
      } finally {
        gameplayInput.dispose();
      }
      // Optional future image list: dimensions alone choose the tallest reference.
      const sources = [...new Set([props.config.screenshot, ...(props.config.chatScreenshots || [])])];
      const dimensions = await Promise.all(sources.map((src) => getImageDimensions(staticFile(src.replace(/^public\//, '')))));
      const layoutReference = dimensions.reduce((longest, image) => image.height > longest.height ? image : longest);
      return { durationInFrames, props: { ...props, layoutReference, screenshotDimensions: dimensions[0] } };
    },
    durationInFrames: Math.ceil((manifest.durationSeconds + config.endMarginSeconds) * config.fps),
    defaultProps: {
      'Mask Y1': config.maskStops[0].y,
      'Mask Y2': config.maskStops[1].y,
      'Mask Y3': config.maskStops[2].y,
      'Mask Y4': config.maskStops[3].y,
      'Mask Y5': config.maskStops[4].y,
      'Normal Gap': config.defaultPauseAfterSeconds,
      'Initial Margin': config.initialMarginSeconds,
      'End Margin': config.endMarginSeconds,
      'Chat Scale': config.chatScale,
      'Chat Vertical Position': config.chatVerticalPosition,
      config,
      manifest,
      screenshot: staticFile(config.screenshot.replace(/^public\//, '')),
    },
  });
};

const Root = () => {
  const legacy = V3Root();
  const config = { ...require('../video.config.json'), ...require('../video.v4a.config.json') };
  const manifest = require('../public/generated-audio-v4a/timing-manifest.json');
  const pauses = Object.fromEntries(manifest.phrases.map((phrase, index) => [
    `Phrase ${index + 1}`, config.phrasePauses[phrase.id] ?? phrase.pauseAfter ?? 0,
  ]));
  const v4a = React.cloneElement(legacy, {
    id: 'ChatTextStory-V4A',
    schema: calibrationSchema.extend({
      'Pause After': z.object(Object.fromEntries(manifest.phrases.map((_, index) => [
        `Phrase ${index + 1}`, z.number().min(0).max(300).step(0.01),
      ]))),
    }),
    durationInFrames: Math.ceil((manifest.durationSeconds + config.endMarginSeconds) * config.fps),
    defaultProps: { ...legacy.props.defaultProps, config, manifest, 'Pause After': pauses },
  });
  const v4a2 = require('./v4a2-registration.jsx')(legacy, calibrationSchema);
  const v4b = require('./v4b-registration.jsx')();
  const v4c = require('./v4c-registration.jsx')();
  const v4d = require('./v4d-registration.jsx')();
  const v4e = require('./v4e-registration.jsx')();
  const v4f = require('./v4f-registration.jsx')();
  const v4g = require('./v4g-registration.jsx')();
  const freshOriginal = require('./freshcut-original-registration.jsx')();
  const freshRepaired = require('./freshcut-repaired-registration.jsx')();
  const capcut = require('./capcut-registration.jsx')();
  const sfxTest = require('./capcut-registration.jsx')({id:'ChatTextStory-SFX-Test-01',sfxTest:true});
  return React.createElement(React.Fragment, null, legacy, v4a, v4a2, v4b, v4c, v4d, v4e, v4f, v4g, freshOriginal, freshRepaired, capcut, sfxTest);
};

registerRoot(Root);
