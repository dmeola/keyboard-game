/**
 * Web Audio API sound effects for KeyJr.
 * All functions are SSR-safe and create an AudioContext lazily on first use.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return ctx;
}

/** Call this on the first user gesture to unlock the AudioContext on iOS/Safari. */
export function resumeAudioContext(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => { /* ignore */ });
  }
}

function playTone(
  frequency: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = 'sine',
  startTime?: number,
): void {
  const c = getCtx();
  if (!c) return;

  const start = startTime ?? c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainPeak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gain);
  gain.connect(c.destination);

  osc.start(start);
  osc.stop(start + duration + 0.01);
}

/** Short pleasant tone on every key press — different pitches per key type. */
export function playKeyPressSound(keyType: 'letter' | 'number' | 'special'): void {
  if (typeof window === 'undefined') return;
  const freqMap: Record<'letter' | 'number' | 'special', number> = {
    letter: 523,   // C5
    number: 659,   // E5
    special: 392,  // G4
  };
  playTone(freqMap[keyType], 0.18, 0.25, 'sine');
}

/** Ascending arpeggio played on Quest correct answers. */
export function playCelebrationSound(): void {
  if (typeof window === 'undefined') return;
  const c = getCtx();
  if (!c) return;

  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  const now = c.currentTime;
  notes.forEach((freq, i) => {
    playTone(freq, 0.22, 0.28, 'sine', now + i * 0.12);
  });
}

/** Gentle descending tone — used for wrong answer / error. Not harsh or scary. */
export function playErrorSound(): void {
  if (typeof window === 'undefined') return;
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, c.currentTime);
  osc.frequency.linearRampToValueAtTime(330, c.currentTime + 0.3);

  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(c.destination);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.4);
}
