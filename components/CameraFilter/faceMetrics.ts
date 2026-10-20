import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface Point {
  x: number;
  y: number;
}

/**
 * Face geometry handed to every filter.
 *
 * Filters draw in an upright "face frame": the renderer has already translated
 * the canvas to the face centre and rotated it by the head tilt, so
 * `cx`/`cy` are 0 and every feature point below is relative to the centre.
 * Size everything in multiples of `u` (1/100 of the face width) so filters
 * look the same whether the child is near or far from the camera.
 */
export interface FaceMetrics {
  cx: number;
  cy: number;
  /** Cheek-to-cheek width in pixels */
  faceWidth: number;
  /** Forehead-top-to-chin height in pixels */
  faceHeight: number;
  /** faceWidth / 100 — the unit for every size in a filter */
  u: number;
  /** Head tilt in radians (already applied by the renderer) */
  roll: number;
  nose: Point;
  mouth: Point;
  /** Eye on the left of the screen */
  leftEye: Point;
  /** Eye on the right of the screen */
  rightEye: Point;
  /** 0 = closed, 1 = wide open */
  mouthOpenRatio: number;
  eyeOpenLeft: number;
  eyeOpenRight: number;
  /** Seconds since the camera started — for idle animation */
  time: number;
  canvasW: number;
  canvasH: number;
}

/** Raw measurements in canvas pixels, before the face-frame transform */
export interface RawFaceMetrics {
  center: Point;
  faceWidth: number;
  faceHeight: number;
  roll: number;
  nose: Point;
  mouth: Point;
  eyeA: Point;
  eyeB: Point;
  eyeOpenA: number;
  eyeOpenB: number;
  mouthOpenRatio: number;
}

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/**
 * Extract face geometry from MediaPipe normalized landmarks (0–1) in canvas
 * pixels. Distances use Euclidean length so they stay stable when the head tilts.
 */
export function measureFace(
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number
): RawFaceMetrics {
  const lm = (idx: number): Point => ({
    x: landmarks[idx].x * canvasW,
    y: landmarks[idx].y * canvasH,
  });

  const forehead = lm(10);
  const chin = lm(152);
  const cheekA = lm(234);
  const cheekB = lm(454);

  // Head tilt from the outer eye corners, normalised so it works whether or
  // not the landmarks were mirrored for the selfie view.
  const eyeOuterA = lm(33);
  const eyeOuterB = lm(263);
  let dx = eyeOuterB.x - eyeOuterA.x;
  let dy = eyeOuterB.y - eyeOuterA.y;
  if (dx < 0) {
    dx = -dx;
    dy = -dy;
  }
  const roll = Math.atan2(dy, dx);

  const mouthTop = lm(13);
  const mouthBottom = lm(14);
  const mouthWidth = dist(lm(61), lm(291));
  const mouthOpenRatio = mouthWidth > 0 ? Math.min(1, dist(mouthTop, mouthBottom) / (mouthWidth * 0.6)) : 0;

  const eyeOpen = (top: number, bottom: number, inner: number, outer: number) => {
    const w = dist(lm(inner), lm(outer));
    return w > 0 ? Math.min(1, dist(lm(top), lm(bottom)) / (w * 0.35)) : 1;
  };

  return {
    center: mid(forehead, chin),
    faceWidth: dist(cheekA, cheekB),
    faceHeight: dist(forehead, chin),
    roll,
    nose: lm(1),
    mouth: mid(mouthTop, mouthBottom),
    eyeA: mid(lm(33), lm(133)),
    eyeB: mid(lm(263), lm(362)),
    eyeOpenA: eyeOpen(159, 145, 133, 33),
    eyeOpenB: eyeOpen(386, 374, 362, 263),
    mouthOpenRatio,
  };
}

/**
 * Exponential smoothing for landmark jitter. Large movements pass through
 * quickly (high alpha); small wobbles are damped (low alpha).
 */
export function createFaceSmoother(): {
  smooth: (raw: RawFaceMetrics) => RawFaceMetrics;
  reset: () => void;
} {
  let prev: RawFaceMetrics | null = null;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lerpPt = (a: Point, b: Point, t: number): Point => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

  return {
    smooth(raw) {
      if (!prev) {
        prev = raw;
        return raw;
      }
      // Adapt to speed: a fast head movement relative to face size needs less lag
      const move = dist(prev.center, raw.center) / Math.max(1, raw.faceWidth);
      const a = Math.min(0.85, 0.35 + move * 4);
      const next: RawFaceMetrics = {
        center: lerpPt(prev.center, raw.center, a),
        faceWidth: lerp(prev.faceWidth, raw.faceWidth, a),
        faceHeight: lerp(prev.faceHeight, raw.faceHeight, a),
        roll: lerp(prev.roll, raw.roll, a),
        nose: lerpPt(prev.nose, raw.nose, a),
        mouth: lerpPt(prev.mouth, raw.mouth, a),
        eyeA: lerpPt(prev.eyeA, raw.eyeA, a),
        eyeB: lerpPt(prev.eyeB, raw.eyeB, a),
        // Expressions should feel instant
        eyeOpenA: lerp(prev.eyeOpenA, raw.eyeOpenA, 0.7),
        eyeOpenB: lerp(prev.eyeOpenB, raw.eyeOpenB, 0.7),
        mouthOpenRatio: lerp(prev.mouthOpenRatio, raw.mouthOpenRatio, 0.7),
      };
      prev = next;
      return next;
    },
    reset() {
      prev = null;
    },
  };
}

/** Convert raw measurements into the upright, centre-origin face frame */
export function toFaceFrame(raw: RawFaceMetrics, time: number, canvasW: number, canvasH: number): FaceMetrics {
  const cos = Math.cos(-raw.roll);
  const sin = Math.sin(-raw.roll);
  const local = (p: Point): Point => {
    const x = p.x - raw.center.x;
    const y = p.y - raw.center.y;
    return { x: x * cos - y * sin, y: x * sin + y * cos };
  };

  const eyeA = local(raw.eyeA);
  const eyeB = local(raw.eyeB);
  const aIsLeft = eyeA.x <= eyeB.x;

  return {
    cx: 0,
    cy: 0,
    faceWidth: raw.faceWidth,
    faceHeight: raw.faceHeight,
    u: raw.faceWidth / 100,
    roll: raw.roll,
    nose: local(raw.nose),
    mouth: local(raw.mouth),
    leftEye: aIsLeft ? eyeA : eyeB,
    rightEye: aIsLeft ? eyeB : eyeA,
    mouthOpenRatio: raw.mouthOpenRatio,
    eyeOpenLeft: aIsLeft ? raw.eyeOpenA : raw.eyeOpenB,
    eyeOpenRight: aIsLeft ? raw.eyeOpenB : raw.eyeOpenA,
    time,
    canvasW,
    canvasH,
  };
}
