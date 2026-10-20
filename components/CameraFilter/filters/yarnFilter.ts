import type { FaceMetrics } from "../faceMetrics";
import { chinY, faceRx, faceRy, headTop } from "./shared";

const YARN_COLORS = ["#F48FB1", "#CE93D8", "#FF80AB", "#EA80FC", "#B39DDB"];

/** A yarn ball with wound-thread texture */
function drawYarnBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, base: string, u: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = base;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.bezierCurveTo(
      x + Math.cos(a + 0.7) * r * 0.5, y + Math.sin(a + 0.7) * r * 0.5,
      x + Math.cos(a + 1.5) * r * 0.5, y + Math.sin(a + 1.5) * r * 0.5,
      x + Math.cos(a + Math.PI) * r, y + Math.sin(a + Math.PI) * r
    );
    ctx.strokeStyle = YARN_COLORS[i % YARN_COLORS.length];
    ctx.lineWidth = u * (i % 2 === 0 ? 1.6 : 1.1);
    ctx.stroke();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = "#E91E63";
  ctx.lineWidth = u * 1.5;
  ctx.stroke();
}

export function drawYarnFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const ovalY = m.faceHeight * 0.02;
  const rx = faceRx(m);
  const ry = faceRy(m);
  const open = m.mouthOpenRatio > 0.3;
  // Mouth open → the buns bounce
  const bounce = open ? -Math.abs(Math.sin(m.time * 10)) * u * 6 * m.mouthOpenRatio : 0;

  // Woolly hair: wavy strands hugging the top of the head, outside the face oval
  ctx.lineCap = "round";
  for (let k = 0; k < 5; k++) {
    const scale = 1.03 + k * 0.06;
    ctx.beginPath();
    for (let s = 0; s <= 40; s++) {
      const a = Math.PI * (1.02 + (s / 40) * 0.96);
      const wave = Math.sin(s * 1.3 + k) * u * 1.8;
      const x = Math.cos(a) * (rx * scale + wave);
      const y = ovalY + Math.sin(a) * (ry * scale + wave);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = YARN_COLORS[k % YARN_COLORS.length];
    ctx.lineWidth = u * 4;
    ctx.stroke();
  }

  // Loose strand dangling from the right bun, swaying beside the face
  const bunY = headTop(m) + u * 4 + bounce;
  const bunX = rx * 0.85;
  const sway = Math.sin(m.time * 2) * u * 5 * (open ? 2 : 1);
  ctx.beginPath();
  ctx.moveTo(bunX + u * 18, bunY + u * 14);
  ctx.bezierCurveTo(
    rx + u * 28 + sway, 0,
    rx + u * 8 - sway, chinY(m) * 0.6,
    rx + u * 16 + sway, chinY(m) + u * 10
  );
  ctx.strokeStyle = "#F48FB1";
  ctx.lineWidth = u * 2;
  ctx.stroke();

  // Yarn-ball buns
  drawYarnBall(ctx, -bunX, bunY, u * 26, "#FDD835", u);
  drawYarnBall(ctx, bunX, bunY, u * 26, "#81D4FA", u);
  drawYarnBall(ctx, 0, headTop(m) - u * 10 + bounce * 0.6, u * 20, "#A5D6A7", u);

  // Knitting needles poking out of the left bun
  [[-0.5, "#8D6E63"], [-1.1, "#A1887F"]].forEach(([angle, color]) => {
    ctx.save();
    ctx.translate(-bunX, bunY);
    ctx.rotate(angle as number);
    ctx.fillStyle = color as string;
    ctx.fillRect(-u, -u * 44, u * 2, u * 38);
    ctx.beginPath();
    ctx.arc(0, -u * 45, u * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}
