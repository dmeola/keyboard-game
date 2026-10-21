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
      <div className="flex items-center justify-center opacity-25">
        <span className="select-none leading-none" style={{ fontSize: 'calc(var(--emoji-size) * 0.6)' }} aria-hidden="true">✨</span>
      </div>
    );
  }

  const isZero = entry.objects.length === 0;
  const accentColor = bgClassToColor(entry.color);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={entry.word}
        className="flex flex-col items-center justify-center gap-4"
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
              aria-hidden="true"
              style={{ fontSize: 'var(--emoji-size)' }}
              animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              😴
            </motion.span>
            <span
              className="font-heading font-bold text-center select-none px-4"
              style={{ color: accentColor, fontSize: 'calc(var(--word-size) * 0.8)' }}
            >
              Zero… nothing here!
            </span>
          </motion.div>
        ) : (
          /* Staggered object animation */
          <div className="flex flex-col items-center gap-3">
            {/* Accessible description of the count — screen reader reads this */}
            <p className="sr-only">
              {entry.word}: {entry.objects.length} {entry.objects.length === 1 ? 'object' : 'objects'}
            </p>
            <motion.div
              className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-4"
              style={{ maxWidth: 'calc(var(--object-size) * 5.6)' }}
              aria-hidden="true"
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
                    className="absolute font-heading font-bold rounded-full flex items-center justify-center text-white shadow-md"
                    style={{
                      backgroundColor: accentColor,
                      top: 'calc(var(--object-size) * -0.3)',
                      width: 'calc(var(--object-size) * 0.36)',
                      height: 'calc(var(--object-size) * 0.36)',
                      fontSize: 'calc(var(--object-size) * 0.2)',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 0] }}
                    transition={{ delay: i * 0.12 + 0.4, duration: 1.2, times: [0, 0.2, 0.6, 1] }}
                  >
                    {i + 1}
                  </motion.span>

                  <span
                    className="select-none leading-none"
                    style={{ fontSize: 'var(--object-size)' }}
                  >
                    {emoji}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Fun fact */}
            <motion.p
              className="font-heading text-center font-semibold px-6"
              style={{ color: accentColor, fontSize: 'max(0.95rem, calc(var(--word-size) * 0.6))', maxWidth: 'calc(var(--object-size) * 6)' }}
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
