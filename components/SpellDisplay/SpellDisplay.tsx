'use client';

import { motion } from 'framer-motion';

interface SpellDisplayProps {
  word: string;
  revealedCount: number;
  emoji: string;
}

export default function SpellDisplay({ word, revealedCount, emoji }: SpellDisplayProps) {
  const letters = word.toUpperCase().split('');
  const complete = revealedCount >= letters.length;

  return (
    <motion.div
      key={word}
      className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border-2 border-purple-300"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      role="status"
      aria-label={
        complete
          ? `Spelled ${word}!`
          : `Spell the word ${word}. ${revealedCount} of ${letters.length} letters typed.`
      }
    >
      <span className="text-3xl select-none" aria-hidden="true">{emoji}</span>
      <span className="font-heading text-sm text-purple-600 font-bold">Spell:</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {letters.map((letter, i) => {
          const isFilled = i < revealedCount;
          const isCurrent = i === revealedCount && !complete;
          return (
            <motion.div
              key={`${word}-${i}`}
              className={`relative flex items-center justify-center rounded-lg font-heading font-bold text-2xl border-2 select-none ${
                isFilled
                  ? 'bg-grass-300 border-grass-500 text-grass-900'
                  : isCurrent
                    ? 'bg-white border-purple-500 text-purple-300'
                    : 'bg-gray-50 border-gray-200 text-gray-300'
              }`}
              style={{ width: 36, height: 40 }}
              animate={
                isCurrent
                  ? { scale: [1, 1.08, 1], borderColor: ['#a855f7', '#c084fc', '#a855f7'] }
                  : isFilled
                    ? { scale: [0.6, 1.15, 1] }
                    : {}
              }
              transition={
                isCurrent
                  ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.35, ease: 'easeOut' }
              }
            >
              {letter}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
