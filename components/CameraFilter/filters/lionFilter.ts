import type { FaceMetrics } from "../faceMetrics";

export function drawLionFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const maneR = m.faceWidth * 0.72;

  // Fluffy mane — draw many overlapping arcs for irregular edge
  const spikes = 18;
  ctx.beginPath();
  for (let i = 0; i < spikes; i++) {
    const angle = (i / spikes) * Math.PI * 2;
    const nextAngle = ((i + 0.5) / spikes) * Math.PI * 2;
    const outerR = maneR * (0.88 + Math.sin(i * 2.7) * 0.12);
    const innerR = maneR * 0.72;
    ctx.arc(
      m.cx + Math.cos(angle) * innerR,
      m.cy + Math.sin(angle) * innerR,
      maneR * 0.28,
      angle + Math.PI,
      nextAngle + Math.PI
    );
    void outerR;
  }
  ctx.fillStyle = "#F57F17";
  ctx.fill();

  // Mane base circle
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, maneR * 0.75, 0, Math.PI * 2);
  const maneGrad = ctx.createRadialGradient(m.cx, m.cy, maneR * 0.3, m.cx, m.cy, maneR * 0.75);
  maneGrad.addColorStop(0, "#FDD835");
  maneGrad.addColorStop(1, "#F57F17");
  ctx.fillStyle = maneGrad;
  ctx.fill();

  // Small round ears on top
  const earY = m.cy - maneR * 0.65;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(m.cx + side * maneR * 0.5, earY, maneR * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "#FDD835";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.cx + side * maneR * 0.5, earY, maneR * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "#FFCC80";
    ctx.fill();
  });

  // Nose
  const noseY = m.cy + m.faceHeight * 0.1;
  ctx.beginPath();
  ctx.ellipse(m.cx, noseY, 16, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#E65100";
  ctx.fill();

  // Roar / mouth open when open
  const mouthY = noseY + 14;
  if (m.mouthOpenRatio > 0.35) {
    ctx.beginPath();
    ctx.ellipse(m.cx, mouthY + 12, 28 * m.mouthOpenRatio, 20 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#BF360C";
    ctx.fill();
    // Teeth
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(m.cx - 16, mouthY + 4, 12, 10);
    ctx.fillRect(m.cx + 4, mouthY + 4, 12, 10);
  } else {
    ctx.beginPath();
    ctx.arc(m.cx, mouthY, 22, 0.15, Math.PI - 0.15);
    ctx.strokeStyle = "#BF360C";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Whisker dots
  ctx.fillStyle = "#5D4037";
  [[-40, -6], [-50, 2], [-40, 10], [40, -6], [50, 2], [40, 10]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(m.cx + dx, noseY + dy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}
