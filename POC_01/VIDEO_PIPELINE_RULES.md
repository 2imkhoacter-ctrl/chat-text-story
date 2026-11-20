# Reusable Video Pipeline Rules

## Rules for every episode

1. Export the actual Remotion Studio Inspector JSON before changing source. Never reconstruct user adjustments from defaults.
2. Validate the JSON against episode-specific keys and expected collection counts before accepting it.
3. Preserve the raw export byte-for-byte as both an approved preset and a timestamped immutable copy. Back up the previous approved preset before replacement.
4. Open Studio and render with the same explicit `--props` JSON. Do not rely on temporary browser/Studio state.
5. Keep timing, media mapping and visual calibration separate. A visual offset must not silently change WAV or SFX timing.
6. Use stable asset or scene identifiers. Do not bind manual adjustments to temporary array positions.
7. Put related screenshot content, masks, crops and overlays in one coordinate system so an offset is applied exactly once.
8. Hash approved presets, source/configuration files and essential media. Record counts and paths without copying the whole project.
9. Validate default/baseline identity, edited-prop behavior, media counts, composition metadata and protected event anchors.
10. Never mark manual listening, visual review or final render as approved unless those checks were actually performed.

## Audio policy

- TTS/VOICE remains at its approved level unless the episode specification explicitly says otherwise.
- Gameplay, background music and SFX use independent gains. Never reuse one track's attenuation on another track.
- Gameplay loop and mute state must be explicit.
- Tail-triggered SFX stays anchored to the detected voice tail when downstream pauses change.

## Preset lifecycle

- `approved-props.json` is the active restore point.
- Timestamped copies are immutable history.
- Before replacement, create a timestamped backup of the current approved preset.
- After replacement, parse the saved JSON again and compare its SHA-256 with the source export.
- Keep Studio and render commands in the episode package scripts, both pointing to the same preset.

## Episode-specific data

Per-screen offsets, bubble masks, phrase pauses, asset filenames, timing anchors and SFX cues belong in each episode's master specification and manifest. They are not reusable defaults for another episode.

## Unverified values

Record unknown codec, bitrate, concurrency, hardware acceleration, subjective listening approval and final-render status as unverified. Do not infer them from another episode.
