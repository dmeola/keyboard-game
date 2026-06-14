const STORAGE_KEY = "keyjr_session";

type KeyRecord = {
  pressCount: number;
  lastSeenAt: number;
};

type SessionData = {
  keys: Record<string, KeyRecord>;
};

/** 0=unseen, 1=seen 1–2×, 2=seen 3–5×, 3=mastered 6+ */
export type MasteryLevel = 0 | 1 | 2 | 3;

function loadSession(): SessionData {
  if (typeof window === "undefined") return { keys: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { keys: {} };
    return JSON.parse(raw) as SessionData;
  } catch {
    return { keys: {} };
  }
}

function saveSession(data: SessionData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getKeyData(): Record<string, KeyRecord> {
  return loadSession().keys;
}

export function recordKeyPress(key: string): void {
  const data = loadSession();
  const normalized = key.toUpperCase();
  const existing = data.keys[normalized] ?? { pressCount: 0, lastSeenAt: 0 };
  data.keys[normalized] = {
    pressCount: existing.pressCount + 1,
    lastSeenAt: Date.now(),
  };
  saveSession(data);
}

export function getMasteryLevel(key: string): MasteryLevel {
  const data = loadSession();
  const record = data.keys[key.toUpperCase()];
  if (!record) return 0;
  const count = record.pressCount;
  if (count >= 6) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
