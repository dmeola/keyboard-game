# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

> **Next.js version note:** This project uses Next.js 16, which has breaking changes from prior versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js-specific code.

---

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

No tests are configured. No environment variables are required.

To regenerate the pre-recorded audio files (macOS only, requires `ffmpeg`):
```bash
bash scripts/generate-audio.sh
```

## What this project is

**KeyJr** is a fully client-side educational web app teaching children ages 2–6 the letters A–Z and numbers 0–9 through keyboard/touch interaction. No API routes, no server actions, no database, no auth. All state lives in React Context + `localStorage`.

## Architecture

Three routes:
- `/` — mode selector (Explorer / Quest / Spell)
- `/play?mode=explorer|quest|spell` — the core learning experience
- `/settings` — parent corner

### Core data flow

1. Child presses a key → `play/page.tsx` handles `keydown` event
2. State updates in `GameContext` (`activeKey`, `activeEntry`, `keyType`, `pressCount`, `mode`)
3. Components react: `KeyDisplay` shows the letter, `LetterImage`/`NumberDisplay` animate, `GuideCharacter` (Pip) picks an expression + speech bubble message
4. `speechUtils.ts` plays the MP3 from `public/audio/`; falls back to Web Speech API if the file fails
5. `audioUtils.ts` plays a synthesized sound effect via Web Audio API
6. `sessionStore.ts` increments the press count in `localStorage` (key: `"keyjr_session"`)

### Audio strategy

Pre-recorded MP3s in `public/audio/` are primary. `speechUtils.ts` falls back to the Web Speech API only when an MP3 fails. Do not swap these out or replace one with the other.

- Explorer: `letter-a.mp3` … `letter-z.mp3`, `number-0.mp3` … `number-9.mp3`, `welcome.mp3`
- Quest / Spell prompts: `name-a.mp3` … (letter name only), `quest-a.mp3` …, `spell-<word>.mp3` / `spelled-<word>.mp3` (one per word in `lib/wordData.ts`), `yes.mp3`, `try-again.mp3`, `look-for.mp3`

Clips are played through `playClips()`, which chains clips and stops whatever was playing before, so key presses never talk over each other. After adding a word to `wordData.ts`, re-run `scripts/generate-audio.sh` to create its clips.

### Game modes

| Mode | Ages | Mechanic |
|------|------|----------|
| Explorer | 2–4 | Every key press celebrated; no wrong answers |
| Quest | 4–6 | Pip names a target key; correct = confetti; wrong = gentle hint from Pip |
| Spell | 4–6 | Pip gives a word; child types it letter by letter |

Quest target selection is weighted toward less-practiced keys via mastery levels in `sessionStore.ts`.

### Mastery levels (`sessionStore.ts`)

- `0` = unseen, `1` = 1–2 presses, `2` = 3–5 presses, `3` = 6+ presses
- Drive the parent dashboard heatmap colors
- Quest picks targets from the letters found least often in Quest (`questFound`, via `recordQuestFound`), then fewest presses

### Pip the owl (`GuideCharacter/`)

Expressions: `idle | happy | excited | curious | nudge | celebrate`. Per-key speech bubble messages live in `LETTER_MESSAGES` and `NUMBER_MESSAGES` inside the component. Keep Pip's tone warm, encouraging, and child-friendly.

### AR filters (`CameraFilter/`)

One file per letter: `filters/appleFilter.ts` … `filters/zebraFilter.ts`, each exporting `drawXFilter(ctx, m: FaceMetrics)`. `filterRenderer.ts` maps letter → draw function. MediaPipe loads from CDN via `useFaceFilter.ts`; `CameraFilter.tsx` runs a single loop that detects, smooths (`createFaceSmoother`) and draws.

Rules for filters:
- Draw in the upright face frame: the renderer has already moved the origin to the face centre, rotated for head tilt and applied the pop-in scale. Anchor features to `m.nose`, `m.mouth`, `m.leftEye`, `m.rightEye` and the helpers in `filters/shared.ts` (`headTop`, `chinY`, `fillWithFaceHole`, …).
- Size everything in `m.u` (1/100 of face width) — no fixed pixel sizes.
- Never cover the child's eyes, nose or mouth with an opaque shape; use hats/ears above the head, things beside it, frames with a face hole, or tints at ≤ 0.25 alpha.
- Never use `destination-out` compositing — it erases the camera image.

## Styling

Tailwind CSS v4. Custom child-friendly color tokens defined in `app/globals.css`: `coral`, `sunny`, `sky`, `grass`, `purple`, `orange`. Use these tokens instead of arbitrary hex values.

Framer Motion is used throughout for animations. Always respect `prefers-reduced-motion` — follow the pattern already established in `globals.css` for any new animated components.

## What does NOT exist (don't add without being asked)

- Backend / API routes / server actions
- User accounts or cloud sync
- Environment variables
- Wiggle breaks (removed; ignore any old references)
