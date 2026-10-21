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

/** The clip currently playing — stopped whenever something new is spoken */
let currentAudio: HTMLAudioElement | null = null;
/** Bumped on every new utterance so stale clip sequences stop advancing */
let sequenceToken = 0;

function playAudioFile(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const audio = getAudio(src);
  if (currentAudio && currentAudio !== audio) currentAudio.pause();
  currentAudio = audio;
  audio.currentTime = 0;
  return audio.play();
}

/** Stops any clip or speech in progress so key presses never talk over each other. */
function stopSpeaking(): number {
  sequenceToken++;
  currentAudio?.pause();
  if (canSpeak()) window.speechSynthesis.cancel();
  return sequenceToken;
}

/** Preloads the audio clips used most often after the first user gesture. */
export function preloadAudio(): void {
  if (typeof window === "undefined") return;
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  [
    ...letters.map((l) => `/audio/letter-${l}.mp3`),
    ...letters.map((l) => `/audio/name-${l}.mp3`),
    ...numbers.map((n) => `/audio/number-${n}.mp3`),
    "/audio/welcome.mp3",
    "/audio/yes.mp3",
    "/audio/try-again.mp3",
    "/audio/look-for.mp3",
  ].forEach(
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
// Clip sequences — plays MP3s back to back; any clip that fails is spoken with
// the Web Speech API instead so the sequence still completes.
// ---------------------------------------------------------------------------

type Clip = {
  src: string;
  /** Fallback text — an array is spoken as separate phrases with pauses */
  text: string | string[];
};

const CLIP_GAP_MS = 150;

function playClips(clips: Clip[]): void {
  if (typeof window === "undefined") return;
  const token = stopSpeaking();

  const playAt = (i: number) => {
    if (token !== sequenceToken || i >= clips.length) return;
    const next = () => setTimeout(() => playAt(i + 1), CLIP_GAP_MS);
    const { src, text } = clips[i];
    const audio = getAudio(src);
    audio.onended = () => {
      if (token === sequenceToken) next();
    };
    playAudioFile(src).catch((err: unknown) => {
      // AbortError means a newer key press interrupted this clip — not a real failure
      if (err instanceof DOMException && err.name === "AbortError") return;
      speakFallback(Array.isArray(text) ? text : [text], token, next);
    });
  };

  playAt(0);
}

function speakFallback(parts: string[], token: number, onDone: () => void): void {
  if (!canSpeak()) {
    onDone();
    return;
  }
  const queue = [...parts];
  const speakNext = () => {
    if (token !== sequenceToken) return;
    const part = queue.shift();
    if (part === undefined) {
      onDone();
      return;
    }
    const utterance = makeUtterance(part, { rate: 0.8, pitch: 1.2 });
    utterance.onend = () => setTimeout(speakNext, 300);
    window.speechSynthesis.speak(utterance);
  };
  speakNext();
}

const letterClip = (letter: string, entry: LetterEntry): Clip => {
  const upper = letter.toUpperCase();
  return {
    src: `/audio/letter-${letter.toLowerCase()}.mp3`,
    text: [upper, `${toTtsPhoneme(entry.phoneme)} sound`, `${upper} is for ${entry.word}!`],
  };
};

const nameClip = (letter: string): Clip => ({
  src: `/audio/name-${letter.toLowerCase()}.mp3`,
  text: `${letter.toUpperCase()}!`,
});

const questClip = (letter: string, entry: LetterEntry): Clip => ({
  src: `/audio/quest-${letter.toLowerCase()}.mp3`,
  text: [`Can you find the letter ${letter.toUpperCase()}?`, `${letter.toUpperCase()} is for ${entry.word}!`],
});

const TRY_AGAIN: Clip = { src: "/audio/try-again.mp3", text: "Oops! Try again!" };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function speakLetter(letter: string, entry: LetterEntry): void {
  playClips([letterClip(letter, entry)]);
}

export function speakNumber(digit: number, entry: NumberEntry): void {
  const text: string[] = [`${entry.word}!`];
  if (digit > 0) {
    text.push("Let's count!");
    text.push(`${Array.from({ length: digit }, (_, i) => i + 1).join(", ")}!`);
  }
  playClips([{ src: `/audio/number-${digit}.mp3`, text }]);
}

/** Quest: Pip asks for a new target letter */
export function speakQuestPrompt(letter: string, entry: LetterEntry): void {
  playClips([questClip(letter, entry)]);
}

/** Quest: the child found the target */
export function speakQuestCorrect(letter: string): void {
  playClips([{ src: "/audio/yes.mp3", text: "Yes! You found it!" }, nameClip(letter)]);
}

/** Quest: wrong letter — name it, then repeat the request */
export function speakQuestWrong(pressed: string, target: string, targetEntry: LetterEntry): void {
  playClips([nameClip(pressed), TRY_AGAIN, questClip(target, targetEntry)]);
}

/** Spell: Pip introduces a new word */
export function speakSpellPrompt(word: string): void {
  const w = word.toLowerCase();
  playClips([{ src: `/audio/spell-${w}.mp3`, text: [`Let's spell ${w}!`, w] }]);
}

/** Spell: a correct letter — just say its name */
export function speakSpellLetter(letter: string): void {
  playClips([nameClip(letter)]);
}

/** Spell: wrong letter — name it and say which one to look for */
export function speakSpellWrong(pressed: string, expected: string): void {
  playClips([nameClip(pressed), TRY_AGAIN, { src: "/audio/look-for.mp3", text: "Look for" }, nameClip(expected)]);
}

/** Spell: the whole word is done */
export function speakSpellDone(word: string): void {
  const w = word.toLowerCase();
  playClips([{ src: `/audio/spelled-${w}.mp3`, text: [`You spelled ${w}!`, "Hooray!"] }]);
}

export function speakWelcome(): void {
  playClips([{ src: "/audio/welcome.mp3", text: ["Welcome to KeyJr!", "Press any key to start exploring!"] }]);
}

export function speakFocusModeExited(): void {
  stopSpeaking();
  speakSequence(
    ["Focus mode has ended.", "Press the button to go back to fullscreen."],
    { rate: 0.85, pitch: 1.0 }
  );
}
