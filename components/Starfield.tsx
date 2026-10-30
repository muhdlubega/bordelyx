'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import './Starfield.css';

// A fixed seed keeps server HTML and client hydration identical, while scattering
// each star and constellation without repeating a visible tile.
function makeSky() {
  let seed = 71237;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const stars = Array.from({ length: 104 }, () => ({
    x: random() * 100,
    y: random() * 100,
    size: 1 + random() * 1.3,
    delay: -random() * 12,
    duration: 3.5 + random() * 6,
  }));
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let group = 0; group < 7; group++) {
    let x = 7 + random() * 78;
    let y = 9 + random() * 78;
    for (let point = 0; point < 4; point++) {
      stars.push({ x, y, size: 1.4 + random() * .7, delay: -random() * 12, duration: 4 + random() * 5 });
      if (point < 3) {
        const nextX = Math.max(3, Math.min(97, x + (random() - .35) * 10));
        const nextY = Math.max(3, Math.min(97, y + (random() - .5) * 12));
        lines.push({ x1: x, y1: y, x2: nextX, y2: nextY });
        x = nextX;
        y = nextY;
      }
    }
  }
  return { stars, lines };
}
const sky = makeSky();

/** Quiet, non-interactive atmosphere shared by the arcade and policy pages. */
export default function Starfield() {
  const hostRef = useRef<HTMLDivElement>(null);
  const shootingRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const shooting = shootingRef.current;
    if (!host || !shooting) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    let flight: Animation | undefined;
    const shoot = () => {
      const angle = 18 + Math.random() * 20;
      const distance = 210 + Math.random() * 130;
      const dx = Math.cos(angle * Math.PI / 180) * distance;
      const dy = -Math.sin(angle * Math.PI / 180) * distance;
      shooting.style.left = `${5 + Math.random() * 68}%`;
      shooting.style.top = `${20 + Math.random() * 65}%`;
      flight?.cancel();
      flight = shooting.animate([
        { transform: `translate3d(0, 0, 0) rotate(-${angle}deg)`, opacity: 0 },
        { opacity: .8, offset: .12 },
        { opacity: .65, offset: .72 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(-${angle}deg)`, opacity: 0 },
      ], { duration: 620, easing: 'linear' });
    };
    const syncMotion = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
      flight?.cancel();
      const paused = document.hidden || motion.matches;
      host.dataset.paused = String(paused);
      // No catch-up bursts after a hidden tab: each visible interval has one flight.
      if (!paused) timer = setInterval(shoot, 10_000);
    };
    syncMotion();
    document.addEventListener('visibilitychange', syncMotion);
    motion.addEventListener('change', syncMotion);
    return () => {
      if (timer) clearInterval(timer);
      flight?.cancel();
      document.removeEventListener('visibilitychange', syncMotion);
      motion.removeEventListener('change', syncMotion);
    };
  }, []);

  return <div className="site-starfield" ref={hostRef} aria-hidden="true">
    <svg className="starfield-constellations" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
      {sky.lines.map((line, i) => <line key={i} {...line} vectorEffect="non-scaling-stroke" />)}
    </svg>
    {sky.stars.map((star, i) => <span key={i} className="starfield-star" style={{
      left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size,
      '--twinkle-delay': `${star.delay}s`, '--twinkle-duration': `${star.duration}s`,
    } as CSSProperties} />)}
    <span ref={shootingRef} className="starfield-shooting" />
  </div>;
}
