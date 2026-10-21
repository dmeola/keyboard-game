'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { LetterEntry } from '@/lib/types';

interface LetterImageProps {
  entry: LetterEntry | null;
}

const RELATED_EMOJIS: Record<string, string[]> = {
  A: ['🍏', '🌿', '🌱'],
  B: ['🎉', '🎊', '💨'],
  C: ['🐾', '🧶', '🐟'],
  D: ['🦮', '🦴', '🐾'],
  E: ['🌿', '🦏', '🫧'],
  F: ['🌊', '🐠', '🫧'],
  G: ['🍋', '🍓', '🍒'],
  H: ['🪄', '✨', '🎩'],
  I: ['🍧', '🍨', '🧁'],
  J: ['🌊', '💜', '🫧'],
  K: ['🌬️', '🌤️', '🧵'],
  L: ['🌾', '🌅', '🦒'],
  M: ['⭐', '🌟', '☁️'],
  N: ['😤', '💨', '👃'],
  O: ['🍋', '🌿', '🍊'],
  P: ['❄️', '🐟', '🌊'],
  Q: ['💎', '✨', '🌟'],
  R: ['☁️', '🌦️', '💧'],
  S: ['✨', '💫', '🌟'],
  T: ['🚃', '🚄', '💨'],
  U: ['☔', '🌧️', '💧'],
  V: ['🌋', '🔥', '💨'],
  W: ['🍀', '🌱', '🌿'],
  X: ['🎶', '🎸', '🎵'],
  Y: ['🌈', '🧷', '🐱'],
  Z: ['🌿', '⚫', '🦁'],
};

/* Where the three floating emojis start, as % of the main emoji box */
const FLOAT_POSITIONS = [
  { left: '-12%', top: '30%' },
  { left: '88%', top: '30%' },
  { left: '92%', top: '72%' },
];

export default function LetterImage({ entry }: LetterImageProps) {
  const letterKey = entry?.word[0].toUpperCase() ?? 'A';
  const related = RELATED_EMOJIS[letterKey] ?? [];

  return (
    <AnimatePresence mode="wait">
      {entry ? (
        <motion.div
          key={entry.word}
          className="relative flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Main emoji — spring bounce */}
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="select-none leading-none"
            style={{ fontSize: 'var(--emoji-size)' }}
            aria-label={entry.word}
          >
            {entry.emoji}
          </motion.span>

          {/* Floating related emojis — decorative only */}
          {related.slice(0, 3).map((emoji, i) => (
            <motion.span
              key={`float-${i}`}
              aria-hidden="true"
              className="absolute select-none pointer-events-none leading-none"
              style={{ fontSize: 'calc(var(--emoji-size) * 0.28)', ...FLOAT_POSITIONS[i] }}
              initial={{ opacity: 0, scale: 0, x: '0%', y: '0%' }}
              animate={{
                opacity: [0, 0.85, 0.85, 0],
                scale: [0, 1.1, 1, 0.8],
                x: ['0%', i === 0 ? '-40%' : '40%'],
                y: ['0%', '-120%'],
              }}
              transition={{
                duration: 2.2,
                delay: i * 0.18 + 0.25,
                ease: 'easeOut',
                times: [0, 0.3, 0.7, 1],
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          className="flex items-center justify-center"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
        >
          <span className="select-none leading-none" style={{ fontSize: 'calc(var(--emoji-size) * 0.6)' }}>✨</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
