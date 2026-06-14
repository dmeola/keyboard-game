<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# KeyJr — Agent Context

## What this project is

**KeyJr** ("Keyboard Junior") is a multisensory educational web app at [keyjr.com](https://keyjr.com) that teaches children ages 2–6 the letters A–Z and numbers 0–9 through keyboard (and touch) interaction. The app is **entirely client-side** — no API routes, no server actions, no database, no authentication.

## Architecture

```
app/                    # Next.js App Router pages (3 routes)
  page.tsx              # / — mode selector (Explorer / Quest)
  play/page.tsx         # /play?mode=explorer|quest — the learning experience
  settings/page.tsx     # /settings — parent corner

components/             # Feature components, one folder per component
  GuideCharacter/       # Pip the owl SVG mascot with expressions + speech bubble
  KeyDisplay/           # Large animated letter/number display
  KeyboardVisual/       # Desktop QWERTY with mastery heatmap dots
  LetterImage/          # Keyword emoji with floating related emojis
  NumberDisplay/        # Counted object animation + fun facts
  CameraFilter/         # Optional AR face filters (MediaPipe)
  SessionTimer/         # Star progress bar (5 presses per star, max 3)

lib/
  gameContext.tsx       # React Context — activeKey, activeEntry, keyType, pressCount, mode
  letterData.ts         # A–Z static data: word, emoji, phoneme, color, filter theme
  numberData.ts         # 0–9 static data: objects, colors, fun facts
  speechUtils.ts        # Audio playback (MP3 primary, Web Speech API fallback)
  audioUtils.ts         # Web Audio API sound effects (synthesized oscillators)
  sessionStore.ts       # localStorage mastery tracking (key: "keyjr_session")
  types.ts              # LetterEntry, NumberEntry types
```

## Key design decisions

- **No server code.** All data is static TypeScript. All state is React Context + `localStorage`. Never add API routes or `"use server"` unless there is a compelling reason and the user explicitly requests it.
- **Audio strategy.** Pre-recorded MP3s in `public/audio/` are the primary speech source (`/audio/letter-a.mp3` … `letter-z.mp3`, `number-0.mp3` … `number-9.mp3`, `welcome.mp3`). `speechUtils.ts` falls back to the Web Speech API only when an MP3 fails to play (e.g. files not generated locally). Do not replace one with the other.
- **Mastery levels** (in `sessionStore.ts`): `0` = unseen, `1` = 1–2 presses, `2` = 3–5 presses, `3` = 6+ presses. These map to heatmap colors in the parent dashboard and quest target weighting.
- **Pip the owl** (`GuideCharacter`). Expressions: `idle | happy | excited | curious | nudge | celebrate`. Per-key messages are defined in `LETTER_MESSAGES` and `NUMBER_MESSAGES` inside the component. Keep Pip's personality consistent — warm, encouraging, child-friendly.
- **AR filters** (`CameraFilter/`). One filter file per letter (`filters/a.ts` … `filters/z.ts`). Each exports a `draw(ctx, landmarks, …)` function. `filterRenderer.ts` maps letter → draw function. `useFaceFilter.ts` loads MediaPipe from CDN and manages camera lifecycle.
- **Styling.** Tailwind CSS v4 with a custom child-friendly palette defined in `app/globals.css`: `coral`, `sunny`, `sky`, `grass`, `purple`, `orange`. Use these tokens rather than arbitrary hex values.
- **Animations.** Framer Motion throughout. Respect `prefers-reduced-motion` — check `globals.css` for the existing reduced-motion rules and follow the same pattern in new components.
- **Accessibility.** `aria-live` regions for key announcements, skip link, sufficient contrast. Maintain WCAG AA compliance on any new UI.

## Game modes

| Mode | Ages | Behavior |
|------|------|----------|
| Explorer | 2–4 | Free exploration — every key press is celebrated, no wrong answers |
| Quest | 4–6 | Pip picks a target key (favoring less-practiced ones); correct = confetti + celebration sound; wrong = gentle hint |

## What does NOT exist (don't add without being asked)

- Wiggle breaks (referenced in old docs — not implemented)
- Backend / API routes
- User accounts or cloud sync
- Environment variables (none required)
