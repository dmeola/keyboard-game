'use client';

/* ────────────────────────────────────────────────────────────────────────────
   Pip the Owl — redesigned mascot

   Same public API as before:
     • <GuideCharacter expression message size />   (default export)
     • getPipMessage(key, entry, type)
     • LETTER_MESSAGES / NUMBER_MESSAGES
     • type PipExpression

   Visual redesign: brighter, rounder, bouncier owl with soft feather tufts,
   big cute eyes (amber iris with sparkle highlights), a candy-corn beak,
   scalloped wings, a cream tummy, and little feet — no branch.
   Body animations are CSS (injected once); framer-motion is used only for the
   speech-bubble pop.
   ──────────────────────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { LetterEntry, NumberEntry } from '@/lib/types';

export type PipExpression = 'idle' | 'happy' | 'excited' | 'curious' | 'nudge' | 'celebrate';

interface GuideCharacterProps {
  expression: PipExpression;
  message: string;
  size?: number;
  /** Optional brand color for the owl. Defaults to 'sky'. */
  theme?: keyof typeof OWL_THEMES;
}

/* ── Per-key personalized messages ──────────────────────────────────────── */
const LETTER_MESSAGES: Record<string, { expression: PipExpression; message: string }> = {
  A: { expression: 'excited', message: 'A is for Apple! 🍎 A says "ahh"!' },
  B: { expression: 'happy', message: 'B is for Balloon! 🎈 B goes "buh"!' },
  C: { expression: 'curious', message: 'C is for Cat! 🐱 C says "kuh"!' },
  D: { expression: 'happy', message: 'D is for Dog! 🐶 D goes "duh"!' },
  E: { expression: 'excited', message: 'E is for Elephant! 🐘 E says "ehh"!' },
  F: { expression: 'curious', message: 'F is for Fish! 🐟 F goes "fff"!' },
  G: { expression: 'happy', message: 'G is for Grapes! 🍇 G says "guh"!' },
  H: { expression: 'idle', message: 'H is for Hat! 🎩 H goes "huh"!' },
  I: { expression: 'excited', message: 'I is for Ice Cream! 🍦 I says "eye"!' },
  J: { expression: 'curious', message: 'J is for Jellyfish! 🪼 J goes "juh"!' },
  K: { expression: 'happy', message: 'K is for Kite! 🪁 K says "kuh"!' },
  L: { expression: 'excited', message: 'L is for Lion! 🦁 L goes "lll"!' },
  M: { expression: 'happy', message: 'M is for Moon! 🌙 M says "mmm"!' },
  N: { expression: 'curious', message: 'N is for Nose! 👃 N goes "nnn"!' },
  O: { expression: 'excited', message: 'O is for Orange! 🍊 O says "ohh"!' },
  P: { expression: 'happy', message: 'P is for Penguin! 🐧 P goes "puh"!' },
  Q: { expression: 'curious', message: 'Q is for Queen! 👑 Q says "kwuh"!' },
  R: { expression: 'excited', message: 'R is for Rainbow! 🌈 R goes "rrr"!' },
  S: { expression: 'happy', message: 'S is for Star! ⭐ S says "sss"!' },
  T: { expression: 'excited', message: 'T is for Train! 🚂 T goes "tuh"!' },
  U: { expression: 'curious', message: 'U is for Umbrella! ☂️ U says "uhh"!' },
  V: { expression: 'excited', message: 'V is for Volcano! 🌋 V goes "vvv"!' },
  W: { expression: 'happy', message: 'W is for Watermelon! 🍉 W says "wuh"!' },
  X: { expression: 'curious', message: 'X is for Xylophone! 🎵 X goes "ksss"!' },
  Y: { expression: 'happy', message: 'Y is for Yarn! 🧶 Y says "yuh"!' },
  Z: { expression: 'excited', message: 'Z is for Zebra! 🦓 Z says "zzz"!' },
};

const NUMBER_MESSAGES: Record<number, { expression: PipExpression; message: string }> = {
  0: { expression: 'curious', message: 'Zero! Nothing here… but zero is so important! 😴' },
  1: { expression: 'happy', message: 'One big sunny sun! ☀️ Just ONE!' },
  2: { expression: 'happy', message: 'Two eyes to see with! 👀 Can you find TWO things?' },
  3: { expression: 'excited', message: 'Three lucky clovers! 🍀 THREE three three!' },
  4: { expression: 'happy', message: 'Four wheels on a car! 🚗 Vroom vroom!' },
  5: { expression: 'excited', message: 'FIVE shining stars! ⭐ Give me FIVE!' },
  6: { expression: 'curious', message: 'Six dice! 🎲 Roll all SIX!' },
  7: { expression: 'excited', message: 'Seven colorful rainbows! 🌈 Count to SEVEN!' },
  8: { expression: 'excited', message: "Eight octopus arms! 🐙 That's four big hugs!" },
  9: { expression: 'celebrate', message: "NINE! Almost ten! 🎉 You're SO close!" },
};

