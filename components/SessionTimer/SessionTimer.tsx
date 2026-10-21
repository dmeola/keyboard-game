'use client';

import { motion } from 'framer-motion';

interface SessionTimerProps {
  pressCount: number;
}

const PRESSES_PER_STAR = 5;
const STARS_PER_TROPHY = 3;

/**
 * Stars fill up as the child plays; every 3 stars turn into a trophy and the
 * stars start again, so the reward keeps going instead of saying "all done".
 */
export default function SessionTimer({ pressCount }: SessionTimerProps) {
  const totalStars = Math.floor(pressCount / PRESSES_PER_STAR);
  const trophies = Math.floor(totalStars / STARS_PER_TROPHY);
  const starsEarned = totalStars % STARS_PER_TROPHY;
  const progressToNextStar = pressCount % PRESSES_PER_STAR;
  const progressPct = (progressToNextStar / PRESSES_PER_STAR) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* Trophies — pop in each time a set of stars is completed */}
      {trophies > 0 && (
        <motion.div
          key={trophies}
          className="flex items-center gap-1 bg-sunny-100 border-2 border-sunny-400 rounded-full pl-1.5 pr-2.5 py-0.5"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          aria-label={`${trophies} ${trophies === 1 ? 'trophy' : 'trophies'}`}
          role="img"
        >
          <span className="text-2xl leading-none select-none" aria-hidden="true">🏆</span>
          <span className="font-heading font-bold text-sunny-900 text-lg leading-none select-none" aria-hidden="true">
            {trophies}
          </span>
        </motion.div>
      )}

      <div className="flex flex-col items-end gap-1.5">
        {/* Stars row — screen reader gets the summary text, stars are decorative */}
        <div
          className="flex items-center gap-1"
          aria-label={`${starsEarned} of ${STARS_PER_TROPHY} stars to the next trophy`}
        >
          {Array.from({ length: STARS_PER_TROPHY }, (_, i) => (
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
      </div>
    </div>
  );
}
