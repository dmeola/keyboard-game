'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getKeyData, clearSession, getMasteryLevel } from '@/lib/sessionStore';
import type { MasteryLevel } from '@/lib/sessionStore';
import { letterData } from '@/lib/letterData';
import { numberData } from '@/lib/numberData';
import type { GameMode } from '@/lib/gameContext';

const MASTERY_COLORS: Record<MasteryLevel, string> = {
  0: 'bg-gray-100 border-gray-200 text-gray-400',
  1: 'bg-sunny-200 border-sunny-300 text-sunny-800',
  2: 'bg-orange-200 border-orange-300 text-orange-800',
  3: 'bg-grass-200 border-grass-300 text-grass-800',
};

const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: 'New',
  1: 'Learning',
  2: 'Practiced',
  3: 'Mastered',
};

interface KeyTileProps {
  label: string;
  mastery: MasteryLevel;
  pressCount: number;
}

function KeyTile({ label, mastery, pressCount }: KeyTileProps) {
  return (
    <motion.div
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 font-heading font-bold cursor-default select-none ${MASTERY_COLORS[mastery]}`}
      style={{ width: 48, height: 52 }}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      title={`${label}: ${pressCount} presses — ${MASTERY_LABELS[mastery]}`}
    >
      <span className="text-lg leading-none">{label}</span>
      {pressCount > 0 && (
        <span className="text-xs mt-0.5 leading-none opacity-70">{pressCount}</span>
      )}
    </motion.div>
  );
}

export default function SettingsPage() {
  const [keyData, setKeyData] = useState<Record<string, { pressCount: number; lastSeenAt: number }>>({});
  const [mode, setMode] = useState<GameMode>('explorer');
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setKeyData(getKeyData());
    const saved = localStorage.getItem('keyjr_mode') as GameMode | null;
    if (saved) setMode(saved);
  }, []);

  const handleModeChange = (m: GameMode) => {
    setMode(m);
    localStorage.setItem('keyjr_mode', m);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearSession();
    setKeyData({});
    setConfirmClear(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const letterKeys = Object.keys(letterData);
  const digitKeys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const learnedLetters = letterKeys.filter((k) => (keyData[k]?.pressCount ?? 0) > 0);
  const learnedDigits = digitKeys.filter((d) => (keyData[String(d)]?.pressCount ?? 0) > 0);
  const totalPresses = Object.values(keyData).reduce((sum, v) => sum + v.pressCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-gray-700">
              Parent Corner 👨‍👩‍👧
            </h1>
            <p className="font-heading text-gray-400 text-sm mt-1">Track progress and adjust settings</p>
          </div>
          <Link
            href="/"
            className="font-heading text-sm text-sky-500 hover:text-sky-700 transition-colors bg-white rounded-xl px-4 py-2 shadow-sm border border-sky-100"
          >
            ← Back
          </Link>
        </div>

        {/* Summary card */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-heading font-bold text-xl text-gray-700 mb-3">Today's Summary</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center bg-sky-50 rounded-xl px-4 py-3 min-w-[80px]">
              <span className="font-heading font-bold text-2xl text-sky-600">{learnedLetters.length}</span>
              <span className="font-heading text-xs text-sky-400">Letters</span>
            </div>
            <div className="flex flex-col items-center bg-sunny-50 rounded-xl px-4 py-3 min-w-[80px]">
              <span className="font-heading font-bold text-2xl text-sunny-700">{learnedDigits.length}</span>
              <span className="font-heading text-xs text-sunny-600">Numbers</span>
            </div>
            <div className="flex flex-col items-center bg-grass-50 rounded-xl px-4 py-3 min-w-[80px]">
              <span className="font-heading font-bold text-2xl text-grass-700">{totalPresses}</span>
              <span className="font-heading text-xs text-grass-600">Key Presses</span>
            </div>
            <div className="flex flex-col items-center bg-purple-50 rounded-xl px-4 py-3 min-w-[80px]">
              <span className="font-heading font-bold text-2xl text-purple-600">
                {letterKeys.filter((k) => getMasteryLevel(k) === 3).length}
              </span>
              <span className="font-heading text-xs text-purple-400">Mastered</span>
            </div>
          </div>
          {learnedLetters.length > 0 && (
            <p className="font-heading text-gray-500 text-sm mt-3">
              Today you practiced: <span className="font-bold text-gray-700">{learnedLetters.join(', ')}</span>
              {learnedDigits.length > 0 && ` and numbers ${learnedDigits.join(', ')}`}!
            </p>
          )}
          {learnedLetters.length === 0 && (
            <p className="font-heading text-gray-400 text-sm mt-3">No presses yet — go play! 🎮</p>
          )}
        </motion.div>

        {/* Letter mastery heatmap */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-heading font-bold text-xl text-gray-700 mb-4">Letter Mastery</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {letterKeys.map((k) => (
              <KeyTile
                key={k}
                label={k}
                mastery={getMasteryLevel(k)}
                pressCount={keyData[k]?.pressCount ?? 0}
              />
            ))}
          </div>

          {/* Number heatmap */}
          <h2 className="font-heading font-bold text-xl text-gray-700 mt-6 mb-4">Number Mastery</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {digitKeys.map((d) => (
              <KeyTile
                key={d}
                label={String(d)}
                mastery={getMasteryLevel(String(d))}
                pressCount={keyData[String(d)]?.pressCount ?? 0}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {([0, 1, 2, 3] as MasteryLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded-md border-2 ${MASTERY_COLORS[level]}`} />
                <span className="font-heading text-xs text-gray-500">{MASTERY_LABELS[level]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mode controls */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-heading font-bold text-xl text-gray-700 mb-1">Default Mode</h2>
          <p className="font-heading text-gray-400 text-sm mb-4">Set the starting mode when the child opens the app</p>
          <div className="flex gap-3">
            <motion.button
              className={`flex-1 font-heading font-semibold rounded-xl py-3 px-4 border-2 transition-colors ${
                mode === 'explorer'
                  ? 'bg-sunny-300 border-sunny-400 text-sunny-900'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleModeChange('explorer')}
            >
              🗺️ Explorer
              <br />
              <span className="text-xs font-normal">Ages 2–4</span>
            </motion.button>
            <motion.button
              className={`flex-1 font-heading font-semibold rounded-xl py-3 px-4 border-2 transition-colors ${
                mode === 'quest'
                  ? 'bg-sky-300 border-sky-400 text-sky-900'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleModeChange('quest')}
            >
              🔍 Quest
              <br />
              <span className="text-xs font-normal">Ages 4–6</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Clear progress */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-heading font-bold text-xl text-gray-700 mb-1">Reset Progress</h2>
          <p className="font-heading text-gray-400 text-sm mb-4">
            Clears all key press history and mastery levels. This cannot be undone.
          </p>
          {cleared ? (
            <p className="font-heading text-grass-600 font-semibold">✅ Progress cleared successfully!</p>
          ) : (
            <div className="flex items-center gap-3">
              <motion.button
                className={`font-heading font-semibold rounded-xl px-6 py-2.5 border-2 transition-colors ${
                  confirmClear
                    ? 'bg-coral-500 border-coral-600 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200'
                }`}
                whileTap={{ scale: 0.97 }}
                onClick={handleClear}
              >
                {confirmClear ? '⚠️ Yes, clear everything' : '🗑️ Clear all progress'}
              </motion.button>
              {confirmClear && (
                <button
                  className="font-heading text-sm text-gray-400 hover:text-gray-600"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
