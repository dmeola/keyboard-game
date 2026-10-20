import type { FaceMetrics } from "../faceMetrics";
import { faceRx, headTop } from "./shared";

export function drawCatFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const top = headTop(m);
  const { nose, mouth } = m;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Pointy ears sitting on top of the head
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(s * u * 50, top + u * 12);
    ctx.lineTo(s * u * 34, top - u * 28);
    ctx.lineTo(s * u * 12, top + u * 3);
    ctx.closePath();
    ctx.fillStyle = "#FFA726";
    ctx.fill();
    ctx.strokeStyle = "#E65100";
    ctx.lineWidth = u * 1.5;
    ctx.stroke();

    // Inner ear
    ctx.beginPath();
    ctx.moveTo(s * u * 43, top + u * 7);
    ctx.lineTo(s * u * 34, top - u * 17);
    ctx.lineTo(s * u * 19, top + u * 3);
    ctx.closePath();
    ctx.fillStyle = "#FFAB91";
    ctx.fill();
  });

  // Whiskers — dark outline under white so they show on any background
  [-1, 1].forEach((s) => {
    [-1, 0, 1].forEach((k) => {
      const sx = nose.x + s * u * 10;
      const sy = nose.y + u * 3 + k * u * 3;
      const ex = nose.x + s * u * 46;
      const ey = nose.y + u * 3 + k * u * 9;
      [
        { color: "rgba(60,40,30,0.6)", width: u * 1.8 },
        { color: "#FFFFFF", width: u * 1 },
      ].forEach(({ color, width }) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo((sx + ex) / 2, (sy + ey) / 2 - u * 2, ex, ey);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
      });
    });
  });

  // Little pink triangle nose
  ctx.beginPath();
  ctx.moveTo(nose.x - u * 5, nose.y - u * 2);
  ctx.lineTo(nose.x + u * 5, nose.y - u * 2);
  ctx.lineTo(nose.x, nose.y + u * 4);
  ctx.closePath();
  ctx.fillStyle = "#FF8A80";
  ctx.fill();
  ctx.strokeStyle = "#C2185B";
  ctx.lineWidth = u * 0.8;
  ctx.stroke();

  // "w" cat mouth between the nose and the lips
  const wY = mouth.y - u * 5;
  ctx.beginPath();
  ctx.moveTo(nose.x, nose.y + u * 4);
  ctx.lineTo(mouth.x, wY);
  ctx.bezierCurveTo(mouth.x - u * 3, wY + u * 4, mouth.x - u * 8, wY + u * 3, mouth.x - u * 10, wY);
  ctx.moveTo(mouth.x, wY);
  ctx.bezierCurveTo(mouth.x + u * 3, wY + u * 4, mouth.x + u * 8, wY + u * 3, mouth.x + u * 10, wY);
  ctx.strokeStyle = "#5D2E0C";
  ctx.lineWidth = u * 1.2;
  ctx.stroke();

  // Open mouth: little fangs and a "Meow!"
  if (m.mouthOpenRatio > 0.35) {
    const lipY = mouth.y - u * 12 * m.mouthOpenRatio;
    ctx.fillStyle = "#FFFFFF";
    [-1, 1].forEach((s) => {
      ctx.beginPath();
      ctx.moveTo(mouth.x + s * u * 7, lipY);
      ctx.lineTo(mouth.x + s * u * 3, lipY);
      ctx.lineTo(mouth.x + s * u * 5, lipY + u * 5);
      ctx.closePath();
      ctx.fill();
    });

    ctx.font = `bold ${u * 13}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.lineWidth = u * 2.5;
    ctx.strokeStyle = "#E65100";
    ctx.strokeText("Meow!", faceRx(m) + u * 6, mouth.y);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Meow!", faceRx(m) + u * 6, mouth.y);
  }

  ctx.restore();
}
