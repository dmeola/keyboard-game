import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { getFaceMetrics } from "./faceMetrics";
import { drawAppleFilter } from "./filters/appleFilter";
import { drawBalloonFilter } from "./filters/balloonFilter";
import { drawCatFilter } from "./filters/catFilter";
import { drawDogFilter } from "./filters/dogFilter";
import { drawElephantFilter } from "./filters/elephantFilter";
import { drawFishFilter } from "./filters/fishFilter";
import { drawGrapesFilter } from "./filters/grapesFilter";
import { drawHatFilter } from "./filters/hatFilter";
import { drawIceCreamFilter } from "./filters/iceCreamFilter";
import { drawJellyfishFilter } from "./filters/jellyfishFilter";
import { drawKiteFilter } from "./filters/kiteFilter";
import { drawLionFilter } from "./filters/lionFilter";
import { drawMoonFilter } from "./filters/moonFilter";
import { drawNoseFilter } from "./filters/noseFilter";
import { drawOrangeFilter } from "./filters/orangeFilter";
import { drawPenguinFilter } from "./filters/penguinFilter";
import { drawQueenFilter } from "./filters/queenFilter";
import { drawRainbowFilter } from "./filters/rainbowFilter";
import { drawStarFilter } from "./filters/starFilter";
import { drawTrainFilter } from "./filters/trainFilter";
import { drawUmbrellaFilter } from "./filters/umbrellaFilter";
import { drawVolcanoFilter } from "./filters/volcanoFilter";
import { drawWatermelonFilter } from "./filters/watermelonFilter";
import { drawXylophoneFilter } from "./filters/xylophoneFilter";
import { drawYarnFilter } from "./filters/yarnFilter";
import { drawZebraFilter } from "./filters/zebraFilter";

type FilterFn = (ctx: CanvasRenderingContext2D, metrics: ReturnType<typeof getFaceMetrics>) => void;

const FILTER_MAP: Record<string, FilterFn> = {
  A: drawAppleFilter,
  B: drawBalloonFilter,
  C: drawCatFilter,
  D: drawDogFilter,
  E: drawElephantFilter,
  F: drawFishFilter,
  G: drawGrapesFilter,
  H: drawHatFilter,
  I: drawIceCreamFilter,
  J: drawJellyfishFilter,
  K: drawKiteFilter,
  L: drawLionFilter,
  M: drawMoonFilter,
  N: drawNoseFilter,
  O: drawOrangeFilter,
  P: drawPenguinFilter,
  Q: drawQueenFilter,
  R: drawRainbowFilter,
  S: drawStarFilter,
  T: drawTrainFilter,
  U: drawUmbrellaFilter,
  V: drawVolcanoFilter,
  W: drawWatermelonFilter,
  X: drawXylophoneFilter,
  Y: drawYarnFilter,
  Z: drawZebraFilter,
};

/**
 * Draw the letter-themed AR filter on the canvas.
 * Must be called once per animation frame after drawing the video frame.
 */
export function drawLetterFilter(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  letter: string,
  canvasWidth: number,
  canvasHeight: number
): void {
  const key = letter.toUpperCase();
  const filterFn = FILTER_MAP[key];
  if (!filterFn) return;

  const metrics = getFaceMetrics(landmarks, canvasWidth, canvasHeight);
  filterFn(ctx, metrics);
}

/**
 * Fallback: draw a large emoji centered over estimated face position.
 * Used when MediaPipe fails to detect a face.
 */
export function drawEmojiFilter(
  ctx: CanvasRenderingContext2D,
  letter: string,
  canvasWidth: number,
  canvasHeight: number
): void {
  const EMOJI_MAP: Record<string, string> = {
    A: "🍎", B: "🎈", C: "🐱", D: "🐶", E: "🐘",
    F: "🐟", G: "🍇", H: "🎩", I: "🍦", J: "🪼",
    K: "🪁", L: "🦁", M: "🌙", N: "👃", O: "🍊",
    P: "🐧", Q: "👑", R: "🌈", S: "⭐", T: "🚂",
    U: "☂️", V: "🌋", W: "🍉", X: "🎵", Y: "🧶", Z: "🦓",
  };
  const emoji = EMOJI_MAP[letter.toUpperCase()] ?? "✨";
  const size = Math.min(canvasWidth, canvasHeight) * 0.4;
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, canvasWidth / 2, canvasHeight / 2);
}
