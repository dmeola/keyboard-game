import { letterData } from "@/lib/letterData";
import { toFaceFrame } from "./faceMetrics";
import type { FaceMetrics, RawFaceMetrics } from "./faceMetrics";
import { drawSparkle } from "./filters/shared";
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

type FilterFn = (ctx: CanvasRenderingContext2D, metrics: FaceMetrics) => void;

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

/** Springy overshoot for the filter popping on when a new letter is pressed */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** A sparkle on whichever eye is winking — works on every filter */
function drawWinkSparkle(ctx: CanvasRenderingContext2D, m: FaceMetrics): void {
  const closed = 0.3;
  const open = 0.6;
  let eye = null;
  if (m.eyeOpenLeft < closed && m.eyeOpenRight > open) eye = m.leftEye;
  else if (m.eyeOpenRight < closed && m.eyeOpenLeft > open) eye = m.rightEye;
  if (!eye) return;
  const pulse = 1 + Math.sin(m.time * 12) * 0.15;
  drawSparkle(ctx, eye.x + m.u * 12, eye.y - m.u * 10, m.u * 9 * pulse, "#FFF176");
  drawSparkle(ctx, eye.x + m.u * 22, eye.y - m.u * 2, m.u * 5 * pulse, "#FFFFFF");
}

export interface FilterFrameOptions {
  /** Seconds since the camera started */
  time: number;
  /** 0→1 progress of the pop-in animation after a letter change */
  appear: number;
  canvasW: number;
  canvasH: number;
}

/**
 * Draw the letter-themed AR filter on the canvas, positioned, tilted and
 * scaled to the face. Call once per frame after drawing the video frame.
 */
export function drawLetterFilter(
  ctx: CanvasRenderingContext2D,
  raw: RawFaceMetrics,
  letter: string,
  { time, appear, canvasW, canvasH }: FilterFrameOptions
): void {
  const filterFn = FILTER_MAP[letter.toUpperCase()];
  if (!filterFn) return;

  const m = toFaceFrame(raw, time, canvasW, canvasH);
  const scale = easeOutBack(Math.min(1, Math.max(0, appear)));

  ctx.save();
  ctx.translate(raw.center.x, raw.center.y);
  ctx.rotate(raw.roll);
  ctx.scale(scale, scale);
  filterFn(ctx, m);
  drawWinkSparkle(ctx, m);
  ctx.restore();
}

/**
 * Fallback: draw a large emoji centered on the canvas.
 * Used when MediaPipe doesn't find a face.
 */
export function drawEmojiFilter(
  ctx: CanvasRenderingContext2D,
  letter: string,
  canvasWidth: number,
  canvasHeight: number
): void {
  const emoji = letterData[letter.toUpperCase()]?.emoji ?? "✨";
  const size = Math.min(canvasWidth, canvasHeight) * 0.4;
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, canvasWidth / 2, canvasHeight / 2);
}
