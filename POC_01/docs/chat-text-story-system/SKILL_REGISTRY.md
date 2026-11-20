# Skill Registry

## Remotion

Project skills live under `.agents/skills/remotion-*`; use the router `.agents/skills/remotion-best-practices/SKILL.md`. Relevant capabilities include Studio preview, multimedia, markup, captions and rendering. Rendering is not implied by validation.

## Zoom

No standalone project “Zoom skill” file was found. The preserved, working implementation is embedded in `episodes/gym02/src/capcut-registration.jsx` as `PinOverlay`, documented by `episodes/gym02/EPISODE02_MASTER_SPEC.md` and `data/gym02-master-manifest.json`. It crops the pin rectangle, starts after 0.3s (frame 9 at 30fps), interpolates scale 1.0→1.3 through the remaining one-second PIN event with cubic in/out easing, and does not persist. It shares the screenshot transform.

Status: source is intact and usable as an optional reference, but it is episode-local and not connected as a reusable engine module. Do not claim a restored standalone skill and do not enable it in Video 03. A future episode must explicitly define the target region and parameters before adapting it.
