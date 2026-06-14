'use client';

import { motion } from 'framer-motion';
import type { MasteryLevel } from '@/lib/sessionStore';

interface KeyboardVisualProps {
  activeKey: string | null;
  masteryData: Record<string, number>;
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
  pressCount: number;
  rowColor: string;
  activeShadow: string;
}

function KeyCap({ label, isActive, pressCount, rowColor, activeShadow }: KeyCapProps) {
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
        width: 'clamp(26px, 2.6vw, 44px)',
        height: 'clamp(26px, 2.6vw, 44px)',
        fontSize: 'clamp(10px, 0.85vw, 14px)',
      }}
      animate={
        isActive
          ? { scale: [1, 1.25, 1.15], boxShadow: ['0 0 0 0 rgba(0,0,0,0)', '0 0 12px 4px rgba(99,179,237,0.7)', '0 0 8px 2px rgba(99,179,237,0.4)'] }
          : { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
      }
      transition={{ duration: 0.3, type: 'tween', ease: 'easeOut' }}
    >
      {label}

      {/* Mastery dot */}
      {mastery > 0 && (
        <span
          className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${dotColor}`}
        />
      )}
    </motion.div>
  );
}

export default function KeyboardVisual({ activeKey, masteryData }: KeyboardVisualProps) {
  const normalizedActive = activeKey?.toUpperCase() ?? null;

  return (
    /* Decorative keyboard visual — hidden from assistive technology */
    <div
      className="hidden md:flex flex-col items-center px-2 py-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-inner"
      style={{ gap: 'clamp(4px, 0.4vw, 8px)' }}
      aria-hidden="true"
    >
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex items-center" style={{ gap: 'clamp(4px, 0.4vw, 8px)' }}>
          {row.map((key) => {
            const count = masteryData[key] ?? 0;
            return (
              <KeyCap
                key={key}
                label={key}
                isActive={normalizedActive === key}
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
          width: 'clamp(120px, 13vw, 200px)',
          height: 'clamp(24px, 2.2vw, 36px)',
          fontSize: 'clamp(9px, 0.75vw, 12px)',
        }}
        animate={normalizedActive === ' ' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        SPACE
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-heading">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />New</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sunny-400 inline-block" />Learning</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Practiced</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-grass-500 inline-block" />Mastered</span>
      </div>
    </div>
  );
}
