# KeyJr — Learn Letters & Numbers

> **"Keyboard Junior"** — A multisensory keyboard-learning site for children ages 2–6.

Press any key. Hear its letter name and phoneme sound. See a colorful keyword image. Watch Pip the owl react with delight!

Live at **[keyjr.com](https://keyjr.com)**

---

## Target Audience

- **Explorer Mode (ages 2–4):** Press any key → immediate multisensory response. No wrong answers. Pip celebrates every press.
- **Quest Mode (ages 4–6):** Pip asks "Can you find the A?" Child must press the correct key. Gentle hints and big celebrations. Quests favor less-practiced letters to build balanced mastery.

---

## Features

- **A–Z letter recognition** with word associations (A = Apple, B = Balloon…), phoneme sounds, and animated emoji
- **0–9 number learning** with staggered counting animations and fun facts
- **Pip the owl mascot** — reacts to each key with unique expressions (`idle`, `happy`, `excited`, `curious`, `nudge`, `celebrate`) and personalized speech bubble messages
- **Pre-recorded audio** — natural-sounding MP3s (Samantha voice) for every letter, number, and welcome message; Web Speech API fallback when audio files are unavailable
- **Web Audio sound effects** — synthesized key-press tones and quest celebration arpeggios
- **AR camera filters** (optional) — 26 letter-themed face overlays using MediaPipe Face Landmarker (A = apple ears, B = balloons, C = cat ears…)
- **On-screen keyboard** (desktop) — QWERTY layout with per-key mastery heatmap dots
- **Touch keyboard** (mobile) — colorful A–Z + 0–9 tap grid
- **Mastery tracking** via `localStorage` — 4 levels per key: New (0) → Learning (1–2×) → Practiced (3–5×) → Mastered (6+×)
- **Session progress** — star bar (1 star per 5 key presses, up to 3 stars)
- **Focus mode** — parent setting that auto-enters fullscreen on first key press and hides navigation; announces when exited
- **Parent corner** (`/settings`) — mastery heatmap, per-key progress, default mode selector, focus mode toggle, reset progress
- **WCAG AA accessibility** — `aria-live` regions, skip link, proper labels, sufficient contrast
- **PWA installable** — web app manifest + theme color

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | Framer Motion |
| Audio | Pre-recorded MP3s + Web Speech API fallback |
| Sound Effects | Web Audio API (synthesized oscillators) |
| Camera Filters | MediaPipe Face Landmarker + Canvas 2D |
| State | React Context + `localStorage` |
| Hosting | Vercel |
| DNS | Cloudflare → `keyjr.com` |

No database, authentication, or API routes — entirely client-side.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & run

```bash
git clone https://github.com/danfeldman90/keyjr.git
cd keyjr
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Audio:** Letter and number audio files are pre-generated and committed to `public/audio/`. If you need to regenerate them (macOS only):
> ```bash
> bash scripts/generate-audio.sh
> ```
> This requires `ffmpeg` and uses the macOS `say` command with the Samantha voice.

### Build for production

```bash
npm run build
npm start
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide covering:

1. Connecting the GitHub repo to Vercel
2. Adding `keyjr.com` as a custom domain
3. Configuring Cloudflare DNS (CNAME records)
4. Updating Namecheap nameservers to Cloudflare

### Quick deploy

```bash
git push origin main
# Vercel auto-deploys from main → https://keyjr.com
```

No environment variables are required.

---

## Domain

**`keyjr.com`** — registered on Namecheap, DNS managed by Cloudflare, hosted on Vercel.

---

## Project Structure

```
keyjr/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata, GameProvider
│   ├── page.tsx            # Home / mode selector
│   ├── play/page.tsx       # Main learning experience
│   └── settings/page.tsx   # Parent corner — mastery & settings
├── components/
│   ├── GuideCharacter/     # Pip the owl SVG mascot + expressions
│   ├── KeyDisplay/         # Big animated letter/number display
│   ├── KeyboardVisual/     # On-screen QWERTY with mastery heatmap
│   ├── LetterImage/        # Keyword emoji + floating related emojis
│   ├── NumberDisplay/      # Staggered counting animation + fun facts
│   ├── CameraFilter/       # AR face filters (26 letter overlays)
│   └── SessionTimer/       # Star progress bar (5 presses per star)
├── lib/
│   ├── letterData.ts       # A–Z: word, emoji, phoneme, color, filter theme
│   ├── numberData.ts       # 0–9: objects, colors, fun facts
│   ├── speechUtils.ts      # MP3 playback + Web Speech API fallback
│   ├── audioUtils.ts       # Web Audio API sound effects
│   ├── sessionStore.ts     # localStorage mastery tracking
│   └── gameContext.tsx     # React context for shared game state
├── public/
│   ├── audio/              # Pre-recorded MP3s for letters, numbers, welcome
│   └── manifest.json       # PWA manifest
└── scripts/
    └── generate-audio.sh   # macOS: regenerate audio files via `say` + ffmpeg
```

---

## License

MIT
