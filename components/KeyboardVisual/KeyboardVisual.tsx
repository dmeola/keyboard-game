'use client';

import { motion } from 'framer-motion';
import type { MasteryLevel } from '@/lib/sessionStore';

interface KeyboardVisualProps {
  activeKey: string | null;
  masteryData: Record<string, number>;
  /** Key to pulse as a hint (Quest/Spell after a couple of wrong tries) */
  hintKey?: string | null;
}

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const ROW_COLORS = [
  'bg-purple-100 border-purple-300',
  'bg-sky-100 border-sky-300',
  'bg-grass-100 border-grass-300',
  'bg-coral-100 border-coral-300',
];

const ROW_ACTIVE_SHADOW = [
  'shadow-purple-300',
  'shadow-sky-300',
  'shadow-grass-300',
  'shadow-coral-300',
];

function getMasteryDotColor(count: number): string {
  if (count === 0) return 'bg-gray-300';
  if (count < 3) return 'bg-sunny-400';
  if (count < 6) return 'bg-orange-400';
  return 'bg-grass-500';
}

function getMasteryLevel(count: number): MasteryLevel {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  return 3;
}

interface KeyCapProps {
  label: string;
  isActive: boolean;
  isHint: boolean;
  pressCount: number;
  rowColor: string;
  activeShadow: string;
}

function KeyCap({ label, isActive, isHint, pressCount, rowColor, activeShadow }: KeyCapProps) {
  const mastery = getMasteryLevel(pressCount);
  const dotColor = getMasteryDotColor(pressCount);

  return (
    <motion.div
      className={`
        relative flex items-center justify-center rounded-lg border-2 font-heading font-bold
        text-gray-700 cursor-default select-none transition-colors
        ${rowColor}
        ${isActive ? `shadow-lg ${activeShadow} scale-105 ring-2 ring-offset-1` : ''}
      `}
      style={{
        width: 'var(--key)',
        height: 'var(--key)',
        fontSize: 'calc(var(--key) * 0.36)',
        borderRadius: 'calc(var(--key) * 0.22)',
        // Outline, not a Tailwind ring: the glow animation below owns box-shadow
        outline: isHint ? 'calc(var(--key) * 0.09) solid var(--color-sunny-500)' : undefined,
        outlineOffset: isHint ? 'calc(var(--key) * 0.06)' : undefined,
      }}
      animate={
        isActive
          ? { scale: [1, 1.25, 1.15], boxShadow: ['0 0 0 0 rgba(0,0,0,0)', '0 0 12px 4px rgba(99,179,237,0.7)', '0 0 8px 2px rgba(99,179,237,0.4)'] }
          : isHint
            ? { scale: [1, 1.18, 1], boxShadow: ['0 0 0 0 rgba(253,216,53,0)', '0 0 16px 6px rgba(253,216,53,0.8)', '0 0 0 0 rgba(253,216,53,0)'] }
            : { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
      }
      transition={
        isHint && !isActive
          ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.3, type: 'tween', ease: 'easeOut' }
      }
    >
      {label}

      {/* Mastery dot */}
      {mastery > 0 && (
        <span
          className={`absolute rounded-full ${dotColor}`}
          style={{
            right: 'calc(var(--key) * 0.08)',
            bottom: 'calc(var(--key) * 0.08)',
            width: 'calc(var(--key) * 0.16)',
            height: 'calc(var(--key) * 0.16)',
          }}
        />
      )}
    </motion.div>
  );
}

export default function KeyboardVisual({ activeKey, masteryData, hintKey = null }: KeyboardVisualProps) {
  const normalizedActive = activeKey?.toUpperCase() ?? null;
  const normalizedHint = hintKey?.toUpperCase() ?? null;

  return (
    /* Decorative keyboard visual — hidden from assistive technology */
    <div
      className="keyboard-visual hidden md:flex flex-col items-center bg-white/60 backdrop-blur-sm rounded-2xl shadow-inner"
      style={{ gap: 'calc(var(--key) * 0.14)', padding: 'calc(var(--key) * 0.25) calc(var(--key) * 0.35)' }}
      aria-hidden="true"
    >
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex items-center" style={{ gap: 'calc(var(--key) * 0.14)' }}>
          {row.map((key) => {
            const count = masteryData[key] ?? 0;
            return (
              <KeyCap
                key={key}
                label={key}
                isActive={normalizedActive === key}
                isHint={normalizedHint === key}
                pressCount={count}
                rowColor={ROW_COLORS[rowIdx]}
                activeShadow={ROW_ACTIVE_SHADOW[rowIdx]}
              />
            );
          })}
        </div>
      ))}

      {/* Space bar */}
      <motion.div
        className={`
          flex items-center justify-center rounded-lg border-2 font-heading font-semibold
          text-xs text-gray-500 cursor-default select-none bg-gray-100 border-gray-300
          ${normalizedActive === ' ' || normalizedActive === 'SPACE' ? 'ring-2 ring-sky-400' : ''}
        `}
        style={{
          width: 'calc(var(--key) * 5)',
          height: 'calc(var(--key) * 0.8)',
          fontSize: 'calc(var(--key) * 0.28)',
        }}
        animate={normalizedActive === ' ' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        SPACE
      </motion.div>

      {/* Legend */}
      <div
        className="flex items-center gap-3 mt-1 text-gray-500 font-heading"
        style={{ fontSize: 'clamp(11px, calc(var(--key) * 0.28), 15px)' }}
      >
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />New</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sunny-400 inline-block" />Learning</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Practiced</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-grass-500 inline-block" />Mastered</span>
      </div>
    </div>
  );
}