export function getPipMessage(
  key: string,
  entry: LetterEntry | NumberEntry | null,
  type: 'letter' | 'number' | 'special'
): { expression: PipExpression; message: string } {
  if (type === 'letter') {
    const upper = key.toUpperCase();
    return (
      LETTER_MESSAGES[upper] ?? {
        expression: 'happy',
        message: `${upper} is for ${(entry as LetterEntry)?.word ?? upper}!`,
      }
    );
  }
  if (type === 'number') {
    const digit = parseInt(key, 10);
    return NUMBER_MESSAGES[digit] ?? { expression: 'happy', message: `${key}! Great press!` };
  }

  const specialMessages: Record<string, { expression: PipExpression; message: string }> = {
    ' ': { expression: 'curious', message: "That's the space bar! It makes room between words!" },
    Enter: { expression: 'happy', message: 'Enter! That means "I\'m done!" ↵' },
    Backspace: { expression: 'nudge', message: 'Backspace! It erases what you typed! ⌫' },
    Shift: { expression: 'excited', message: 'Shift makes letters BIG! ⇧' },
    CapsLock: { expression: 'excited', message: 'Caps Lock! Now EVERYTHING is LOUD! ⇪' },
    Tab: { expression: 'curious', message: 'Tab! Makes a big jump across the page! ⇥' },
    Escape: { expression: 'idle', message: 'Escape! It gets you out of tight spots! ⎋' },
    ArrowUp: { expression: 'curious', message: 'Up arrow! Going up! ↑' },
    ArrowDown: { expression: 'curious', message: 'Down arrow! Going down! ↓' },
    ArrowLeft: { expression: 'nudge', message: 'Left arrow! Moving left! ←' },
    ArrowRight: { expression: 'nudge', message: 'Right arrow! Moving right! →' },
  };

  return specialMessages[key] ?? { expression: 'idle', message: `You pressed ${key}! Interesting!` };
}

/* ── Color themes ──────────────────────────────────────────────────────────── */
const OWL_THEMES = {
  sky:   { body: '#54C5F0', dark: '#28B0E6', wing: '#2BA1D8', face: '#CDEDFB', outline: '#1E93CE', beakTop: '#FFB23E', beakBot: '#F98C16', feet: '#FB9A1E' },
  teal:  { body: '#39D2C6', dark: '#1CBDB1', wing: '#15A89C', face: '#C6F2EC', outline: '#0E9E92', beakTop: '#FFB23E', beakBot: '#F98C16', feet: '#FB9A1E' },
  berry: { body: '#FF8C8C', dark: '#FF6B6B', wing: '#F25C5C', face: '#FFDCD8', outline: '#E84C4C', beakTop: '#FFC24D', beakBot: '#FB9A1E', feet: '#F98C16' },
  grass: { body: '#74CE7E', dark: '#54B85F', wing: '#46A852', face: '#CDEFCF', outline: '#3E9A48', beakTop: '#FFB23E', beakBot: '#F98C16', feet: '#FB9A1E' },
  sunny: { body: '#FFC04D', dark: '#FFA92B', wing: '#F6921A', face: '#FFE9C2', outline: '#E8830C', beakTop: '#FF8A7E', beakBot: '#F2554A', feet: '#F2554A' },
} as const;

const C = { belly: '#FFF4CF', bellyLn: '#F4E2A6', iris: '#F7B733', irisIn: '#E89A0E', pupil: '#2A2A52', cheek: '#FF8A80' };

/* ── Eye helpers ───────────────────────────────────────────────────────────── */
type EyeMode = 'open' | 'smile' | 'wide' | 'star';

