"use client";

import { useEffect, useRef } from "react";

type AnimStyle = "explosion" | "gold-fall" | "petal-rise" | "star-burst" | "heart-float";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
  shape: "circle" | "star" | "heart" | "petal";
  gravity: number;
}

interface Props {
  colors: string[];
  style: AnimStyle;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const b = (i * 4 * Math.PI) / 5 + (2 * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(b) * (r * 0.4), Math.sin(b) * (r * 0.4));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.5);
  ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function createParticles(
  cx: number, cy: number,
  colors: string[],
  style: AnimStyle,
  count: number
): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = style === "explosion" ? 6 + Math.random() * 10
      : style === "gold-fall" ? 1 + Math.random() * 3
      : style === "petal-rise" ? 1 + Math.random() * 4
      : style === "star-burst" ? 4 + Math.random() * 8
      : 2 + Math.random() * 5;

    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape: Particle["shape"] =
      style === "heart-float" ? "heart"
      : style === "petal-rise" ? "petal"
      : style === "star-burst" ? "star"
      : Math.random() > 0.5 ? "circle" : "star";

    return {
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 40,
      vx: style === "gold-fall" ? (Math.random() - 0.5) * 2 : Math.cos(angle) * speed,
      vy: style === "gold-fall" ? -2 - Math.random() * 3
        : style === "petal-rise" ? -3 - Math.random() * 5
        : style === "heart-float" ? -2 - Math.random() * 4
        : Math.sin(angle) * speed,
      size: 3 + Math.random() * 8,
      color,
      alpha: 1,
      decay: 0.008 + Math.random() * 0.012,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      shape,
      gravity: style === "gold-fall" || style === "petal-rise" || style === "heart-float"
        ? 0.05 + Math.random() * 0.05
        : 0.15 + Math.random() * 0.1,
    };
  });
}

export default function ExplosionCanvas({ colors, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Multiple waves
    let particles: Particle[] = [];
    particles.push(...createParticles(cx, cy, colors, style, 120));

    // Second wave after 200ms
    const t2 = setTimeout(() => {
      particles.push(...createParticles(cx, cy, colors, style, 80));
    }, 200);

    // Third wave
    const t3 = setTimeout(() => {
      particles.push(...createParticles(cx, cy, colors, style, 60));
    }, 400);

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter((p) => p.alpha > 0.01);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        const { r, g, b } = hexToRgb(p.color.startsWith("#") ? p.color : "#ffffff");
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        if (p.shape === "star") {
          drawStar(ctx, p.x, p.y, p.size, p.rotation);
        } else if (p.shape === "heart") {
          drawHeart(ctx, p.x, p.y, p.size);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          if (p.shape === "petal") {
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }
      });

      ctx.globalAlpha = 1;

      if (particles.length > 0) {
        raf = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      cancelAnimationFrame(raf);
    };
  }, [colors, style]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
