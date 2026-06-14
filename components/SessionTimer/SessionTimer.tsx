'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface SessionTimerProps {
  pressCount: number;
  onWiggleAcknowledged: () => void;
}

const PRESSES_PER_STAR = 5;
const WIGGLE_INTERVAL = 8;

export default function SessionTimer({ pressCount, onWiggleAcknowledged }: SessionTimerProps) {
  const [lastAcknowledgedAt, setLastAcknowledgedAt] = useState(0);
  const wiggleButtonRef = useRef<HTMLButtonElement>(null);
  // Track element that had focus before dialog opened, to restore it on close
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const starsEarned = Math.min(3, Math.floor(pressCount / PRESSES_PER_STAR));
  const progressToNextStar = pressCount % PRESSES_PER_STAR;
  const progressPct = (progressToNextStar / PRESSES_PER_STAR) * 100;
  const showWiggle = pressCount > 0 && pressCount % WIGGLE_INTERVAL === 0 && pressCount !== lastAcknowledgedAt;

  // Move focus into the dialog when it opens; restore when it closes
  useEffect(() => {
    if (showWiggle) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Defer to let AnimatePresence render the button first
      const t = setTimeout(() => wiggleButtonRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [showWiggle]);

  const handleAcknowledge = () => {
    setLastAcknowledgedAt(pressCount);
    onWiggleAcknowledged();
  };

  return (
    <>
      {/* Progress stars UI */}
      <div className="flex flex-col items-end gap-1.5">
        {/* Stars row — screen reader gets the summary text, stars are decorative */}
        <div
          className="flex items-center gap-1"
          aria-label={`${starsEarned} of 3 stars earned`}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="text-2xl leading-none select-none"
              aria-hidden="true"
              animate={
                i < starsEarned
                  ? { scale: [1, 1.4, 1], rotate: [0, 15, -10, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
              style={{ filter: i < starsEarned ? 'none' : 'grayscale(1) opacity(0.35)' }}
            >
              ⭐
            </motion.span>
          ))}
        </div>

        {/* Progress bar to next star */}
        {starsEarned < 3 && (
          <div
            className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progressToNextStar}
            aria-valuemin={0}
            aria-valuemax={PRESSES_PER_STAR}
            aria-label={`${progressToNextStar} of ${PRESSES_PER_STAR} presses to next star`}
          >
            <motion.div
              className="h-full bg-sunny-400 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>
        )}
        {starsEarned === 3 && (
          <span className="text-xs font-heading font-bold text-grass-700 select-none">
            All done! <span aria-hidden="true">🎉</span>
          </span>
        )}
      </div>

      {/* Wiggle break dialog */}
      <AnimatePresence>
        {showWiggle && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(30, 30, 60, 0.55)', backdropFilter: 'blur(4px)' }}
            // Trap clicks outside — user must use the button
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="wiggle-title"
              aria-describedby="wiggle-desc"
              className="bg-white rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center gap-5 mx-4 max-w-sm w-full"
              initial={{ scale: 0.7, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.7, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              <motion.span
                className="text-7xl select-none"
                aria-hidden="true"
                animate={{ rotate: [0, -15, 15, -12, 12, -8, 8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
              >
                🕺
              </motion.span>
              <div className="text-center">
                <p id="wiggle-title" className="font-heading font-bold text-2xl text-purple-700 mb-1">
                  Wiggle Break!
                </p>
                <p id="wiggle-desc" className="font-heading text-gray-600 text-lg">
                  Stand up and shake your sillies out!
                </p>
              </div>
              <motion.button
                ref={wiggleButtonRef}
                className="bg-grass-500 hover:bg-grass-600 text-white font-heading font-bold text-xl rounded-2xl px-8 py-3 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAcknowledge}
              >
                I wiggled! <span aria-hidden="true">✅</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
