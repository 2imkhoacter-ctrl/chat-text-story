# Master Build Prompt

Build a new ChatTextStory episode from the completed `EPISODE_INPUT_TEMPLATE.md`. Before changing files, read `SYSTEM_RULES.md`, `SFX_CATALOG.md`, `SKILL_REGISTRY.md`, and the target episode's approved/input configuration. Treat episode-specific Video 03 choices as examples, not global defaults.

Required workflow: inventory inputs → protect/export current Props → map script/screens/audio → extract per-clip CapCut speed and volume → process speed once → conservative speech-boundary trim → construct timeline from actual durations and explicit gaps → place visuals → apply semantic SFX triggers → add gameplay/music → validate hashes/counts/frame timing/composition → request manual audiovisual approval.

Never regenerate TTS, run Whisper, normalize gain, apply playback speed twice, invent missing assets, rebuild shared engine, or render a full MP4 unless the episode request explicitly authorizes it. Stop if Props or sources cannot be captured safely.

Deliver the validation report and list any checks requiring human ears/eyes.
