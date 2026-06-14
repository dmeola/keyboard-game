'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { LetterEntry, NumberEntry } from './types';

export type KeyType = 'letter' | 'number' | 'special' | null;
export type GameMode = 'explorer' | 'quest' | 'spell';

type GameContextValue = {
  activeKey: string | null;
  activeEntry: LetterEntry | NumberEntry | null;
  keyType: KeyType;
  pressCount: number;
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  setActiveKey: (key: string | null) => void;
  setActiveEntry: (entry: LetterEntry | NumberEntry | null) => void;
  setKeyType: (type: KeyType) => void;
  setPressCount: React.Dispatch<React.SetStateAction<number>>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<LetterEntry | NumberEntry | null>(null);
  const [keyType, setKeyType] = useState<KeyType>(null);
  const [pressCount, setPressCount] = useState(0);
  const [mode, setMode] = useState<GameMode>('explorer');

  return (
    <GameContext.Provider
      value={{
        activeKey,
        activeEntry,
        keyType,
        pressCount,
        mode,
        setMode,
        setActiveKey,
        setActiveEntry,
        setKeyType,
        setPressCount,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
