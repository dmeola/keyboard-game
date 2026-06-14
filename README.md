# ⌨️ KeyJr — Learn Letters & Numbers

> **"Keyboard Junior"** — A multisensory keyboard-learning site for children ages 2–6.

Press any key. Hear its letter name and phoneme sound. See a colorful keyword image. Watch Pip the owl react with delight!

---

## Screenshot

<!-- TODO: Add screenshot here -->
*Screenshot placeholder — add a screenshot of the home page and play page here.*

---

## Target Audience

- **Explorer Mode (ages 2–4):** Press any key → immediate multisensory response. No wrong answers. Pip celebrates every press.
- **Quest Mode (ages 4–6):** Pip asks "Can you find the A?" Child must press the correct key. Gentle hints, big celebrations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | Framer Motion |
| Text-to-Speech | Web Speech API |
| Sound Effects | Web Audio API (synthesized, no files needed) |
| Camera Filters | MediaPipe Face Landmarker + Canvas 2D |
| State | React Context + `localStorage` |
| Hosting | Vercel |
| DNS | Cloudflare → `keyjr.com` |

---

## Features

- 🔤 **A–Z letter recognition** with word associations (A = Apple, B = Balloon…)
- 🔢 **0–9 number learning** with counted object animations
- 🦉 **Pip the owl mascot** — reacts specifically to each key with expressions and speech
- 🎵 **Web Audio sound effects** — key press tones, celebration arpeggios, wiggle sounds
- 📷 **AR camera filter** (optional) — letter-themed face overlays using MediaPipe
- ⌨️ **On-screen keyboard** with mastery heatmap
- 📱 **Mobile touch keyboard** — colorful tap grid for phones/tablets
- 🏆 **Mastery tracking** via `localStorage` — 4 mastery levels per key
- 🕺 **Wiggle breaks** every 8 key presses
- ♿ **WCAG AA accessibility** — `aria-live`, proper labels, sufficient contrast
- 📲 **PWA installable** — manifest + theme color

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & run

```bash
git clone https://github.com/YOUR_USERNAME/keyboard-game.git
cd keyboard-game
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

---

## Domain

**`keyjr.com`** — registered on Namecheap, DNS managed by Cloudflare, hosted on Vercel.

---

## Project Structure

```
keyboard-game/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata, PWA
│   ├── page.tsx            # Home / mode selector
│   ├── play/page.tsx       # Main learning experience
│   └── settings/page.tsx   # Parent settings & mastery dashboard
├── components/
│   ├── GuideCharacter/     # Pip the owl SVG mascot
│   ├── KeyDisplay/         # Big animated letter/number display
│   ├── KeyboardVisual/     # On-screen keyboard with highlights
│   ├── LetterImage/        # Keyword image (A = apple)
│   ├── NumberDisplay/      # Counted object animation
│   ├── CameraFilter/       # AR face overlay (optional)
│   └── SessionTimer/       # Progress bar + wiggle breaks
├── lib/
│   ├── letterData.ts       # A–Z with word, emoji, phoneme, color
│   ├── numberData.ts       # 0–9 with objects and colors
│   ├── speechUtils.ts      # Web Speech API helpers
│   ├── audioUtils.ts       # Web Audio API sound effects
│   ├── sessionStore.ts     # localStorage mastery tracking
│   └── gameContext.tsx     # React context for game state
└── public/
    └── manifest.json       # PWA manifest
```

---

## License

MIT
