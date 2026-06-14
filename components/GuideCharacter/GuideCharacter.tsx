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

  const bodyColor = '#C8A46B';
  const bellyColor = '#EDD8A4';
  const eyeWhite = '#FFFFFF';
  const pupilColor = '#1A1A2E';
  const beakColor = '#F4A742';
  const irisColor = expression === 'excited' ? '#29B6F6' : expression === 'celebrate' ? '#9C27B0' : '#2E86C1';

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

      {/* Pip SVG */}
      <motion.svg
        viewBox="0 0 110 140"
        width={size}
        height={size * 1.27}
        xmlns="http://www.w3.org/2000/svg"
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
        {/* Body */}
        <ellipse cx="55" cy="98" rx="38" ry="42" fill={bodyColor} />

        {/* Belly */}
        <ellipse cx="55" cy="102" rx="24" ry="30" fill={bellyColor} />

        {/* Wing left */}
        <motion.ellipse
          cx="20" cy="95" rx="14" ry="22"
          fill={bodyColor}
          style={{ transformOrigin: '20px 80px' }}
          animate={expression === 'celebrate' ? { rotate: [-20, -40, -20] } : { rotate: -10 }}
          transition={{ duration: 0.6, repeat: expression === 'celebrate' ? 3 : 0 }}
        />
        {/* Wing right */}
        <motion.ellipse
          cx="90" cy="95" rx="14" ry="22"
          fill={bodyColor}
          style={{ transformOrigin: '90px 80px' }}
          animate={expression === 'celebrate' ? { rotate: [20, 40, 20] } : { rotate: 10 }}
          transition={{ duration: 0.6, repeat: expression === 'celebrate' ? 3 : 0 }}
        />

        {/* Head */}
        <circle cx="55" cy="46" r="36" fill={bodyColor} />

        {/* Ear tufts */}
        <polygon points="35,16 30,4 42,13" fill={bodyColor} />
        <polygon points="75,16 80,4 68,13" fill={bodyColor} />
        <polygon points="35,16 30,6 40,14" fill="#A67C52" />
        <polygon points="75,16 80,6 70,14" fill="#A67C52" />

        {/* Face plate (lighter) */}
        <ellipse cx="55" cy="50" rx="26" ry="24" fill={bellyColor} />

        {/* LEFT EYE */}
        <g transform="translate(40, 44)">
          <circle cx="0" cy={leftEyeProps.cy} r="13" fill={eyeWhite} />
          <motion.g
            animate={leftEyeControls}
            initial={{ scaleY: leftEyeProps.scaleY }}
            style={{ transformOrigin: `0px ${leftEyeProps.cy}px` }}
          >
            <circle cx={leftPupil.dx} cy={leftEyeProps.cy + leftPupil.dy} r="9" fill={irisColor} />
            <circle cx={leftPupil.dx} cy={leftEyeProps.cy + leftPupil.dy} r="5" fill={pupilColor} />
            <circle cx={leftPupil.dx + 2} cy={leftEyeProps.cy + leftPupil.dy - 2} r="2" fill="white" opacity="0.8" />
          </motion.g>
          {/* Eyelid line for happy/celebrate */}
          {(expression === 'happy' || expression === 'celebrate') && (
            <path d={`M -12 ${leftEyeProps.cy - 2} Q 0 ${leftEyeProps.cy - 14} 12 ${leftEyeProps.cy - 2}`} stroke="#A67C52" strokeWidth="2" fill="none" />
          )}
        </g>

        {/* RIGHT EYE */}
        <g transform="translate(70, 44)">
          <circle cx="0" cy={rightEyeProps.cy} r="13" fill={eyeWhite} />
          <motion.g
            animate={rightEyeControls}
            initial={{ scaleY: rightEyeProps.scaleY }}
            style={{ transformOrigin: `0px ${rightEyeProps.cy}px` }}
          >
            <circle cx={rightPupil.dx} cy={rightEyeProps.cy + rightPupil.dy} r="9" fill={irisColor} />
            <circle cx={rightPupil.dx} cy={rightEyeProps.cy + rightPupil.dy} r="5" fill={pupilColor} />
            <circle cx={rightPupil.dx + 2} cy={rightEyeProps.cy + rightPupil.dy - 2} r="2" fill="white" opacity="0.8" />
          </motion.g>
          {(expression === 'happy' || expression === 'celebrate') && (
            <path d={`M -12 ${rightEyeProps.cy - 2} Q 0 ${rightEyeProps.cy - 14} 12 ${rightEyeProps.cy - 2}`} stroke="#A67C52" strokeWidth="2" fill="none" />
          )}
        </g>

        {/* Curious eyebrow (right side raised) */}
        {expression === 'curious' && (
          <path d="M 57 28 Q 68 24 79 27" stroke="#A67C52" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Beak */}
        <polygon points="55,59 49,68 61,68" fill={beakColor} />
        <line x1="49" y1="64" x2="61" y2="64" stroke="#E08C30" strokeWidth="1.5" />

        {/* Feet */}
        <ellipse cx="44" cy="138" rx="9" ry="4" fill={beakColor} />
        <ellipse cx="66" cy="138" rx="9" ry="4" fill={beakColor} />

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
