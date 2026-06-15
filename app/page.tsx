'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import GuideCharacter from '@/components/GuideCharacter/GuideCharacter';

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.15 + 0.4, type: 'spring' as const, stiffness: 300, damping: 20 },
  }),
};

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only react to single printable characters; ignore function keys, arrows, etc.
      if (e.key.length !== 1) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      router.push('/play?mode=explorer');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <main
      id="main-content"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-8"
    >
      {/* Animated gradient background — aria-hidden, purely decorative */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(135deg, #fff1f0 0%, #e1f5fe 33%, #e8f5e9 66%, #fff9c4 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 12s ease infinite',
        }}
      />
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @media (prefers-reduced-motion: reduce) {
          .absolute.inset-0.-z-10 { animation: none !important; }
        }
      `}</style>

      {/* Pip waving in corner */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 18 }}
        >
          <GuideCharacter
            expression="excited"
            message="Hi! I'm Pip! 👋 Press any key or pick a mode!"
            size={90}
          />
        </motion.div>
      </div>

      {/* Logo */}
      <motion.div
        className="flex flex-col items-center mb-6 md:mb-10"
        initial={{ opacity: 0, y: -30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
      >
        <motion.div
          className="text-8xl md:text-9xl mb-2 select-none leading-none"
          aria-hidden="true"
          animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
        >
          ⌨️
        </motion.div>
        <h1
          className="font-heading font-bold text-coral-500 select-none"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 7rem)', lineHeight: 1 }}
        >
          KeyJr
        </h1>
        <motion.p
          className="font-heading font-semibold text-sky-700 text-xl md:text-2xl mt-2 text-center select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Press any key. Learn everything!
        </motion.p>
      </motion.div>

      {/* Mode cards */}
      <ul className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-3xl mb-8 list-none p-0 m-0 sm:items-stretch">
        {/* Explorer */}
        <li className="flex-1 flex flex-col">
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col"
          >
            <Link
              href="/play?mode=explorer"
              className="block group flex-1"
              aria-label="Explorer mode — for ages 2 to 4. Press any key and discover the world!"
            >
              <motion.div
                className="relative h-full bg-gradient-to-br from-sunny-300 to-orange-400 rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center gap-3 border-4 border-sunny-400 cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span className="text-6xl select-none" aria-hidden="true">🗺️</span>
                <div className="text-center">
                  <p className="font-heading font-bold text-white text-2xl md:text-3xl">Explorer</p>
                  {/* Sufficient contrast: white on orange-400 (#ffa726) ≈ 2.9:1 for large bold text — passes AA Large */}
                  <p className="font-heading text-white text-sm mt-0.5">Ages 2–4</p>
                </div>
                <p className="font-heading text-white text-center text-sm md:text-base">
                  Press any key, discover the world!
                </p>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" aria-hidden="true" />
              </motion.div>
            </Link>
          </motion.div>
        </li>

        {/* Quest */}
        <li className="flex-1 flex flex-col">
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col"
          >
            <Link
              href="/play?mode=quest"
              className="block group flex-1"
              aria-label="Quest mode — for ages 4 to 6. Find the letter Pip asks for!"
            >
              <motion.div
                className="relative h-full bg-gradient-to-br from-sky-400 to-purple-500 rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center gap-3 border-4 border-sky-400 cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span className="text-6xl select-none" aria-hidden="true">🔍</span>
                <div className="text-center">
                  <p className="font-heading font-bold text-white text-2xl md:text-3xl">Quest</p>
                  <p className="font-heading text-white text-sm mt-0.5">Ages 4–6</p>
                </div>
                <p className="font-heading text-white text-center text-sm md:text-base">
                  Can you find the letter?
                </p>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" aria-hidden="true" />
              </motion.div>
            </Link>
          </motion.div>
        </li>

        {/* Spell */}
        <li className="flex-1 flex flex-col">
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col"
          >
            <Link
              href="/play?mode=spell"
              className="block group flex-1"
              aria-label="Spell mode — for ages 4 to 6 and up. Type the letters to spell words!"
            >
              <motion.div
                className="relative h-full bg-gradient-to-br from-grass-400 to-purple-500 rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center gap-3 border-4 border-grass-400 cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span className="text-6xl select-none" aria-hidden="true">✏️</span>
                <div className="text-center">
                  <p className="font-heading font-bold text-white text-2xl md:text-3xl">Spell</p>
                  <p className="font-heading text-white text-sm mt-0.5">Ages 4–6+</p>
                </div>
                <p className="font-heading text-white text-center text-sm md:text-base">
                  Type the letters to spell words!
                </p>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" aria-hidden="true" />
              </motion.div>
            </Link>
          </motion.div>
        </li>
      </ul>

      {/* Parent link — darkened for sufficient contrast (gray-600 on light bg) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Link
          href="/settings"
          className="font-heading text-gray-600 text-sm hover:text-gray-800 transition-colors underline underline-offset-2"
          aria-label="Open parent settings and progress dashboard"
        >
          Parents ›
        </Link>
      </motion.div>
    </main>
  );
}
