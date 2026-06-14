'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { LetterEntry, NumberEntry } from '@/lib/types';

type KeyType = 'letter' | 'number' | 'special' | null;

interface KeyDisplayProps {
  pressedKey: string | null;
  entry: LetterEntry | NumberEntry | null;
  keyType: KeyType;
}

function bgClassToColor(bgClass: string): string {
  const match = bgClass.match(/^bg-(.+)$/);
  if (!match) return 'var(--color-sky-400)';
  return `var(--color-${match[1]})`;
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

export default function KeyDisplay({ pressedKey, entry, keyType }: KeyDisplayProps) {
  const color =
    entry && 'color' in entry
      ? bgClassToColor(entry.color)
      : 'var(--color-sky-400)';

  const specialInfo = pressedKey ? SPECIAL_KEY_LABELS[pressedKey] : null;

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[200px]">
      <AnimatePresence mode="wait">
        {pressedKey ? (
          <motion.div
            key={`${pressedKey}-${Date.now()}`}
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
                  className="font-heading font-bold text-white leading-none drop-shadow-lg select-none"
                  style={{ fontSize: 'clamp(4rem, 18vw, 9rem)' }}
                >
                  {pressedKey.toUpperCase()}
                </span>
                <span className="font-heading font-semibold text-white/90 text-2xl md:text-3xl mt-1 select-none">
                  {(entry as LetterEntry).word}
                </span>
              </>
            )}

            {keyType === 'number' && entry && 'objects' in entry && (
              <>
                <span
                  className="font-heading font-bold text-white leading-none drop-shadow-lg select-none"
                  style={{ fontSize: 'clamp(4rem, 18vw, 9rem)' }}
                >
                  {pressedKey}
                </span>
                <span className="font-heading font-semibold text-white/90 text-2xl md:text-3xl mt-1 select-none">
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
                <span className="font-heading font-bold text-white text-3xl select-none">
                  {specialInfo?.label ?? pressedKey}
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
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
