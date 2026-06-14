import type { LetterEntry, NumberEntry } from "./types";

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

// ---------------------------------------------------------------------------
// Audio file playback (pre-generated with Samantha voice — sounds natural)
// ---------------------------------------------------------------------------

const audioCache = new Map<string, HTMLAudioElement>();

function getAudio(src: string): HTMLAudioElement {
  if (!audioCache.has(src)) {
    const el = new Audio(src);
    el.preload = "auto";
    audioCache.set(src, el);
  }
  return audioCache.get(src)!;
}

function playAudioFile(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const audio = getAudio(src);
  audio.currentTime = 0;
  return audio.play();
}

/** Preloads all letter and number audio files after the first user gesture. */
export function preloadAudio(): void {
  if (typeof window === "undefined") return;
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  [...letters.map((l) => `/audio/letter-${l}.mp3`), ...numbers.map((n) => `/audio/number-${n}.mp3`), "/audio/welcome.mp3"].forEach(
    (src) => getAudio(src) // instantiates + sets preload="auto"
  );
}

// ---------------------------------------------------------------------------
// Phoneme → TTS mapping
// Repeated-consonant phonemes (rrr, lll, …) are read as letter names by TTS
// engines. These "with-schwa" forms are standard phonics representations that
// any TTS engine can pronounce as the intended consonant sound.
// ---------------------------------------------------------------------------

const PHONEME_TO_TTS: Record<string, string> = {
  fff: 'fuh',
  lll: 'luh',
  nnn: 'nuh',
  rrr: 'ruh',
  sss: 'suh',
  vvv: 'vuh',
  zzz: 'zuh',
  ksss: 'ks',
};

function toTtsPhoneme(phoneme: string): string {
  return PHONEME_TO_TTS[phoneme] ?? phoneme;
}

// ---------------------------------------------------------------------------
// Web Speech API fallback (used for dynamic text like Pip messages)
// ---------------------------------------------------------------------------

function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoice: SpeechSynthesisVoice | null | undefined = undefined;

/** Picks the best available voice, preferring natural/neural options. */
function getBestVoice(): SpeechSynthesisVoice | null {
  if (!canSpeak()) return null;
  if (cachedVoice !== undefined) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null; // not loaded yet — resolved on next call

  const preferred = [
    "Samantha",                                                           // macOS — warm, natural
    "Karen",                                                              // macOS Australian
    "Google US English",                                                  // Chrome
    "Microsoft Aria Online (Natural) - English (United States)",          // Edge neural
    "Microsoft Jenny Online (Natural) - English (United States)",         // Edge neural
    "Microsoft Zira - English (United States)",                           // Edge
  ];

  for (const name of preferred) {
    const match = voices.find((v) => v.name === name);
    if (match) {
      cachedVoice = match;
      return match;
    }
  }

  // Fallback: first en-US voice, then any English voice
  cachedVoice =
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;
  return cachedVoice;
}

function makeUtterance(text: string, options: SpeakOptions): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 0.85;
  utterance.pitch = options.pitch ?? 1.15;
  utterance.volume = options.volume ?? 1.0;

  const voice = getBestVoice();
  if (voice) utterance.voice = voice;

  if (!voice) {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => { cachedVoice = undefined; },
      { once: true }
    );
  }

  return utterance;
}

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(makeUtterance(text, options));
}

/**
 * Speaks each part as a separate utterance with a pause between them.
 * Produces natural spacing rather than one long run-together sentence.
 */
export function speakSequence(parts: string[], options: SpeakOptions = {}, pauseMs = 300): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();

  const queue = [...parts];

  function speakNext() {
    if (queue.length === 0) return;
    const utterance = makeUtterance(queue.shift()!, options);
    utterance.onend = () => {
      if (queue.length > 0) setTimeout(speakNext, pauseMs);
    };
    window.speechSynthesis.speak(utterance);
  }

  speakNext();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function speakLetter(letter: string, _entry: LetterEntry): void {
  const src = `/audio/letter-${letter.toLowerCase()}.mp3`;
  playAudioFile(src).catch((err: unknown) => {
    // AbortError means the previous play was interrupted by a new key press — not a real failure
    if (err instanceof DOMException && err.name === 'AbortError') return;
    const upper = letter.toUpperCase();
    speakSequence(
      [upper, `${toTtsPhoneme(_entry.phoneme)} sound`, `${upper} is for ${_entry.word}!`],
      { rate: 0.8, pitch: 1.2 }
    );
  });
}

export function speakNumber(digit: number, _entry: NumberEntry): void {
  const src = `/audio/number-${digit}.mp3`;
  playAudioFile(src).catch((err: unknown) => {
    // AbortError means the previous play was interrupted by a new key press — not a real failure
    if (err instanceof DOMException && err.name === 'AbortError') return;
    if (!canSpeak()) return;
    const parts = [`${_entry.word}!`, `${digit}`, `${_entry.word}!`];
    if (digit > 0) {
      parts.push("Let's count!");
      parts.push(`${Array.from({ length: digit }, (_, i) => i + 1).join(", ")}!`);
    }
    speakSequence(parts, { rate: 0.8, pitch: 1.2 });
  });
}

export function speakWelcome(): void {
  playAudioFile("/audio/welcome.mp3").catch(() => {
    speakSequence(
      ["Welcome to KeyJr!", "Press any key to start exploring!"],
      { rate: 0.85, pitch: 1.1 }
    );
  });
}

export function speakFocusModeExited(): void {
  speakSequence(
    ["Focus mode has ended.", "Press the button to go back to fullscreen."],
    { rate: 0.85, pitch: 1.0 }
  );
}
