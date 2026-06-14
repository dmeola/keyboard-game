'use client';

import { motion } from 'framer-motion';

interface SessionTimerProps {
  pressCount: number;
}

const PRESSES_PER_STAR = 5;

export default function SessionTimer({ pressCount }: SessionTimerProps) {
  const starsEarned = Math.min(3, Math.floor(pressCount / PRESSES_PER_STAR));
  const progressToNextStar = pressCount % PRESSES_PER_STAR;
  const progressPct = (progressToNextStar / PRESSES_PER_STAR) * 100;

  return (
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
  );
}
