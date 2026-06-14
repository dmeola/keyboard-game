'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { LetterEntry, NumberEntry } from '@/lib/types';

type KeyType = 'letter' | 'number' | 'special' | null;

interface KeyDisplayProps {
  pressedKey: string | null;
  entry: LetterEntry | NumberEntry | null;
  keyType: KeyType;
  pressSequence: number;
}

function bgClassToColor(bgClass: string): string {
  const match = bgClass.match(/^bg-(.+)$/);
  if (!match) return 'var(--color-sky-400)';
  return `var(--color-${match[1]})`;
}

// Sunny yellows and other very light backgrounds don't have enough contrast with white text.
const LIGHT_BG_CLASSES = new Set([
  'bg-sunny-50', 'bg-sunny-100', 'bg-sunny-200', 'bg-sunny-300', 'bg-sunny-400', 'bg-sunny-500',
  'bg-sky-50', 'bg-sky-100', 'bg-sky-200',
  'bg-coral-50', 'bg-coral-100',
  'bg-grass-50', 'bg-grass-100', 'bg-grass-200',
  'bg-orange-50', 'bg-orange-100', 'bg-orange-200', 'bg-orange-300',
]);

function textColorClass(bgClass: string): string {
  return LIGHT_BG_CLASSES.has(bgClass) ? 'text-gray-800' : 'text-white';
}

const SPECIAL_KEY_LABELS: Record<string, { label: string; emoji: string }> = {
  ' ': { label: 'Space', emoji: '⎵' },
  Enter: { label: 'Enter', emoji: '↵' },
  Backspace: { label: 'Delete', emoji: '⌫' },
  Shift: { label: 'Shift', emoji: '⇧' },
  CapsLock: { label: 'Caps Lock', emoji: '⇪' },
  Tab: { label: 'Tab', emoji: '⇥' },
  Escape: { label: 'Esc', emoji: '⎋' },
  ArrowUp: { label: 'Up', emoji: '↑' },
  ArrowDown: { label: 'Down', emoji: '↓' },
  ArrowLeft: { label: 'Left', emoji: '←' },
  ArrowRight: { label: 'Right', emoji: '→' },
  Control: { label: 'Ctrl', emoji: '⌃' },
  Alt: { label: 'Alt', emoji: '⌥' },
  Meta: { label: 'Cmd', emoji: '⌘' },
};

function buildAnnouncement(pressedKey: string | null, entry: LetterEntry | NumberEntry | null, keyType: KeyType): string {
  if (!pressedKey) return '';
  if (keyType === 'letter' && entry && 'word' in entry) {
    return `Letter ${pressedKey.toUpperCase()}, ${(entry as LetterEntry).word}`;
  }
  if (keyType === 'number' && entry && 'word' in entry) {
    return `Number ${pressedKey}, ${(entry as NumberEntry).word}`;
  }
  const specialInfo = SPECIAL_KEY_LABELS[pressedKey];
  return specialInfo ? specialInfo.label : pressedKey;
}

export default function KeyDisplay({ pressedKey, entry, keyType, pressSequence }: KeyDisplayProps) {
  const entryColor = entry && 'color' in entry ? entry.color : null;
  const color = entryColor ? bgClassToColor(entryColor) : 'var(--color-sky-400)';
  const textCls = entryColor ? textColorClass(entryColor) : 'text-white';

  const specialInfo = pressedKey ? SPECIAL_KEY_LABELS[pressedKey] : null;
  const announcement = buildAnnouncement(pressedKey, entry, keyType);

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[200px]">
      {/* Screen reader announcement — assertive so it interrupts immediately */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <AnimatePresence mode="wait">
        {pressedKey ? (
          <motion.div
            key={`${pressedKey}-${pressSequence}`}
            aria-hidden="true"
            initial={{ y: -80, scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
            exit={{ y: 40, scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
              opacity: { duration: 0.15 },
            }}
            className="flex flex-col items-center justify-center rounded-3xl shadow-2xl px-8 py-6 min-w-[180px]"
            style={{ backgroundColor: color }}
          >
            {keyType === 'letter' && entry && 'word' in entry && (
              <>
                <span
                  className={`font-heading font-bold ${textCls} leading-none drop-shadow-lg select-none`}
                  style={{ fontSize: 'clamp(4rem, 18vw, 9rem)' }}
                >
                  {pressedKey.toUpperCase()}
                </span>
                <span className={`font-heading font-semibold ${textCls} opacity-90 text-2xl md:text-3xl mt-1 select-none`}>
                  {(entry as LetterEntry).word}
                </span>
              </>
            )}

            {keyType === 'number' && entry && 'objects' in entry && (
              <>
                <span
                  className={`font-heading font-bold ${textCls} leading-none drop-shadow-lg select-none`}
                  style={{ fontSize: 'clamp(4rem, 18vw, 9rem)' }}
                >
                  {pressedKey}
                </span>
                <span className={`font-heading font-semibold ${textCls} opacity-90 text-2xl md:text-3xl mt-1 select-none`}>
                  {(entry as NumberEntry).word}
                </span>
              </>
            )}

            {keyType === 'special' && (
              <motion.div
                className="flex flex-col items-center"
                animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-7xl mb-2 select-none">
                  {specialInfo?.emoji ?? pressedKey}
                </span>
                <span className={`font-heading font-bold ${textCls} text-3xl select-none`}>
                  {specialInfo?.label ?? pressedKey}
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border-4 border-dashed border-sky-200 px-12 py-8 min-w-[180px]"
          >
            <span className="text-6xl mb-3 select-none">⌨️</span>
            <span className="font-heading text-sky-400 text-xl font-semibold text-center select-none">
              Press any key!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
