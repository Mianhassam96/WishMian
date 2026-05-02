"use client";

import { useEffect, useRef } from "react";

interface Dot {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  color: string; twinkle: number;
}

const COLORS = [
  "#7c3aed", "#a78bfa", "#6d28d9",
  "#ffd700", "#c9a84c", "#ffe566",
  "#ffffff", "#e0d4ff",
];

export default function ParticlesBg({ count = 80 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots: Dot[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.8 + 0.2,
      opacity: Math.random() * 0.5 + 0.05,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      twinkle: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        d.twinkle += 0.02;

        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        const alpha = d.opacity * (0.6 + 0.4 * Math.sin(d.twinkle));
        const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, "0");

        // Glow for larger particles
        if (d.size > 1.2) {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = d.color + "0a";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = d.color + alphaHex;
        ctx.fill();
      });

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={ref}
      className="particles-bg"
      aria-hidden="true"
    />
  );
}
