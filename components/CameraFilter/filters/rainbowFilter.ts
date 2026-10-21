import type { FaceMetrics } from "../faceMetrics";
import { drawCloud, drawSparkle } from "./shared";

export function drawRainbowFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const colors = ["#FF3D33", "#FF9800", "#FDD835", "#4CAF50", "#2196F3", "#9C27B0"];
  const bandW = u * 6.5;
  // Inner radius clears the top of the head so the arch frames the face
  const arcCY = u * 10;
  const innerR = u * 82;
  const outerR = innerR + bandW * colors.length;

  // Rainbow arch over the head, each band shimmering gently
  colors.forEach((color, i) => {
    const r = outerR - i * bandW;
    ctx.globalAlpha = 0.82 + Math.sin(m.time * 2.5 - i * 0.6) * 0.18;
    ctx.beginPath();
    ctx.arc(0, arcCY, r, Math.PI, 0);
    ctx.arc(0, arcCY, r - bandW, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Sparkles travel along the arch; more of them when the mouth opens
  const sparkleCount = m.mouthOpenRatio > 0.3 ? 5 : 2;
  const midR = (innerR + outerR) / 2;
  for (let i = 0; i < sparkleCount; i++) {
    const t = (m.time * 0.25 + i / sparkleCount) % 1;
    const a = Math.PI + t * Math.PI;
    drawSparkle(
      ctx,
      Math.cos(a) * midR,
      arcCY + Math.sin(a) * midR,
      u * (3 + Math.sin(m.time * 6 + i) * 1.2),
      "#FFFFFF"
    );
  }

  // Fluffy clouds at both ends
  const cloudR = u * 22;
  [-1, 1].forEach((side) => {
    drawCloud(ctx, side * midR, arcCY - u * 2, cloudR);
  });

  ctx.restore();
}
