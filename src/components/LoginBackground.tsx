import { useEffect, useRef } from "react";
export default function LoginBackground({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const count = Math.min(
        60,
        Math.floor((canvas.width * canvas.height) / 20000),
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const baseColor = isDark ? "168, 162, 255" : "139, 92, 246";
      const lineColor = isDark ? "120, 120, 200" : "139, 92, 246";

      // 绘制连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor}, ${(1 - dist / 150) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 绘制粒子
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
        ctx.fill();
      }

      if (!reducedMotion.matches) animationId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();
    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDark]);

  return (
    <>
      {/* 渐变背景层 */}
      <div
        className={`fixed inset-0 pointer-events-none ${
          isDark
            ? "bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950"
            : "bg-gradient-to-br from-purple-50 via-white to-blue-50"
        }`}
      />

      {/* 浮动光斑 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl animate-float-slow ${
            isDark ? "bg-purple-900/20" : "bg-purple-200/40"
          }`}
        />
        <div
          className={`absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-float-slower ${
            isDark ? "bg-blue-900/15" : "bg-blue-200/30"
          }`}
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl animate-float-reverse ${
            isDark ? "bg-violet-900/10" : "bg-violet-200/20"
          }`}
        />
      </div>

      {/* 粒子 Canvas */}
      <canvas
        aria-hidden="true"
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1]"
      />
    </>
  );
}
