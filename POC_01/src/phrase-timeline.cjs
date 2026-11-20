// V4A only: voice duration, silent hold, and mask transition are separate.
const round = (value) => Number(value.toFixed(9));

const buildPhraseTimeline = (manifest, { initialMargin, normalGap, pauses = {}, maskStops = [] }) => {
  let cursor = initialMargin;
  const phrases = manifest.phrases.map((phrase, index) => {
    const pauseAfter = pauses[`Phrase ${index + 1}`] ?? phrase.pauseAfter ?? 0;
    if (!Number.isFinite(pauseAfter) || pauseAfter < 0) throw new Error(`Invalid Pause After for ${phrase.id}`);
    const timelineStart = round(cursor);
    const timelineEnd = round(timelineStart + phrase.clipDuration);
    const holdEnd = round(timelineEnd + pauseAfter);
    const transitionStart = holdEnd;
    const transitionEnd = round(holdEnd + (index < manifest.phrases.length - 1 ? normalGap : 0));
    cursor = transitionEnd;
    return { ...phrase, timelineStart, timelineEnd, pauseAfter, holdEnd,
      transitionStart, transitionEnd,
      // No invented coordinates beyond the current visual test: hold the last Y.
      maskStopY: maskStops[Math.min(index, maskStops.length - 1)] ?? phrase.maskStopY,
    };
  });
  return { ...manifest, phrases, durationSeconds: round(cursor) };
};

module.exports = { buildPhraseTimeline };
