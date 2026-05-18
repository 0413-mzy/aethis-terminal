'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  gravity: number;
  active: boolean;
}

const POOL_SIZE = 500;

export const particleEmitters = {
  emit: (x: number, y: number, options?: {
    count?: number;
    spread?: number;
    speed?: number;
    colors?: string[];
    size?: number;
    life?: number;
    gravity?: number;
  }) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('particle-emit', {
        detail: { x, y, ...options },
      }));
    }
  },
};

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  // Initialize particle pool
  useEffect(() => {
    const pool: Particle[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      pool.push({
        x: 0, y: 0, vx: 0, vy: 0,
        life: 0, maxLife: 0, size: 4,
        color: '#fff', alpha: 1, gravity: 0,
        active: false,
      });
    }
    particlesRef.current = pool;
  }, []);

  const spawnParticle = useCallback((
    x: number, y: number,
    speed: number, spread: number,
    color: string, size: number,
    life: number, gravity: number,
  ) => {
    const pool = particlesRef.current;
    for (const p of pool) {
      if (!p.active) {
        const angle = (Math.random() - 0.5) * spread * (Math.PI / 180);
        const s = speed * (0.5 + Math.random() * 0.5);
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * s * (Math.random() > 0.5 ? 1 : -1);
        p.vy = Math.sin(angle) * s * (-0.2 - Math.random() * 0.8);
        p.life = life * (0.6 + Math.random() * 0.4);
        p.maxLife = p.life;
        p.size = size * (0.5 + Math.random());
        p.color = color;
        p.alpha = 1;
        p.gravity = gravity;
        p.active = true;
        return;
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleEmit = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const {
        x = window.innerWidth / 2,
        y = window.innerHeight / 2,
        count = 30,
        spread = 180,
        speed = 4,
        colors = ['#c9a44b', '#f0c860', '#fff'],
        size = 4,
        life = 1.5,
        gravity = 60,
      } = detail;

      for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        spawnParticle(x, y, speed, spread, color, size, life, gravity);
      }
    };

    window.addEventListener('particle-emit', handleEmit);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dt = 1 / 60;

      for (const p of particlesRef.current) {
        if (!p.active) continue;

        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }

        p.vy += p.gravity * dt;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = p.life / p.maxLife;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('particle-emit', handleEmit);
    };
  }, [spawnParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none"
    />
  );
}
