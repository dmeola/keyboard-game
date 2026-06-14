'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import type { LetterEntry, NumberEntry } from '@/lib/types';
import { letterData } from '@/lib/letterData';
import { numberData } from '@/lib/numberData';
import { speakLetter, speakNumber, speakFocusModeExited, preloadAudio } from '@/lib/speechUtils';
import {
  resumeAudioContext,
  playKeyPressSound,
  playCelebrationSound,
} from '@/lib/audioUtils';
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
import SpellDisplay from '@/components/SpellDisplay/SpellDisplay';
import { wordList } from '@/lib/wordData';
import type { WordEntry } from '@/lib/wordData';

/* ── Camera filter integration point ─────────────────────────── */
let CameraFilterComponent: React.ComponentType<{ activeLetter: string | null; isActive?: boolean }> | null = null;

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
    <div className="fixed inset-0 pointer-events-none z-40" aria-hidden="true">
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
      role="status"
      aria-label={`Find the letter ${targetKey.toUpperCase()}, ${entry.word}`}
    >
      <span className="font-heading text-sm text-sky-600 font-bold">Find:</span>
      <span className="font-heading font-bold text-3xl text-sky-800">{targetKey.toUpperCase()}</span>
      <span className="text-3xl" aria-hidden="true">{entry.emoji}</span>
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

