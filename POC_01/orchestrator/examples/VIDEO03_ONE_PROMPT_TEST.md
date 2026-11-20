# Video 03 — One-Prompt Automation Test

Rebuild Video 03 from the original CapCut draft, original screenshots, gameplay, music and portable SFX. Use the approved script/specification and canonical Props V2. Do not import processed WAV, completed timeline, generated source or an old episode input.

This prompt intentionally records the currently available source inventory but does not fabricate missing reviewed visual geometry. It is the honest end-to-end readiness fixture: the orchestrator must stop at the geometry gate until the approved specification contains the 79 event mappings with `rawTopY` and `maskStopY`.

```one-prompt
{
  "version": 1,
  "episode": {
    "id": "girlfriend03-one-prompt",
    "compositionId": "ChatTextStory-Girlfriend-03-One-Prompt",
    "title": "Tuyển bạn gái — One-Prompt Test",
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "sources": {
    "capcutDraft": "D:/VIDEO CAPCUT/CapCut Drafts/.cloud_cache_7470337191266780161/1027",
    "screenshots": [],
    "gameplay": {"file": "D:/ChatTextStory_AI/video background/2.mp4", "gain": 0.33884415613920255, "loop": true, "objectFit": "cover"},
    "music": {"file": "D:/ChatTextStory_AI/Chứa nhạc nền/background music.MP3", "gain": 0.5011872336272722, "loop": true, "crossfadeSeconds": 0.5},
    "sfxAssets": []
  },
  "creative": {
    "approvedSpec": "docs/chat-text-story-system/VIDEO03_APPROVED_SPEC.md",
    "canonicalProps": "docs/chat-text-story-system/canonical/video03-approved-props-v2.json",
    "script": [{"id": "DISCOVER_FROM_CAPCUT", "text": "Pending generic CapCut script discovery"}],
    "visualEvents": [{"id": "GEOMETRY_REQUIRED", "type": "VOICE", "screenshot": "UNRESOLVED", "rawTopY": null, "maskStopY": null}],
    "geometryStatus": "PROPOSED",
    "sfxCues": [],
    "props": {}
  },
  "render": {"enabled": true, "filename": "video03-one-prompt.mp4", "codec": "h264", "crf": 18},
  "provenance": {
    "approvedInstruction": ["VIDEO03_APPROVED_SPEC.md", "video03-approved-props-v2.json"],
    "inferred": ["source inventory"],
    "humanReviewRequired": ["79 visual event mappings and geometry"]
  }
}
```
