'use client';
import { useEffect, useRef, useState } from 'react';
export default function Counter({ value }: {
    value: number;
}) {
    const [display, setDisplay] = useState(0), prior = useRef(0);
    useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplay(value);
        prior.current = value;
        return;
    } const from = prior.current, start = performance.now(); let frame = 0; const animate = (now: number) => { const t = Math.min(1, (now - start) / 650); setDisplay(Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3)))); if (t < 1)
        frame = requestAnimationFrame(animate); }; frame = requestAnimationFrame(animate); prior.current = value; return () => cancelAnimationFrame(frame); }, [value]);
    return <>{display.toLocaleString()}</>;
}
