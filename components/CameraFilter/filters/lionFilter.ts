import type { FaceMetrics } from "../faceMetrics";
import { faceRx, faceRy, fillWithFaceHole } from "./shared";

export function drawLionFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const maneRx = faceRx(m) * 1.6;
  const maneRy = faceRy(m) * 1.4;
  const maneCY = m.faceHeight * 0.02;

  // Fluffy mane outline: puffy bumps around an oval
  const spikes = 20;
  const maneOutline = (scale: number) => () => {
    for (let i = 0; i <= spikes; i++) {
      const a = (i / spikes) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * maneRx * scale;
      const y = maneCY + Math.sin(a) * maneRy * scale;
      if (i === 0) {
        ctx.moveTo(x, y);
        continue;
      }
      const ca = ((i - 0.5) / spikes) * Math.PI * 2 - Math.PI / 2;
      const puff = 1.16 + Math.sin(i * 2.7 + m.time * 1.5) * 0.04;
      ctx.quadraticCurveTo(
        Math.cos(ca) * maneRx * scale * puff,
        maneCY + Math.sin(ca) * maneRy * scale * puff,
        x,
        y
      );
    }
    ctx.closePath();
  };

  // Outer dark layer, then lighter inner layer — both leave the face clear
  fillWithFaceHole(ctx, m, maneOutline(1), "#E65100", 1.05);
  const grad = ctx.createRadialGradient(0, maneCY, faceRx(m), 0, maneCY, maneRx);
  grad.addColorStop(0, "#FDD835");
  grad.addColorStop(1, "#F57F17");
  fillWithFaceHole(ctx, m, maneOutline(0.82), grad, 1.05);

  // Round ears on top of the mane
  const earY = maneCY - maneRy * 0.92;
  [-1, 1].forEach((side) => {
    const ex = side * maneRx * 0.5;
    ctx.beginPath();
    ctx.arc(ex, earY, u * 12, 0, Math.PI * 2);
    ctx.fillStyle = "#F9A825";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex, earY, u * 7, 0, Math.PI * 2);
    ctx.fillStyle = "#FFCC80";
    ctx.fill();
  });

  // Small lion nose on the child's nose
  const nx = m.nose.x;
  const ny = m.nose.y;
  ctx.beginPath();
  ctx.moveTo(nx - u * 6, ny - u * 2.5);
  ctx.quadraticCurveTo(nx, ny - u * 4.5, nx + u * 6, ny - u * 2.5);
  ctx.quadraticCurveTo(nx + u * 1.5, ny + u * 3.5, nx, ny + u * 4);
  ctx.quadraticCurveTo(nx - u * 1.5, ny + u * 3.5, nx - u * 6, ny - u * 2.5);
  ctx.fillStyle = "#6D3B1F";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(nx - u * 1.8, ny - u * 2.2, u * 1.6, u * 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fill();

  // Whisker dots beside the nose
  ctx.fillStyle = "#5D4037";
  [[12, 3], [16, 6], [12, 9]].forEach(([dx, dy]) => {
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(nx + side * u * dx, ny + u * dy, u * 1.3, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // ROAR! Fangs at the mouth corners and motion lines when the mouth opens
  if (m.mouthOpenRatio > 0.35) {
    const roar = m.mouthOpenRatio;
    const fangW = u * 2.5;
    const fangH = u * (3 + roar * 4);
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#BCAAA4";
    ctx.lineWidth = u * 0.4;
    [-1, 1].forEach((side) => {
      const fx = m.mouth.x + side * u * 7;
      const fy = m.mouth.y - u * 3;
      ctx.beginPath();
      ctx.moveTo(fx - fangW, fy);
      ctx.lineTo(fx + fangW, fy);
      ctx.lineTo(fx, fy + fangH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    ctx.strokeStyle = `rgba(255,255,255,${0.5 + roar * 0.4})`;
    ctx.lineWidth = u * 1.6;
    ctx.lineCap = "round";
    [-1, 1].forEach((side) => {
      [0, 1, 2].forEach((i) => {
        const r = maneRx * (1.05 + i * 0.1);
        const a0 = side > 0 ? -0.25 : Math.PI - 0.25;
        ctx.beginPath();
        ctx.arc(0, m.mouth.y, r, a0 + 0.05 * i, a0 + 0.5 - 0.05 * i);
        ctx.stroke();
      });
    });
  }

  ctx.restore();
}
