'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import type { LetterEntry, NumberEntry } from '@/lib/types';
import { letterData } from '@/lib/letterData';
import { numberData } from '@/lib/numberData';
import { speakLetter, speakNumber, speakWiggleBreak } from '@/lib/speechUtils';
import { recordKeyPress, getKeyData } from '@/lib/sessionStore';
import { useGame } from '@/lib/gameContext';
import type { GameMode, KeyType } from '@/lib/gameContext';
import KeyDisplay from '@/components/KeyDisplay/KeyDisplay';
import LetterImage from '@/components/LetterImage/LetterImage';
import NumberDisplay from '@/components/NumberDisplay/NumberDisplay';
import GuideCharacter, { getPipMessage } from '@/components/GuideCharacter/GuideCharacter';
import type { PipExpression } from '@/components/GuideCharacter/GuideCharacter';
import KeyboardVisual from '@/components/KeyboardVisual/KeyboardVisual';
import SessionTimer from '@/components/SessionTimer/SessionTimer';

/* ── Camera filter integration point ─────────────────────────── */
// CameraFilter is built by a separate agent (components/CameraFilter/).
// It accepts { activeLetter: string | null } and handles webcam + face landmarks.
// We load it dynamically (SSR disabled) so the server build is never affected.
let CameraFilterComponent: React.ComponentType<{ activeLetter: string | null }> | null = null;

/* ── Confetti particle for Quest mode celebrations ────────────── */
const CONFETTI_COLORS = ['#FF6B63', '#29B6F6', '#FDD835', '#4CAF50', '#AB47BC'];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  size: number;
}

