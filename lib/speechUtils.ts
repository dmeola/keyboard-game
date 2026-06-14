import type { LetterEntry, NumberEntry } from "./types";

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

const WIGGLE_MESSAGES = [
  "Wiggle your fingers! Shake your head! You're doing amazing!",
  "Stand up and do a little dance! Shake those sillies out!",
  "Stretch your arms up high! Now wiggle all ten fingers!",
  "Time for a wiggle break! Jump up and down three times!",
  "Wave your hands in the air like you just don't care!",
];

function canSpeak(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  );
}

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!canSpeak()) return;

  // Cancel any current speech before starting new utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 0.85;
  utterance.pitch = options.pitch ?? 1.2;
  utterance.volume = options.volume ?? 1.0;
  window.speechSynthesis.speak(utterance);
}

export function speakLetter(letter: string, entry: LetterEntry): void {
  if (!canSpeak()) return;

  const upper = letter.toUpperCase();
  // Pause markers via commas help pace the speech naturally for young children
  const text = `${upper}... ${entry.phoneme} sound... ${upper} is for ${entry.word}!`;
  speak(text, { rate: 0.8, pitch: 1.25 });
}

export function speakNumber(digit: number, entry: NumberEntry): void {
  if (!canSpeak()) return;

  window.speechSynthesis.cancel();

  const countPhrase =
    digit > 0
      ? ` Let's count! ${Array.from({ length: digit }, (_, i) => i + 1).join(", ")}!`
      : "";

  const text = `${entry.word}! ${digit}... ${entry.word}!${countPhrase}`;
  speak(text, { rate: 0.8, pitch: 1.2 });
}

export function speakWiggleBreak(): void {
  if (!canSpeak()) return;
  const message = WIGGLE_MESSAGES[Math.floor(Math.random() * WIGGLE_MESSAGES.length)];
  speak(message, { rate: 0.9, pitch: 1.3 });
}

export function speakWelcome(): void {
  if (!canSpeak()) return;
  speak("Welcome to KeyJr! Press any key to start!", { rate: 0.85, pitch: 1.2 });
}
