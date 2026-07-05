# Mobile Smoke Test (1 Minute)

Use this checklist before push/deploy to catch mobile layout and playback regressions fast.

## Devices

- iPhone Safari (portrait + landscape)
- Android Chrome (portrait + landscape)

## Steps

1. Open app on phone.
Expected: edge-to-edge fit, no white side margins.

2. Swipe left/right on each tab (`Library`, `Lesson`, `Settings`, `Profile`).
Expected: no horizontal scroll.

3. Open and close sidebar/drawer.
Expected: no leftover gap; width stays stable.

4. Go to `Lesson`, tap `Play`, then `Next`/`Previous`.
Expected: audio, active sentence, and red highlight always match.

5. Scroll while audio is playing.
Expected: active sentence remains visible; no left/right clipping.

6. Long-press a sentence and check actions (`Cancel`, `Clear`, `All`, `Save`).
Expected: action row stays inside viewport; no overflow.

7. Use bottom nav while audio is active.
Expected: nav is visible and not cut; playback state remains consistent.

8. Rotate portrait -> landscape -> portrait.
Expected: layout reflows correctly; still no horizontal scroll.

## Quick Pass/Fail

- Pass: all checks above succeed on both iPhone and Android.
- Fail: any side-scroll, clipping, cut-off control, or text/audio highlight mismatch.