/* ── Pick next spelling word (random, avoid immediate repeat) ── */
function pickSpellWord(exclude?: string): WordEntry {
  const candidates = wordList.filter((w) => w.word !== exclude);
  const pool = candidates.length > 0 ? candidates : wordList;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── Mobile on-screen alphabet grid ──────────────────────────── */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGITS = '0123456789'.split('');

const TOUCH_KEY_COLORS = [
  'bg-coral-400', 'bg-sky-400', 'bg-grass-400', 'bg-sunny-400',
  'bg-purple-400', 'bg-orange-400',
];

interface TouchKeyboardProps {
  onKey: (key: string) => void;
}

function TouchKeyboard({ onKey }: TouchKeyboardProps) {
  return (
    <div className="md:hidden w-full px-2 pb-4" aria-label="On-screen keyboard">
      <p className="font-heading text-center text-gray-400 text-xs mb-2">Tap a letter or number!</p>
      {/* Letters */}
      <div className="grid grid-cols-5 gap-[clamp(4px,1.5vw,8px)] mb-2">
        {ALPHABET.map((letter, i) => (
          <motion.button
            key={letter}
            className={`${TOUCH_KEY_COLORS[i % TOUCH_KEY_COLORS.length]} text-white font-heading font-bold rounded-xl shadow-md active:shadow-sm select-none`}
            style={{ fontSize: 'clamp(13px, 3.5vw, 20px)', padding: 'clamp(5px, 1.5vw, 10px) 0' }}
            whileTap={{ scale: 0.88 }}
            onClick={() => onKey(letter.toLowerCase())}
            aria-label={`Letter ${letter}`}
          >
            {letter}
          </motion.button>
        ))}
      </div>
      {/* Digits */}
      <div className="grid grid-cols-5 gap-[clamp(4px,1.5vw,8px)]">
        {DIGITS.map((d) => (
          <motion.button
            key={d}
            className="bg-sky-500 text-white font-heading font-bold rounded-xl shadow-md active:shadow-sm select-none"
            style={{ fontSize: 'clamp(13px, 3.5vw, 20px)', padding: 'clamp(5px, 1.5vw, 10px) 0' }}
            whileTap={{ scale: 0.88 }}
            onClick={() => onKey(d)}
            aria-label={`Number ${d}`}
          >
            {d}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ── Main play page inner (needs useSearchParams so wrapped in Suspense) */
function PlayPageInner() {
  const searchParams = useSearchParams();
  const urlMode = (searchParams.get('mode') as GameMode) ?? 'explorer';

  const { activeKey, activeEntry, keyType, pressCount, mode, setMode, setActiveKey, setActiveEntry, setKeyType, setPressCount } = useGame();

  const [pipExpression, setPipExpression] = useState<PipExpression>('idle');
  const [pipMessage, setPipMessage] = useState('Press any key to start! 🎉');
  const [masteryData, setMasteryData] = useState<Record<string, number>>({});

  // Quest mode state
  const [questTarget, setQuestTarget] = useState<string>('');
  const [questEntry, setQuestEntry] = useState<LetterEntry | null>(null);
  const [questCorrect, setQuestCorrect] = useState(false);

  // Spell mode state
  const [spellEntry, setSpellEntry] = useState<WordEntry | null>(null);
  const [spellIndex, setSpellIndex] = useState(0);
  const [spellCorrect, setSpellCorrect] = useState(false);

  // Camera filter state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);

  // Background tint for key press animation
  const [bgTint, setBgTint] = useState<string | null>(null);

  // Focus mode (fullscreen lock for young kids)
  const [focusMode, setFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRequestedRef = useRef(false);

  // Audio has been resumed
  const audioResumedRef = useRef(false);

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

  /* Initialize spell word + intro message */
  useEffect(() => {
    if (urlMode === 'spell' && !spellEntry) {
      const w = pickSpellWord();
      setSpellEntry(w);
      setSpellIndex(0);
      setPipExpression('curious');
      setPipMessage(`Let's spell ${w.word}! ${w.emoji} Start with ${w.word[0]}!`);
    }
  }, [urlMode, spellEntry]);

  /* Load mastery data */
  useEffect(() => {
    const data = getKeyData();
    const counts: Record<string, number> = {};
    Object.entries(data).forEach(([k, v]) => { counts[k] = v.pressCount; });
    setMasteryData(counts);
  }, [pressCount]);

  /* Read focus mode setting on mount */
  useEffect(() => {
    setFocusMode(localStorage.getItem('keyjr_focus') === 'true');
  }, []);

  /* Listen for fullscreen exit — announce and surface re-enter button */
  useEffect(() => {
    const handleFsChange = () => {
      const nowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(nowFullscreen);
      if (!nowFullscreen && focusMode && fullscreenRequestedRef.current) {
        speakFocusModeExited();
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [focusMode]);

  const enterFullscreen = useCallback(() => {
    if (typeof document === 'undefined' || !document.fullscreenEnabled) return;
    fullscreenRequestedRef.current = true;
    document.documentElement
      .requestFullscreen()
      .then(() => setIsFullscreen(true))
      .catch(() => {});
  }, []);

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

  /* Shared key processing logic — used by keyboard and touch */
  const processKey = useCallback(
    (raw: string) => {
      // Enter fullscreen on first interaction when focus mode is enabled
      if (focusMode && !fullscreenRequestedRef.current) {
        enterFullscreen();
      }

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

      // Background tint from entry color
      if (entry && 'color' in entry) {
        const colorVar = (entry.color as string).replace(/^bg-/, '').replace(/-\d+$/, '');
        setBgTint(`var(--color-${(entry.color as string).replace(/^bg-/, '')})`);
        setTimeout(() => setBgTint(null), 1200);
      } else {
        setBgTint(null);
      }

      // Audio
      playKeyPressSound(type);

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
          playCelebrationSound();
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
      } else if (urlMode === 'spell' && spellEntry) {
        if (type === 'letter') {
          const expected = spellEntry.word[spellIndex];
          if (upper === expected) {
            const nextIndex = spellIndex + 1;
            const wordComplete = nextIndex >= spellEntry.word.length;
            setSpellIndex(nextIndex);

            if (wordComplete) {
              playCelebrationSound();
              setPipExpression('celebrate');
              setPipMessage(`🎉 You spelled ${spellEntry.word}! ${spellEntry.emoji} Amazing!`);
              setSpellCorrect(true);
              setTimeout(() => {
                setSpellCorrect(false);
                const nextWord = pickSpellWord(spellEntry.word);
                setSpellEntry(nextWord);
                setSpellIndex(0);
                setPipExpression('curious');
                setPipMessage(`Now spell ${nextWord.word}! ${nextWord.emoji} Start with ${nextWord.word[0]}!`);
              }, 2500);
            } else {
              const nextLetter = spellEntry.word[nextIndex];
              setPipExpression('happy');
              setPipMessage(`Yes! ${upper}! Now press ${nextLetter}!`);
            }
          } else {
            setPipExpression('nudge');
            setPipMessage(`That's ${upper}. We need ${expected} next! Try again!`);
          }
        } else if (type === 'number') {
          setPipExpression('curious');
          setPipMessage(`We're spelling words! Try pressing a letter — ${spellEntry.word[spellIndex]}!`);
        } else {
          setPipExpression(expression);
          setPipMessage(message);
        }
      } else {
        setPipExpression(expression);
        setPipMessage(message);
      }
    },
    [urlMode, questTarget, questEntry, spellEntry, spellIndex, focusMode, enterFullscreen, setActiveKey, setActiveEntry, setKeyType, setPressCount]
  );

  /* Core keyboard handler */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (['Meta', 'Control', 'Alt'].includes(e.key) && !e.code.startsWith('Arrow')) return;

      // Resume audio on first gesture
      if (!audioResumedRef.current) {
        resumeAudioContext();
        preloadAudio();
        audioResumedRef.current = true;
      }

      processKey(e.key);
    },
    [processKey]
  );

  /* Touch key handler */
  const handleTouchKey = useCallback(
    (key: string) => {
      if (!audioResumedRef.current) {
        resumeAudioContext();
        preloadAudio();
        audioResumedRef.current = true;
      }
      processKey(key);
    },
    [processKey]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const isLetter = keyType === 'letter';
  const isNumber = keyType === 'number';

  return (
    <motion.main
      id="main-content"
      className="relative min-h-screen flex flex-col overflow-x-hidden overflow-y-auto"
      style={{
        background: bgTint
          ? `linear-gradient(160deg, ${bgTint}22 0%, #e8f5ff 40%, #fdf0ff 80%, #f0fff4 100%)`
          : 'linear-gradient(160deg, #fff9e6 0%, #e8f5ff 40%, #fdf0ff 80%, #f0fff4 100%)',
        transition: 'background 0.6s ease',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <h1 className="sr-only">
        {urlMode === 'quest'
          ? 'KeyJr — Quest Mode'
          : urlMode === 'spell'
            ? 'KeyJr — Spell Mode'
            : 'KeyJr — Explorer Mode'}
      </h1>
      {/* Confetti for quest correct or spell word completion */}
      <Confetti active={questCorrect || spellCorrect} />

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
              isActive={cameraActive}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top bar ───────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-3 pb-1 gap-2 flex-wrap">
        {/* Back + camera toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-heading text-sm text-sky-700 hover:text-sky-900 transition-colors bg-white rounded-xl px-3 py-2 shadow-sm border border-sky-100"
            aria-label="Go back to home"
          >
            ← Home
          </Link>
          {focusMode && !isFullscreen && (
            <motion.button
              className="font-heading text-sm bg-sky-500 text-white rounded-xl px-3 py-1.5 shadow-sm hover:bg-sky-600 transition-colors"
              whileTap={{ scale: 0.95 }}
              onClick={enterFullscreen}
              aria-label="Re-enter fullscreen focus mode"
            >
              <span aria-hidden="true">⛶</span> Go Fullscreen
            </motion.button>
          )}
          {cameraAvailable && (
            <motion.button
              className={`font-heading text-sm rounded-xl px-3 py-1.5 transition-colors ${cameraActive ? 'bg-coral-400 text-white' : 'bg-white/60 text-gray-500 hover:bg-white/80'}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCameraActive((v) => !v)}
              aria-label={cameraActive ? 'Turn off camera filter' : 'Turn on camera filter'}
              aria-pressed={cameraActive}
            >
              📷 Filter
            </motion.button>
          )}
        </div>

        {/* Quest target */}
        {urlMode === 'quest' && questTarget && questEntry && (
          <QuestTarget targetKey={questTarget} entry={questEntry} />
        )}

        {/* Spell target */}
        {urlMode === 'spell' && spellEntry && (
          <SpellDisplay
            word={spellEntry.word}
            revealedCount={spellIndex}
            emoji={spellEntry.emoji}
          />
        )}

        {/* Session progress stars */}
        <SessionTimer pressCount={pressCount} />
      </div>

      {/* ── Main content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 px-3 pb-3">
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

          {/* KeyDisplay + image + keyboard — all in one column so they share the same center */}
          <div className="flex-1 flex flex-col gap-3">
            {/* KeyDisplay — fixed min-height to prevent layout reflow */}
            <div className="min-h-[200px] flex items-center justify-center">
              <KeyDisplay
                pressedKey={activeKey}
                entry={activeEntry}
                keyType={keyType}
                pressSequence={pressCount}
                fadeOut={urlMode === 'quest' || urlMode === 'spell'}
              />
            </div>

            {/* Letter or number content — fixed min-height */}
            <div className="flex items-center justify-center min-h-[180px]">
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
                    <span className="text-7xl select-none" aria-hidden="true">🌟</span>
                    <p className="font-heading text-gray-400 text-lg">Press a key!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Keyboard visual — desktop */}
            <div className="hidden md:flex justify-center">
              <KeyboardVisual
                activeKey={activeKey}
                masteryData={masteryData}
              />
            </div>
          </div>
        </div>

        {/* Touch keyboard — mobile only */}
        <TouchKeyboard onKey={handleTouchKey} />
      </div>

    </motion.main>
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
