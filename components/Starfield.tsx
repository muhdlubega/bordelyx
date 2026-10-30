'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
type Connection = (typeof sky.lines)[number];
const initialConstellations = Array.from({ length: 7 }, (_, i) => sky.lines.slice(i * 3, i * 3 + 3));

// Choose a short chain of real, nearby stars rather than arbitrary empty points.
function reconnect(previous: Connection[]): Connection[] {
  const starts = sky.stars.filter(star => star.x !== previous[0].x1 || star.y !== previous[0].y1);
  let current = starts[Math.floor(Math.random() * starts.length)];
  const used = new Set([current]);
  const lines: Connection[] = [];
  for (let step = 0; step < 3; step++) {
    const neighbors = sky.stars
      .filter(star => !used.has(star))
      .map(star => ({ star, distance: Math.hypot(star.x - current.x, star.y - current.y) }))
      .filter(({ distance }) => distance > 2 && distance < 18)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
    if (!neighbors.length) break;
    const next = neighbors[Math.floor(Math.random() * neighbors.length)].star;
    lines.push({ x1: current.x, y1: current.y, x2: next.x, y2: next.y });
    used.add(next);
    current = next;
  }
  return lines.length ? lines : previous;
}

/** Quiet, non-interactive atmosphere shared by the arcade and policy pages. */
export default function Starfield() {
  const [constellations, setConstellations] = useState(initialConstellations);
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
      {constellations.map((lines, group) => <g key={group} className="starfield-constellation" style={{
        '--constellation-duration': `${9 + group * .85}s`,
        '--constellation-delay': `${group * .7}s`,
      } as CSSProperties} onAnimationIteration={event => {
        // Endpoints change only while fully invisible between animation cycles.
        if (event.target !== event.currentTarget) return;
        const next = reconnect(lines);
        setConstellations(current => current.map((value, index) => index === group ? next : value));
      }}>
        {lines.map((line, i) => <line key={i} {...line} vectorEffect="non-scaling-stroke" />)}
      </g>)}
    </svg>
    {sky.stars.map((star, i) => <span key={i} className="starfield-star" style={{
      left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size,
      '--twinkle-delay': `${star.delay}s`, '--twinkle-duration': `${star.duration}s`,
    } as CSSProperties} />)}
    <span ref={shootingRef} className="starfield-shooting" />
  </div>;
}
