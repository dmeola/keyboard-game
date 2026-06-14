import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface FaceMetrics {
  cx: number;
  cy: number;
  faceWidth: number;
  faceHeight: number;
  mouthOpenRatio: number;
  eyeOpenLeft: number;
  eyeOpenRight: number;
  canvasW: number;
  canvasH: number;
}

/**
 * Extract useful face geometry from MediaPipe normalized landmarks.
 * All landmark coords are 0-1 (normalized); we convert to canvas pixels.
 */
export function getFaceMetrics(
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number
): FaceMetrics {
  const lm = (idx: number) => ({
    x: landmarks[idx].x * canvasW,
    y: landmarks[idx].y * canvasH,
  });

  const noseTip = lm(1);
  const forehead = lm(10);
  const chin = lm(152);
  const leftEyeOuter = lm(33);
  const rightEyeOuter = lm(263);

  // Mouth open: distance between upper (13) and lower (14) inner lip landmarks
  const mouthTop = lm(13);
  const mouthBottom = lm(14);
  const mouthLeft = lm(61);
  const mouthRight = lm(291);
  const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
  const mouthGap = Math.abs(mouthBottom.y - mouthTop.y);
  const mouthOpenRatio = mouthWidth > 0 ? Math.min(1, mouthGap / (mouthWidth * 0.6)) : 0;

  // Eye open: use upper (159/386) and lower (145/374) eyelid landmarks
  // Left eye
  const leftEyeTop = lm(159);
  const leftEyeBottom = lm(145);
  const leftEyeWidth = Math.abs(lm(33).x - lm(133).x);
  const leftEyeOpen = leftEyeWidth > 0
    ? Math.min(1, Math.abs(leftEyeBottom.y - leftEyeTop.y) / (leftEyeWidth * 0.35))
    : 1;

  // Right eye
  const rightEyeTop = lm(386);
  const rightEyeBottom = lm(374);
  const rightEyeWidth = Math.abs(lm(362).x - lm(263).x);
  const rightEyeOpen = rightEyeWidth > 0
    ? Math.min(1, Math.abs(rightEyeBottom.y - rightEyeTop.y) / (rightEyeWidth * 0.35))
    : 1;

  const cx = noseTip.x;
  const cy = (forehead.y + chin.y) / 2;
  const faceHeight = Math.abs(chin.y - forehead.y);
  const faceWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x) * 1.6;

  return {
    cx,
    cy,
    faceWidth,
    faceHeight,
    mouthOpenRatio,
    eyeOpenLeft: leftEyeOpen,
    eyeOpenRight: rightEyeOpen,
    canvasW,
    canvasH,
  };
}
