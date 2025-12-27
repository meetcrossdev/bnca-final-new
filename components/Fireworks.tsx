import React, { useEffect, useRef } from 'react';
import { playFireworkPop } from '../services/audioService';

interface FireworksProps {
  isSoundEnabled?: boolean;
}

type ExplosionShape = 'sphere' | 'star' | 'ring' | 'sparkler';

export const Fireworks: React.FC<FireworksProps> = ({ isSoundEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    const colors = [
      '#fbbf24', '#f59e0b', '#d97706', // Golds
      '#a855f7', '#d946ef', '#8b5cf6', // Purples
      '#06b6d4', '#22d3ee', '#67e8f9', // Cyans
      '#ef4444', '#f43f5e',           // Reds
      '#10b981', '#34d399',           // Greens
      '#ffffff', '#f8fafc'            // Whites
    ];

    class Rocket {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      exploded: boolean;
      shape: ExplosionShape;

      constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = -(Math.random() * 6 + 13);
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.exploded = false;
        const shapes: ExplosionShape[] = ['sphere', 'star', 'ring', 'sparkler'];
        this.shape = shapes[Math.floor(Math.random() * shapes.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // Gravity

        if (this.vy >= -1 && !this.exploded) {
          this.explode();
          return false;
        }
        return true;
      }

      draw() {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2 + 5);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();

        ctx.shadowBlur = 0;
      }

      explode() {
        const ctx = ctxRef.current;
        if (!ctx) return;

        const baseCount = 100 + Math.random() * 50;

        switch (this.shape) {
          case 'star':
            for (let i = 0; i < 5; i++) {
              const angle = (i * Math.PI * 2) / 5;
              for (let j = 0; j < 25; j++) {
                const speed = (j / 25) * 8 + 2;
                particles.push(new Particle(this.x, this.y, this.color, angle, speed));
              }
            }
            break;

          case 'ring':
            for (let i = 0; i < 80; i++) {
              const angle = (i * Math.PI * 2) / 80;
              const speed = 5 + Math.random() * 1;
              particles.push(new Particle(this.x, this.y, this.color, angle, speed));
            }
            break;

          case 'sparkler':
            for (let i = 0; i < baseCount; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 12 + 1;
              const p = new Particle(this.x, this.y, this.color, angle, speed);
              p.decay = 0.03;
              p.gravity = 0.15;
              particles.push(p);
            }
            break;

          case 'sphere':
          default:
            for (let i = 0; i < baseCount; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 7 + 2;
              particles.push(new Particle(this.x, this.y, this.color, angle, speed));
            }
            break;
        }

        if (isSoundEnabled) {
          const pan = (this.x / width) * 2 - 1;
          playFireworkPop(pan);
        }

        this.exploded = true;
      }
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      decay: number;
      gravity: number;
      friction: number;

      constructor(x: number, y: number, color: string, angle: number, speed: number) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.color = color;
        this.decay = Math.random() * 0.01 + 0.005;
        this.gravity = 0.06;
        this.friction = 0.96;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.alpha -= this.decay;
        return this.alpha > 0;
      }

      draw() {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        const size = Math.random() * 1.5 + 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;

        if (this.alpha > 0.5) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = this.color;
        }

        ctx.fill();
        ctx.restore();
      }
    }

    let animationId: number;
    let frame = 0;

    const animate = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);

      if (frame % 35 === 0) rockets.push(new Rocket());
      if (frame % 100 === 0 && Math.random() > 0.5) rockets.push(new Rocket());

      for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].draw();
        if (!rockets[i].update()) rockets.splice(i, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        if (!particles[i].update()) particles.splice(i, 1);
      }

      frame++;
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isSoundEnabled]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};