function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const p: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      y: 50,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      angle: Math.random() * 360,
      size: 6 + Math.random() * 10,
    }));
    setParticles(p);
    const t = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
          animate={{
            opacity: 0,
            y: -(200 + Math.random() * 300),
            x: (Math.random() - 0.5) * 300,
            rotate: p.angle + 360,
          }}
          transition={{ duration: 1.5 + Math.random() * 0.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ── Quest target panel ───────────────────────────────────────── */
function QuestTarget({ targetKey, entry }: { targetKey: string; entry: LetterEntry }) {
  return (
    <motion.div
      key={targetKey}
      className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border-2 border-sky-300"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
    >
      <span className="font-heading text-sm text-sky-600 font-bold">Find:</span>
      <span className="font-heading font-bold text-3xl text-sky-800">{targetKey.toUpperCase()}</span>
      <span className="text-3xl">{entry.emoji}</span>
      <span className="font-heading text-sky-600 text-sm">({entry.word})</span>
    </motion.div>
  );
}

/* ── Pick next quest target ───────────────────────────────────── */
function pickQuestTarget(exclude?: string): string {
  const keys = Object.keys(letterData);
  const keyData = getKeyData();
  const counts = keys.map((k) => ({ k, count: keyData[k]?.pressCount ?? 0 }));
  counts.sort((a, b) => a.count - b.count);
  const candidates = counts.slice(0, 13).map((x) => x.k).filter((k) => k !== exclude);
  if (candidates.length === 0) return keys[Math.floor(Math.random() * keys.length)];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/* ── Main play page inner (needs useSearchParams so wrapped in Suspense) */
function PlayPageInner() {
  const searchParams = useSearchParams();
  const urlMode = (searchParams.get('mode') as GameMode) ?? 'explorer';

  const { activeKey, activeEntry, keyType, pressCount, mode, setMode, setActiveKey, setActiveEntry, setKeyType, setPressCount } = useGame();

  const [pipExpression, setPipExpression] = useState<PipExpression>('idle');
  const [pipMessage, setPipMessage] = useState('Press any key to start! 🎉');
  const [masteryData, setMasteryData] = useState<Record<string, number>>({});
  const [showWiggle, setShowWiggle] = useState(false);
  const [wiggleAcked, setWiggleAcked] = useState(0);

  // Quest mode state
  const [questTarget, setQuestTarget] = useState<string>('');
  const [questEntry, setQuestEntry] = useState<LetterEntry | null>(null);
  const [questCorrect, setQuestCorrect] = useState(false);

  // Camera filter state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);

  // Tracks if wiggle has fired for this pressCount milestone
  const wiggleCountRef = useRef(0);

  /* Sync URL mode to context */
  useEffect(() => {
    setMode(urlMode);
  }, [urlMode, setMode]);

  /* Initialize quest target */
  useEffect(() => {
    if (urlMode === 'quest' && !questTarget) {
      const t = pickQuestTarget();
      setQuestTarget(t);
      setQuestEntry(letterData[t]);
    }
  }, [urlMode, questTarget]);

  /* Load mastery data */
  useEffect(() => {
    const data = getKeyData();
    const counts: Record<string, number> = {};
    Object.entries(data).forEach(([k, v]) => { counts[k] = v.pressCount; });
    setMasteryData(counts);
  }, [pressCount]);

  /* Load CameraFilter dynamically — gracefully degrades if unavailable */
  useEffect(() => {
    import('@/components/CameraFilter/CameraFilter')
      .then((mod) => {
        CameraFilterComponent = mod.default as React.ComponentType<{ activeLetter: string | null }>;
        setCameraAvailable(true);
      })
      .catch(() => {
        setCameraAvailable(false);
      });
  }, []);

  const handleWiggleAck = useCallback(() => {
    setWiggleAcked(pressCount);
  }, [pressCount]);

  const wiggleShouldShow = pressCount > 0 && pressCount % 8 === 0 && pressCount !== wiggleAcked;

  /* Core key handler */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // Ignore modifier-only presses and repeats
      if (e.repeat) return;
      if (['Meta', 'Control', 'Alt'].includes(e.key) && !e.code.startsWith('Arrow')) return;

      const raw = e.key;
      const upper = raw.toUpperCase();
      let type: KeyType = 'special';
      let entry: LetterEntry | NumberEntry | null = null;

      if (/^[a-zA-Z]$/.test(raw)) {
        type = 'letter';
        entry = letterData[upper] ?? null;
      } else if (/^[0-9]$/.test(raw)) {
        type = 'number';
        entry = numberData[parseInt(raw, 10)] ?? null;
      }

      setActiveKey(raw);
      setActiveEntry(entry);
      setKeyType(type);

      // Speech
      if (type === 'letter' && entry) {
        speakLetter(upper, entry as LetterEntry);
      } else if (type === 'number' && entry) {
        speakNumber(parseInt(raw, 10), entry as NumberEntry);
      }

      // Session store
      recordKeyPress(raw);
      setPressCount((c) => c + 1);

      // Pip messages
      const { expression, message } = getPipMessage(raw, entry, type);

      // Quest mode logic
      if (urlMode === 'quest' && type === 'letter') {
        const isCorrect = upper === questTarget.toUpperCase();
        if (isCorrect) {
          setPipExpression('celebrate');
          setPipMessage(`🎉 YES! ${upper} is right! Amazing!`);
          setQuestCorrect(true);
          setTimeout(() => {
            setQuestCorrect(false);
            const next = pickQuestTarget(upper);
            setQuestTarget(next);
            setQuestEntry(letterData[next]);
            setPipExpression('curious');
            setPipMessage(`Now find the letter ${next}! ${letterData[next]?.emoji}`);
          }, 2500);
        } else {
          setPipExpression('nudge');
          setPipMessage(`That's ${upper}… ${letterData[upper]?.word ?? ''}! Try again! Hint: ${questEntry?.word ?? ''} starts with ${questTarget}!`);
        }
      } else {
        setPipExpression(expression);
        setPipMessage(message);
      }
    },
    [urlMode, questTarget, questEntry, setActiveKey, setActiveEntry, setKeyType, setPressCount]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  /* Wiggle break TTS */
  useEffect(() => {
    if (wiggleShouldShow && wiggleCountRef.current !== pressCount) {
      wiggleCountRef.current = pressCount;
      speakWiggleBreak();
    }
  }, [wiggleShouldShow, pressCount]);

  const isLetter = keyType === 'letter';
  const isNumber = keyType === 'number';

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #fff9e6 0%, #e8f5ff 40%, #fdf0ff 80%, #f0fff4 100%)',
      }}
    >
      {/* Confetti for quest correct */}
      <Confetti active={questCorrect} />

      {/* Camera filter overlay */}
      <AnimatePresence>
        {cameraActive && CameraFilterComponent && (
          <motion.div
            className="fixed top-0 right-0 w-64 h-48 z-30 rounded-bl-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <CameraFilterComponent
              activeLetter={keyType === 'letter' && activeKey ? activeKey.toUpperCase() : null}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top bar ───────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-3 pb-1 gap-2">
        {/* Back + camera toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-heading text-sm text-gray-400 hover:text-gray-600 transition-colors bg-white/60 rounded-xl px-3 py-1.5"
          >
            ← Home
          </Link>
          {cameraAvailable && (
            <motion.button
              className={`font-heading text-sm rounded-xl px-3 py-1.5 transition-colors ${cameraActive ? 'bg-coral-400 text-white' : 'bg-white/60 text-gray-500 hover:bg-white/80'}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCameraActive((v) => !v)}
            >
              📷 Filter
            </motion.button>
          )}
        </div>

        {/* Quest target */}
        {urlMode === 'quest' && questTarget && questEntry && (
          <QuestTarget targetKey={questTarget} entry={questEntry} />
        )}

        {/* Session progress stars */}
        <SessionTimer
          pressCount={pressCount}
          onWiggleAcknowledged={handleWiggleAck}
        />
      </div>

      {/* ── Main content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 px-3 pb-3">
        {/* Pip + KeyDisplay row */}
        <div className="flex items-start gap-3 flex-wrap md:flex-nowrap">
          {/* Pip */}
          <div className="shrink-0 pt-2">
            <AnimatePresence mode="wait">
              <GuideCharacter
                key={pipMessage}
                expression={pipExpression}
                message={pipMessage}
                size={100}
              />
            </AnimatePresence>
          </div>

          {/* KeyDisplay — takes remaining space */}
          <div className="flex-1 min-h-[180px] flex items-center justify-center">
            <KeyDisplay
              pressedKey={activeKey}
              entry={activeEntry}
              keyType={keyType}
            />
          </div>
        </div>

        {/* Letter or number content */}
        <div className="flex-1 flex items-center justify-center min-h-[180px]">
          <AnimatePresence mode="wait">
            {isLetter && (
              <motion.div key="letter-view" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LetterImage entry={activeEntry as LetterEntry | null} />
              </motion.div>
            )}
            {isNumber && (
              <motion.div key="number-view" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NumberDisplay entry={activeEntry as NumberEntry | null} />
              </motion.div>
            )}
            {!isLetter && !isNumber && (
              <motion.div
                key="idle"
                className="flex flex-col items-center gap-2 opacity-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
              >
                <span className="text-7xl select-none">🌟</span>
                <p className="font-heading text-gray-400 text-lg">Press a key!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Keyboard visual */}
        <div className="flex justify-center mt-auto">
          <KeyboardVisual
            activeKey={activeKey}
            masteryData={masteryData}
          />
        </div>
      </div>

      {/* Wiggle break overlay (rendered by SessionTimer) */}
      {wiggleShouldShow && (
        <SessionTimer
          pressCount={pressCount}
          onWiggleAcknowledged={handleWiggleAck}
        />
      )}
    </div>
  );
}

/* Wrap in Suspense because useSearchParams requires it in App Router */
export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-sky-50">
          <span className="font-heading text-3xl text-sky-400 animate-pulse">Loading...</span>
        </div>
      }
    >
      <PlayPageInner />
    </Suspense>
  );
}
