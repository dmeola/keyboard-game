'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import type { LetterEntry, NumberEntry } from '@/lib/types';

export type PipExpression = 'idle' | 'happy' | 'excited' | 'curious' | 'nudge' | 'celebrate';

interface GuideCharacterProps {
  expression: PipExpression;
  message: string;
  size?: number;
}

/* Per-key personalized messages */
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
  Z: { expression: 'excited', message: 'Z is for Zebra! 🦓 Z goes "zzz"!' },
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
  8: { expression: 'excited', message: 'Eight octopus arms! 🐙 That\'s four big hugs!' },
  9: { expression: 'celebrate', message: 'NINE! Almost ten! 🎉 You\'re SO close!' },
};

export function getPipMessage(
  key: string,
  entry: LetterEntry | NumberEntry | null,
  type: 'letter' | 'number' | 'special'
): { expression: PipExpression; message: string } {
  if (type === 'letter') {
    const upper = key.toUpperCase();
    return LETTER_MESSAGES[upper] ?? { expression: 'happy', message: `${upper} is for ${(entry as LetterEntry)?.word ?? upper}!` };
  }
  if (type === 'number') {
    const digit = parseInt(key, 10);
    return NUMBER_MESSAGES[digit] ?? { expression: 'happy', message: `${key}! Great press!` };
  }

  // Special keys
  const specialMessages: Record<string, { expression: PipExpression; message: string }> = {
    ' ': { expression: 'curious', message: 'That\'s the space bar! It makes room between words!' },
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

/* Eye path helpers */
function getEyePath(expression: PipExpression, isLeft: boolean): { scaleY: number; cy: number } {
  switch (expression) {
    case 'happy': return { scaleY: 0.35, cy: 0 };
    case 'excited': return { scaleY: 1.2, cy: -2 };
    case 'curious': return { scaleY: 1.0, cy: isLeft ? 0 : -3 };
    case 'nudge': return { scaleY: 0.8, cy: 3 };
    case 'celebrate': return { scaleY: 1.3, cy: -3 };
    default: return { scaleY: 1.0, cy: 0 };
  }
}

function getPupilOffset(expression: PipExpression, isLeft: boolean): { dx: number; dy: number } {
  switch (expression) {
    case 'nudge': return { dx: isLeft ? -3 : 3, dy: 0 };
    case 'curious': return { dx: isLeft ? 1 : 3, dy: isLeft ? -1 : -2 };
    case 'celebrate': return { dx: isLeft ? -2 : 2, dy: -2 };
    default: return { dx: 0, dy: 0 };
  }
}

export default function GuideCharacter({ expression, message, size = 120 }: GuideCharacterProps) {
  const leftEyeControls = useAnimation();
  const rightEyeControls = useAnimation();

  const leftEyeProps = getEyePath(expression, true);
  const rightEyeProps = getEyePath(expression, false);
  const leftPupil = getPupilOffset(expression, true);
  const rightPupil = getPupilOffset(expression, false);

  /* Blink cycle for idle + happy */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (expression === 'idle' || expression === 'happy') {
      const blink = async () => {
        await leftEyeControls.start({ scaleY: 0.05, transition: { duration: 0.08 } });
        await rightEyeControls.start({ scaleY: 0.05, transition: { duration: 0.08 } });
        await leftEyeControls.start({ scaleY: leftEyeProps.scaleY, transition: { duration: 0.1 } });
        await rightEyeControls.start({ scaleY: rightEyeProps.scaleY, transition: { duration: 0.1 } });
        timeout = setTimeout(blink, 2800 + Math.random() * 2000);
      };
      timeout = setTimeout(blink, 1500 + Math.random() * 1000);
    }
    return () => clearTimeout(timeout);
  }, [expression, leftEyeControls, rightEyeControls, leftEyeProps.scaleY, rightEyeProps.scaleY]);

  const bodyColor = '#8B6B3F';
  const wingColor = '#5C3D1A';
  const bellyColor = '#F2E0B0';
  const facialDiscColor = '#EDD9A3';
  const eyeRingColor = '#3D2008';
  const eyeWhite = '#FFFEF5';
  const pupilColor = '#0D0D18';
  const beakColor = '#E09018';
  const branchColor = '#7B5430';
  // Owls have golden/amber eyes — much more owl-like than blue
  const irisColor = expression === 'excited' ? '#FFB800'
    : expression === 'celebrate' ? '#F4900C'
    : expression === 'curious' ? '#D4930A'
    : '#DAA520';

  const celebrateSparkles = ['⭐', '✨', '🌟', '💫'];

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
        <p className="font-heading text-sm text-gray-700 leading-tight text-center font-semibold">
          {message}
        </p>
        {/* Bubble tail */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            bottom: '-10px',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '10px solid #bae6fd',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            bottom: '-8px',
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '9px solid white',
          }}
        />
      </motion.div>

      {/* Pip SVG — purely decorative; the speech bubble above carries the message */}
      <motion.svg
        viewBox="0 0 110 140"
        width={size}
        height={size * 1.27}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        animate={
          expression === 'celebrate'
            ? { rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.05, 1] }
            : expression === 'excited'
            ? { scale: [1, 1.06, 1, 1.04, 1] }
            : expression === 'nudge'
            ? { x: [0, -4, 4, -3, 3, 0] }
            : {}
        }
        transition={{ duration: 0.6, repeat: expression === 'celebrate' ? 2 : 0 }}
      >
        {/* Branch to perch on */}
        <rect x="2" y="132" width="106" height="8" rx="4" fill={branchColor} />

        {/* Talons gripping branch */}
        <path d="M 36,132 L 33,137 M 40,132 L 40,138 M 44,132 L 47,137"
          stroke={beakColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 63,132 L 66,137 M 70,132 L 70,138 M 74,132 L 77,137"
          stroke={beakColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Body — plump and round */}
        <ellipse cx="55" cy="103" rx="30" ry="33" fill={bodyColor} />

        {/* Folded wing panels (darker sections on sides of body) */}
        <motion.ellipse
          cx="27" cy="107" rx="10" ry="22"
          fill={wingColor}
          style={{ transformOrigin: '27px 88px' }}
          animate={expression === 'celebrate' ? { rotate: [-15, -30, -15] } : { rotate: 0 }}
          transition={{ duration: 0.6, repeat: expression === 'celebrate' ? 3 : 0 }}
        />
        <motion.ellipse
          cx="83" cy="107" rx="10" ry="22"
          fill={wingColor}
          style={{ transformOrigin: '83px 88px' }}
          animate={expression === 'celebrate' ? { rotate: [15, 30, 15] } : { rotate: 0 }}
          transition={{ duration: 0.6, repeat: expression === 'celebrate' ? 3 : 0 }}
        />

        {/* Belly — cream with subtle feather row curves */}
        <ellipse cx="55" cy="109" rx="19" ry="24" fill={bellyColor} />
        <path d="M 39,100 Q 55,96 71,100" stroke={bodyColor} strokeWidth="1.5" fill="none" opacity="0.35" />
        <path d="M 37,111 Q 55,107 73,111" stroke={bodyColor} strokeWidth="1.5" fill="none" opacity="0.35" />
        <path d="M 39,121 Q 55,117 71,121" stroke={bodyColor} strokeWidth="1.5" fill="none" opacity="0.35" />

        {/* Head */}
        <circle cx="55" cy="52" r="30" fill={bodyColor} />

        {/* Ear tufts — soft rounded feather bumps */}
        <path d="M 33,30 Q 34,17 38,11 Q 43,17 44,30" fill={bodyColor} />
        <path d="M 66,30 Q 67,17 72,11 Q 76,17 77,30" fill={bodyColor} />
        {/* Inner tuft shading */}
        <path d="M 35,30 Q 36,20 38,15 Q 41,20 42,30" fill={wingColor} opacity="0.55" />
        <path d="M 68,30 Q 69,20 72,15 Q 74,20 75,30" fill={wingColor} opacity="0.55" />

        {/* Facial disc — the characteristic lighter oval around the face */}
        <ellipse cx="55" cy="54" rx="27" ry="22" fill={facialDiscColor} />

        {/* Dark feather rings around eyes — the most owl-like feature */}
        <circle cx="40" cy="52" r="13" fill={eyeRingColor} />
        <circle cx="70" cy="52" r="13" fill={eyeRingColor} />

        {/* LEFT EYE */}
        <g transform="translate(40, 52)">
          <circle cx="0" cy={leftEyeProps.cy} r="11" fill={eyeWhite} />
          <motion.g
            animate={leftEyeControls}
            initial={{ scaleY: leftEyeProps.scaleY }}
            style={{ transformOrigin: `0px ${leftEyeProps.cy}px` }}
          >
            <circle cx={leftPupil.dx} cy={leftEyeProps.cy + leftPupil.dy} r="7" fill={irisColor} />
            <circle cx={leftPupil.dx} cy={leftEyeProps.cy + leftPupil.dy} r="4" fill={pupilColor} />
            <circle cx={leftPupil.dx + 2} cy={leftEyeProps.cy + leftPupil.dy - 2} r="1.5" fill="white" opacity="0.85" />
          </motion.g>
          {(expression === 'happy' || expression === 'celebrate') && (
            <path d={`M -10 ${leftEyeProps.cy - 2} Q 0 ${leftEyeProps.cy - 12} 10 ${leftEyeProps.cy - 2}`}
              stroke={wingColor} strokeWidth="2" fill="none" />
          )}
        </g>

        {/* RIGHT EYE */}
        <g transform="translate(70, 52)">
          <circle cx="0" cy={rightEyeProps.cy} r="11" fill={eyeWhite} />
          <motion.g
            animate={rightEyeControls}
            initial={{ scaleY: rightEyeProps.scaleY }}
            style={{ transformOrigin: `0px ${rightEyeProps.cy}px` }}
          >
            <circle cx={rightPupil.dx} cy={rightEyeProps.cy + rightPupil.dy} r="7" fill={irisColor} />
            <circle cx={rightPupil.dx} cy={rightEyeProps.cy + rightPupil.dy} r="4" fill={pupilColor} />
            <circle cx={rightPupil.dx + 2} cy={rightEyeProps.cy + rightPupil.dy - 2} r="1.5" fill="white" opacity="0.85" />
          </motion.g>
          {(expression === 'happy' || expression === 'celebrate') && (
            <path d={`M -10 ${rightEyeProps.cy - 2} Q 0 ${rightEyeProps.cy - 12} 10 ${rightEyeProps.cy - 2}`}
              stroke={wingColor} strokeWidth="2" fill="none" />
          )}
        </g>

        {/* Curious eyebrow — right side raised */}
        {expression === 'curious' && (
          <path d="M 57,30 Q 68,26 79,29" stroke={wingColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Beak — small hooked triangle nestled between the eyes */}
        <polygon points="55,65 50,72 60,72" fill={beakColor} />
        <line x1="50" y1="68.5" x2="60" y2="68.5" stroke="#C07010" strokeWidth="1.5" />

        {/* Celebrate sparkles */}
        {expression === 'celebrate' && celebrateSparkles.map((s, i) => (
          <motion.text
            key={i}
            x={i < 2 ? (i === 0 ? 0 : 95) : (i === 2 ? 5 : 88)}
            y={i < 2 ? (i === 0 ? 30 : 35) : (i === 2 ? 65 : 60)}
            fontSize="14"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0] }}
            transition={{ delay: i * 0.15, duration: 1, repeat: 2 }}
            style={{ transformOrigin: 'center' }}
          >
            {s}
          </motion.text>
        ))}
      </motion.svg>
    </div>
  );
}
