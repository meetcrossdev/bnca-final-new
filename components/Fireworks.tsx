import { useEffect, useRef } from 'react';
import { playFireworkPop } from '../services/audioService';

interface FireworksProps {
  isSoundEnabled?: boolean;
}

type ExplosionShape = 'sphere' | 'star' | 'ring' | 'sparkler';

export const Fireworks = ({ isSoundEnabled }: FireworksProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    const colors = [
      '#fbbf24', '#f59e0b', '#d97706',
      '#a855f7', '#d946ef', '#8b5cf6',
      '#06b6d4', '#22d3ee', '#67e8f9',
      '#ef4444', '#f43f5e',
      '#10b981', '#34d399',
      '#ffffff', '#f8fafc',
    ];

    class Rocket {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      exploded = false;
      shape: ExplosionShape;

      constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = -(Math.random() * 6 + 13);
        this.color = colors[Math.floor(Math.random() * colors.length)];

        const shapes: ExplosionShape[] = ['sphere', 'star', 'ring', 'sparkler'];
        this.shape = shapes[Math.floor(Math.random() * shapes.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15;

        if (this.vy >= -1 && !this.exploded) {
          this.explode();
          return false;
        }
        return true;
      }

      draw() {
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
              particles.push(new Particle(this.x, this.y, this.color, angle, 5 + Math.random()));
            }
            break;

          case 'sparkler':
            for (let i = 0; i < baseCount; i++) {
              const p = new Particle(
                this.x,
                this.y,
                this.color,
                Math.random() * Math.PI * 2,
                Math.random() * 12 + 1
              );
              p.decay = 0.03;
              p.gravity = 0.15;
              particles.push(p);
            }
            break;

          default:
            for (let i = 0; i < baseCount; i++) {
              particles.push(
                new Particle(
                  this.x,
                  this.y,
                  this.color,
                  Math.random() * Math.PI * 2,
                  Math.random() * 7 + 2
                )
              );
            }
        }

        if (isSoundEnabled) {
          playFireworkPop((this.x / width) * 2 - 1);
        }
      }
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha = 1;
      color: string;
      decay = Math.random() * 0.01 + 0.005;
      gravity = 0.06;
      friction = 0.96;

      constructor(x: number, y: number, color: string, angle: number, speed: number) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
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
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.random() * 1.5 + 1.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;

        if (this.alpha > 0.5) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = this.color;
        }

        ctx.fill();
        ctx.restore();
      }
    }

    let frame = 0;
    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);

      if (frame % 35 === 0) rockets.push(new Rocket());
      if (frame % 100 === 0 && Math.random() > 0.5) rockets.push(new Rocket());

      rockets.forEach((r, i) => {
        r.draw();
        if (!r.update()) rockets.splice(i, 1);
      });

      particles.forEach((p, i) => {
        p.draw();
        if (!p.update()) particles.splice(i, 1);
      });

      frame++;
      animationId = requestAnimationFrame(animate);
    };

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', onResize);
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
    };
  }, [isSoundEnabled]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};