function eyeConfig(e: PipExpression): { left: EyeMode; right: EyeMode; look: [number, number] } {
  switch (e) {
    case 'happy':     return { left: 'smile', right: 'smile', look: [0, 0] };
    case 'excited':   return { left: 'wide',  right: 'wide',  look: [0, -1] };
    case 'curious':   return { left: 'open',  right: 'open',  look: [5, -6] };
    case 'nudge':     return { left: 'smile', right: 'open',  look: [6, 2] };
    case 'celebrate': return { left: 'star',  right: 'star',  look: [0, -2] };
    default:          return { left: 'open',  right: 'open',  look: [0, 0] };
  }
}

function Eye({ cx, cy, mode, look, blink }: { cx: number; cy: number; mode: EyeMode; look: [number, number]; blink: boolean }) {
  const lx = Math.max(-5, Math.min(5, look[0]));
  const ly = Math.max(-5, Math.min(5, look[1]));

  if (mode === 'smile') {
    return <path d={`M ${cx - 20} ${cy + 5} Q ${cx} ${cy - 16} ${cx + 20} ${cy + 5}`} stroke={C.pupil} strokeWidth="7" strokeLinecap="round" fill="none" />;
  }
  if (blink) {
    return <path d={`M ${cx - 19} ${cy} Q ${cx} ${cy + 7} ${cx + 19} ${cy}`} stroke={C.pupil} strokeWidth="6.5" strokeLinecap="round" fill="none" />;
  }
  const wide = mode === 'wide' || mode === 'star';
  const scl = wide ? 30 : 28;
  const irisR = wide ? 25 : 23;
  const pupR = wide ? 16 : 17;
  return (
    <g>
      <circle cx={cx} cy={cy} r={scl} fill="#fff" />
      <g transform={`translate(${lx} ${ly})`}>
        <circle cx={cx} cy={cy} r={irisR} fill={C.iris} />
        <circle cx={cx} cy={cy} r={irisR} fill="none" stroke={C.irisIn} strokeWidth="2" opacity="0.5" />
        <circle cx={cx} cy={cy} r={pupR} fill={C.pupil} />
        <circle cx={cx - 8} cy={cy - 9} r="7" fill="#fff" />
        <circle cx={cx + 7} cy={cy + 7} r="3.2" fill="#fff" opacity="0.9" />
      </g>
      {mode === 'star' && (
        <path transform={`translate(${cx} ${cy}) scale(1.5)`} d="M0,-8 Q1.6,-1.6 8,0 Q1.6,1.6 0,8 Q-1.6,1.6 -8,0 Q-1.6,-1.6 0,-8 Z" fill="#FFE36B" stroke="#F7B733" strokeWidth="1" />
      )}
    </g>
  );
}

/* ── CSS animations (injected once into <head>) ────────────────────────────── */
const OWL_CSS = `
.pip-root{animation:pipIdle 2.8s ease-in-out infinite}
@keyframes pipIdle{0%,100%{transform:translateY(0) scaleX(1) scaleY(1)}50%{transform:translateY(-7px) scaleX(.99) scaleY(1.01)}}
.pip-happy{animation:pipHop .6s cubic-bezier(.3,1.4,.5,1) 2}
@keyframes pipHop{0%,100%{transform:translateY(0)}35%{transform:translateY(-16px) scaleY(1.04)}60%{transform:translateY(0) scaleY(.96)}}
.pip-excited{animation:pipBuzz .5s ease-in-out infinite}
@keyframes pipBuzz{0%,100%{transform:translateY(0) scale(1)}25%{transform:translateY(-9px) scale(1.03)}50%{transform:translateY(0) scale(1)}75%{transform:translateY(-5px) scale(1.02)}}
.pip-curious{animation:pipTilt 3.2s ease-in-out infinite}
@keyframes pipTilt{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(-10deg) translateY(-3px)}}
.pip-nudge{animation:pipLean 1.1s ease-in-out infinite}
@keyframes pipLean{0%,100%{transform:rotate(7deg) translateX(6px)}50%{transform:rotate(9deg) translateX(10px)}}
.pip-celebrate{animation:pipJump .7s cubic-bezier(.3,1.3,.5,1) infinite}
@keyframes pipJump{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-22px) rotate(-6deg)}50%{transform:translateY(0) rotate(0)}75%{transform:translateY(-14px) rotate(6deg)}}
.pip-wing{transition:transform .35s cubic-bezier(.34,1.4,.6,1)}
.pip-wing-l{transform-origin:60px 122px}.pip-wing-r{transform-origin:180px 122px}
.pip-excited .pip-wing-l,.pip-celebrate .pip-wing-l{transform:rotate(26deg)}
.pip-excited .pip-wing-r,.pip-celebrate .pip-wing-r{transform:rotate(-26deg)}
.pip-nudge .pip-wing-r{transform:rotate(-40deg) translateY(-6px)}
.pip-celebrate .pip-wing-l{animation:pipFlapL .4s ease-in-out infinite}
.pip-celebrate .pip-wing-r{animation:pipFlapR .4s ease-in-out infinite}
@keyframes pipFlapL{0%,100%{transform:rotate(20deg)}50%{transform:rotate(40deg)}}
@keyframes pipFlapR{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(-40deg)}}
.pip-tuft{transition:transform .3s cubic-bezier(.34,1.5,.6,1)}
.pip-tuft-l{transform-origin:95px 70px}.pip-tuft-r{transform-origin:145px 70px}
.pip-excited .pip-tuft-l,.pip-celebrate .pip-tuft-l{transform:rotate(-12deg) translateY(-3px)}
.pip-excited .pip-tuft-r,.pip-celebrate .pip-tuft-r{transform:rotate(12deg) translateY(-3px)}
.pip-spark{transform-box:fill-box;transform-origin:center;animation:pipTwinkle 1.3s ease-in-out infinite}
@keyframes pipTwinkle{0%,100%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1)}}
.pip-confetti{transform-box:fill-box;transform-origin:center;animation:pipFall 1.1s linear infinite}
@keyframes pipFall{0%{opacity:0;transform:translateY(-10px) rotate(0)}20%{opacity:1}100%{opacity:0;transform:translateY(150px) rotate(220deg)}}
@media (prefers-reduced-motion: reduce){.pip-root,.pip-wing,.pip-tuft,.pip-spark,.pip-confetti{animation:none!important;transition:none!important}}
`;

