'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { NumberEntry } from '@/lib/types';

interface NumberDisplayProps {
  entry: NumberEntry | null;
}

function bgClassToColor(bgClass: string): string {
  const match = bgClass.match(/^bg-(.+)$/);
  if (!match) return 'var(--color-sky-400)';
  return `var(--color-${match[1]})`;
}

export default function NumberDisplay({ entry }: NumberDisplayProps) {
  if (!entry) {
    return (
      <div className="flex items-center justify-center w-full py-8 opacity-25">
        <span className="text-8xl select-none">✨</span>
      </div>
    );
  }

  const isZero = entry.objects.length === 0;
  const accentColor = bgClassToColor(entry.color);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={entry.word}
        className="flex flex-col items-center justify-center w-full py-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isZero ? (
          /* Zero special case */
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <motion.span
              className="select-none leading-none"
              style={{ fontSize: 'clamp(5rem, 18vw, 9rem)' }}
              animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              😴
            </motion.span>
            <span
              className="font-heading font-bold text-2xl md:text-3xl text-center select-none px-4"
              style={{ color: accentColor }}
            >
              Zero… nothing here!
            </span>
          </motion.div>
        ) : (
          /* Staggered object animation */
          <div className="flex flex-col items-center gap-3 w-full">
            <motion.div
              className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-4 max-w-lg"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
              }}
            >
              {entry.objects.map((emoji, i) => (
                <motion.div
                  key={i}
                  className="relative flex flex-col items-center"
                  variants={{
                    hidden: { opacity: 0, y: -60, scale: 0.3 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 18,
                      },
                    },
                  }}
                >
                  {/* Count badge */}
                  <motion.span
                    className="absolute -top-5 font-heading font-bold text-sm rounded-full w-6 h-6 flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: accentColor, fontSize: '0.7rem' }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 0] }}
                    transition={{ delay: i * 0.12 + 0.4, duration: 1.2, times: [0, 0.2, 0.6, 1] }}
                  >
                    {i + 1}
                  </motion.span>

                  <span
                    className="select-none leading-none"
                    style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)' }}
                  >
                    {emoji}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Fun fact */}
            <motion.p
              className="font-heading text-center text-lg md:text-xl font-semibold px-6 max-w-md"
              style={{ color: accentColor }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: entry.objects.length * 0.12 + 0.5 }}
            >
              {entry.funFact}
            </motion.p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
