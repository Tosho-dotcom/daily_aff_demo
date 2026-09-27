"use client";

import { useEffect, useRef } from "react";

/**
 * Full-screen canvas:
 *  - a few slow, soft "bokeh" dots floating upward all the time
 *  - a gentle burst of glowing petals/sparkles each time `burstKey` changes
 */

type P = {
  x: number; y: number; vx: number; vy: number;
  r: number; life: number; max: number; hue: string; kind: "dot" | "spark";
  a: number; spin: number;
};

const COLORS = ["246,196,206", "230,214,248", "255,222,200", "252,236,244", "217,166,196"];

export default function Particles({ burstKey, origin }: { burstKey: number; origin?: { x: number; y: number } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const parts = useRef<P[]>([]);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const reduced = useRef(false);

  // animation loop
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth, h = window.innerHeight;
      size.current = { w, h, dpr };
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const ambient = () => {
      const { w, h } = size.current;
      const r = 6 + Math.random() * 22;
      parts.current.push({
        x: Math.random() * w, y: h + r, vx: (Math.random() - 0.5) * 0.15, vy: -(0.15 + Math.random() * 0.35),
        r, life: 0, max: 900 + Math.random() * 900, hue: COLORS[(Math.random() * COLORS.length) | 0],
        kind: "dot", a: 0.18 + Math.random() * 0.22, spin: 0,
      });
    };
    // seed so the screen is not empty at start
    for (let i = 0; i < 14; i++) {
      ambient();
      const p = parts.current[parts.current.length - 1];
      p.y = Math.random() * size.current.h; p.life = Math.random() * p.max * 0.6;
    }

    let raf = 0;
    let t = 0;
    const tick = () => {
      const { w, h } = size.current;
      ctx.clearRect(0, 0, w, h);
      t++;
      if (!reduced.current && t % 50 === 0 && parts.current.filter((p) => p.kind === "dot").length < 22) ambient();

      parts.current = parts.current.filter((p) => p.life < p.max);
      for (const p of parts.current) {
        p.life++;
        p.x += p.vx; p.y += p.vy;
        if (p.kind === "spark") { p.vx *= 0.975; p.vy = p.vy * 0.975 - 0.012; p.spin += 0.03; }
        const k = Math.min(1, p.life / p.max);
        const fade = p.kind === "dot" ? Math.sin(Math.PI * k) : (1 - k) ** 1.4;
        const alpha = p.a * fade;
        if (p.kind === "dot") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(${p.hue},${alpha})`);
          g.addColorStop(1, `rgba(${p.hue},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        } else {
          // soft glow + tiny four-point star
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, `rgba(${p.hue},${alpha * 0.9})`);
          g.addColorStop(1, `rgba(${p.hue},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.spin);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.beginPath();
          const s = p.r;
          ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
          ctx.restore();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // burst
  useEffect(() => {
    if (!burstKey) return;
    const { w, h } = size.current;
    const cx = origin?.x ?? w / 2, cy = origin?.y ?? h / 2;
    const n = reduced.current ? 12 : 70;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = reduced.current ? 0.4 : 0.8 + Math.random() * 3.2;
      parts.current.push({
        x: cx + Math.cos(ang) * 10, y: cy + Math.sin(ang) * 10,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 0.6,
        r: 1.5 + Math.random() * 3.5, life: 0, max: 90 + Math.random() * 90,
        hue: COLORS[(Math.random() * COLORS.length) | 0], kind: "spark", a: 0.9, spin: Math.random() * 6,
      });
    }
  }, [burstKey, origin]);

  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}