function useOwlStyles() {
  useEffect(() => {
    if (document.getElementById('pip-owl-styles')) return;
    const el = document.createElement('style');
    el.id = 'pip-owl-styles';
    el.textContent = OWL_CSS;
    document.head.appendChild(el);
  }, []);
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function GuideCharacter({ expression, message, size = 120, theme = 'sky' }: GuideCharacterProps) {
  useOwlStyles();
  const t = OWL_THEMES[theme] ?? OWL_THEMES.sky;
  const cfg = eyeConfig(expression);
  const openBeak = expression === 'excited' || expression === 'celebrate';
  const sparkle = expression === 'excited' || expression === 'celebrate';
  const confetti = expression === 'celebrate';

  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
      timer = setTimeout(loop, 2600 + Math.random() * 2400);
    };
    timer = setTimeout(loop, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size, minWidth: size }}>
      {/* Speech bubble */}
      <motion.div
        className="relative mb-2 bg-white rounded-2xl shadow-lg border-2 border-sky-200 px-3 py-2 max-w-[200px]"
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        key={message}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="font-heading text-sm text-gray-700 leading-tight text-center font-semibold">{message}</p>
        <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0" style={{ bottom: '-10px', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #bae6fd' }} />
        <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0" style={{ bottom: '-8px', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid white' }} />
      </motion.div>

      {/* Pip — decorative; the speech bubble carries the accessible message */}
      <svg
        viewBox="0 0 240 250"
        width={size}
        height={size * 1.04}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        style={{ overflow: 'visible', ['--beak-top' as string]: t.beakTop, ['--beak-bot' as string]: t.beakBot }}
      >
        <g className={`pip-root pip-${expression}`} style={{ transformOrigin: '120px 205px' }}>
          {/* ground shadow */}
          <ellipse cx="120" cy="232" rx="62" ry="11" fill="#000" opacity="0.1" />

          {/* feet */}
          <g stroke={t.feet} strokeWidth="6" strokeLinecap="round" fill="none">
            <path d="M 100 214 l -7 11 M 100 214 l 0 13 M 100 214 l 7 11" />
            <path d="M 140 214 l -7 11 M 140 214 l 0 13 M 140 214 l 7 11" />
          </g>

          {/* ear tufts */}
          <path className="pip-tuft pip-tuft-l" d="M 92 70 C 76 62 68 44 73 33 C 88 41 100 56 106 72 Z" fill={t.body} stroke={t.outline} strokeWidth="3" strokeLinejoin="round" />
          <path className="pip-tuft pip-tuft-r" d="M 148 70 C 164 62 172 44 167 33 C 152 41 140 56 134 72 Z" fill={t.body} stroke={t.outline} strokeWidth="3" strokeLinejoin="round" />
          <path d="M 90 66 C 80 58 75 47 77 40 C 86 47 94 57 98 67 Z" fill="#fff" opacity="0.18" />
          <path d="M 150 66 C 160 58 165 47 163 40 C 154 47 146 57 142 67 Z" fill="#fff" opacity="0.18" />

          {/* wings */}
          <path className="pip-wing pip-wing-l" d="M 54 116 C 30 124 26 168 40 192 C 46 184 50 190 56 180 C 60 187 66 184 68 174 C 60 152 58 130 54 116 Z" fill={t.wing} stroke={t.outline} strokeWidth="3" strokeLinejoin="round" />
          <path className="pip-wing pip-wing-r" d="M 186 116 C 210 124 214 168 200 192 C 194 184 190 190 184 180 C 180 187 174 184 172 174 C 180 152 182 130 186 116 Z" fill={t.wing} stroke={t.outline} strokeWidth="3" strokeLinejoin="round" />

          {/* body */}
          <path d="M 120 54 C 164 54 190 90 196 138 C 202 188 170 226 120 226 C 70 226 38 188 44 138 C 50 90 76 54 120 54 Z" fill={t.body} stroke={t.outline} strokeWidth="3" strokeLinejoin="round" />

          {/* belly */}
          <path d="M 120 120 C 86 120 70 142 70 170 C 70 198 94 214 120 214 C 146 214 170 198 170 170 C 170 142 154 120 120 120 Z" fill={C.belly} />
          <path d="M 86 150 Q 103 142 120 150 Q 137 142 154 150" stroke={C.bellyLn} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M 90 168 Q 105 160 120 168 Q 135 160 150 168" stroke={C.bellyLn} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M 96 186 Q 108 179 120 186 Q 132 179 144 186" stroke={C.bellyLn} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />

          {/* facial disc */}
          <ellipse cx="120" cy="112" rx="66" ry="52" fill={t.face} opacity="0.85" />

          {/* curious eyebrow */}
          {expression === 'curious' && (
            <path d="M 132 72 Q 150 64 166 72" stroke={t.outline} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          )}

          {/* eyes */}
          <Eye cx={90}  cy={112} mode={cfg.left}  look={cfg.look} blink={blink && cfg.left === 'open'} />
          <Eye cx={150} cy={112} mode={cfg.right} look={cfg.look} blink={blink && cfg.right === 'open'} />

          {/* cheeks */}
          <ellipse cx="66"  cy="138" rx="15" ry="9" fill={C.cheek} opacity={expression === 'happy' || expression === 'celebrate' ? 0.65 : 0.42} />
          <ellipse cx="174" cy="138" rx="15" ry="9" fill={C.cheek} opacity={expression === 'happy' || expression === 'celebrate' ? 0.65 : 0.42} />

          {/* beak */}
          <path d="M 107 137 Q 120 133 133 137 L 127 153 Q 120 159 113 153 Z" fill={t.beakTop} />
          <path d="M 110 147 Q 120 151 130 147 L 127 153 Q 120 159 113 153 Z" fill={t.beakBot} />
          {openBeak && <ellipse cx="120" cy="159" rx="8" ry="6" fill="#C84A38" />}

          {/* sparkles */}
          {sparkle && [
            { x: 36,  y: 70,  s: 1.1, d: '0s' },
            { x: 206, y: 84,  s: 1.4, d: '.3s' },
            { x: 200, y: 150, s: 0.9, d: '.6s' },
            { x: 30,  y: 150, s: 1.0, d: '.45s' },
          ].map((p, i) => (
            <path key={i} className="pip-spark" transform={`translate(${p.x} ${p.y}) scale(${p.s})`} style={{ animationDelay: p.d }} d="M0,-9 Q1.7,-1.7 9,0 Q1.7,1.7 0,9 Q-1.7,1.7 -9,0 Q-1.7,-1.7 0,-9 Z" fill="#FFE36B" stroke="#F7B733" strokeWidth="1" />
          ))}

          {/* confetti */}
          {confetti && ['#FF6B63', '#54C5F0', '#74CE7E', '#FFC04D', '#FF8C8C'].map((c, i) => (
            <rect key={i} className="pip-confetti" x={48 + i * 36} y="28" width="9" height="9" rx="2" fill={c} style={{ animationDelay: `${i * 0.12}s` }} transform={`rotate(${i * 25} ${52 + i * 36} 32)`} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export { OWL_THEMES, LETTER_MESSAGES, NUMBER_MESSAGES };
