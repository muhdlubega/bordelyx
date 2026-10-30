'use client';
import { useEffect, useId, useMemo, useState } from 'react';
import { countries, countryById } from '@/lib/geography';
import { validMoves, upcomingDanger, type Run } from '@/lib/engine';
type Geometry = {
    type: string;
    coordinates: number[][][] | number[][][][];
};
type Feature = {
    properties: Record<string, string>;
    geometry: Geometry;
};
type AtlasProps = {
    run?: Run;
    onSelect?: (id: string) => void;
    decorative?: boolean;
};
let atlasPromise: Promise<Feature[]> | undefined;
const tiny = new Set(['AD', 'MC', 'LI', 'LU', 'VA', 'SM']);
function getFeatures() {
    if (!atlasPromise)
        atlasPromise = fetch('/world.geojson').then(r => {
            if (!r.ok)
                throw new Error('The local atlas could not be loaded.');
            return r.json();
        }).then(data => data.features);
    return atlasPromise;
}
export default function Atlas({ run, onSelect, decorative = false }: AtlasProps) {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [failed, setFailed] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const instance = useId().replace(/:/g, '');
    useEffect(() => { let live = true; getFeatures().then(data => { if (live)
        setFeatures(data); }).catch(() => { if (live)
        setFailed(true); atlasPromise = undefined; }); return () => { live = false; }; }, []);
    const project = (lon: number, lat: number): [
        number,
        number
    ] => decorative ? [(lon + 180) * 1000 / 360, (90 - lat) * 600 / 180] : [(lon + 15) * 1000 / 76, (73 - lat) * 720 / 55];
    const shape = (geometry: Geometry) => {
        const polygons = geometry.type === 'Polygon' ? [geometry.coordinates as number[][][]] : geometry.coordinates as number[][][][];
        return polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat], i) => `${i ? 'L' : 'M'}${project(lon, lat).map(n => n.toFixed(1)).join(',')}`).join(' ') + 'Z').join(' ')).join(' ');
    };
    const paths = useMemo(() => features.map(feature => {
        const code = feature.properties.ISO_A2_EH || feature.properties.ISO_A2;
        const id = countryById[code] ? code : feature.properties.ADMIN === 'Kosovo' ? 'XK' : '';
        return { id, name: feature.properties.ADMIN, d: shape(feature.geometry) };
    }), [features, decorative]); // Projection depends only on decorative mode.
    const playing = run?.status === 'playing';
    const blind = playing && run?.modifiers.includes('blind');
    const fog = playing && run?.modifiers.includes('fog');
    const noLabels = playing && (run?.modifiers.includes('noLabels') || run?.mode === 'pinpoint');
    const neighbors = run ? validMoves(run) : [];
    const nextWave = run?.effects.scout ? upcomingDanger(run) : [];
    const visible = new Set(run ? [run.current, ...countryById[run.current].neighbors, ...run.route] : countries.map(c => c.id));
    const obscured = (id: string) => fog && !visible.has(id) && !run?.effects.scout;
    const choose = (id: string) => { if (id && onSelect && !blind && !decorative && (!run?.modifiers.includes('noLabels') || run?.mode === 'pinpoint'))
        onSelect(id); };
    const route = run?.route.map(id => countryById[id]).filter(Boolean).map(c => project(c.lon, c.lat).join(',')).join(' ');
    const countryFill = (id: string) => {
        if (!id || obscured(id))
            return '#101f26';
        if (run?.danger.includes(id))
            return '#743b3c';
        if (run?.blocked.includes(id))
            return '#252d36';
        if (run?.current === id)
            return '#a7eab0';
        if (run?.target === id && run.mode !== 'pinpoint')
            return '#4b857f';
        if (run?.checkpoints.includes(id))
            return run.collected.includes(id) ? '#487e66' : '#826342';
        if (id === hovered)
            return '#497e71';
        if (neighbors.includes(id) && (run?.effects.pulse || !fog))
            return '#31594f';
        if (run?.route.includes(id))
            return '#3f6b59';
        return '#233c3e';
    };
    if (blind)
        return <div className="atlas-blind" role="img" aria-label="Blind modifier: map hidden. Navigate using typed country names."><span style={{ fontSize: 64, opacity: .45 }}>◉</span><h2>Trust your inner atlas.</h2><p>Blind mode is active. Navigate using country names.</p><small>Your route will be revealed at the finish.</small></div>;
    return <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: 300, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 48%, #153031 0%, #0d2027 68%, #0b1b22 100%)' }}>
    {failed && <p role="alert" style={{ position: 'absolute', zIndex: 2, top: 12, left: 20 }}>Atlas unavailable. You can still navigate with country search.</p>}
    <svg className="atlas-map" viewBox={decorative ? '0 0 1000 600' : '0 0 1000 720'} role="img" aria-label="Interactive strategy atlas of Europe, North Africa and western Asia" style={{ display: 'block', width: '100%', height: '100%', minHeight: 300 }}>
      <defs>
        <pattern id={`grid-${instance}`} width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#7cadab" strokeWidth=".5" opacity=".13"/></pattern>
        <filter id={`glow-${instance}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>
        <linearGradient id={`route-${instance}`}><stop stopColor="#baf5b4"/><stop offset="1" stopColor="#7be2d0"/></linearGradient>
      </defs>
      <rect width="1000" height="720" fill={`url(#grid-${instance})`}/>
      <g className="territories">
        {paths.map((p, i) => <path key={`${p.name}-${i}`} className={`territory ${p.id === run?.current ? 'territory-current' : ''}`} d={p.d} fill={countryFill(p.id)} stroke={run?.danger.includes(p.id) ? '#bf6866' : p.id === hovered ? '#c0eed5' : '#537373'} strokeWidth={p.id === run?.current ? 2 : .7} strokeLinejoin="round" fillRule="evenodd" style={{ transition: 'fill .35s ease, stroke .2s ease', cursor: p.id && onSelect ? 'pointer' : 'default', outline: 'none' }} tabIndex={p.id && onSelect && !decorative && (!run?.modifiers.includes('noLabels') || run?.mode === 'pinpoint') ? 0 : undefined} role={p.id && onSelect ? 'button' : undefined} aria-label={p.id ? countryById[p.id].name : p.name} onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(p.id)} onBlur={() => setHovered(null)} onClick={() => choose(p.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        choose(p.id);
    } }}/>)}
      </g>
      {nextWave.map(id => { const c = countryById[id], [x, y] = project(c.lon, c.lat); return <circle key={id} cx={x} cy={y} r="14" fill="none" stroke="#f1a47f" strokeWidth="1.5" strokeDasharray="3 4" pointerEvents="none"/>; })}
      {route && <g pointerEvents="none"><polyline className="route-path" points={route} fill="none" stroke="#a7eab0" strokeWidth="8" opacity=".18" filter={`url(#glow-${instance})`}/><polyline className="route-path" points={route} fill="none" stroke={`url(#route-${instance})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4"/></g>}
      {!decorative && countries.filter(c => !obscured(c.id)).map(c => {
            const [x, y] = project(c.lon, c.lat), current = run?.current === c.id, target = run?.target === c.id && run?.mode !== 'pinpoint', cache = run?.checkpoints.includes(c.id) && !run.collected.includes(c.id);
            const name = c.id === 'BA' ? 'BOSNIA' : c.id === 'MK' ? 'N. MACEDONIA' : c.name.toUpperCase();
            return <g key={c.id} className="map-marker" pointerEvents={tiny.has(c.id) ? 'auto' : 'none'} onClick={() => choose(c.id)}>
          {current && <><circle className="map-pin" cx={x} cy={y} r="20" fill="#b9f6b4" opacity=".12"/><circle cx={x} cy={y} r="9" fill="#bff5b3" stroke="#143128" strokeWidth="2"/><circle cx={x} cy={y} r="3" fill="#123e30"/></>}
          {target && <><circle cx={x} cy={y} r="15" fill="none" stroke="#a6eee3" strokeWidth="1"/><circle cx={x} cy={y} r="5" fill="#90e5d7"/></>}
          {cache && <path d={`M${x} ${y - 8}l7 8-7 8-7-8Z`} fill="#ffc280" stroke="#523b25" strokeWidth="2"/>}
          {tiny.has(c.id) && !current && <circle cx={x} cy={y} r="2.6" fill="#94aba0" stroke="#0c252c" strokeWidth=".8"/>}
          {!noLabels && !tiny.has(c.id) && <text className="map-label" x={x} y={y + (current || target || cache ? 24 : 3)} fill={current ? '#d4ffcb' : run?.danger.includes(c.id) ? '#e6a6a1' : '#bed2cb'} fontFamily="inherit" fontSize={['RU', 'FR', 'DE', 'PL', 'ES', 'IT', 'TR', 'DZ', 'LY', 'EG'].includes(c.id) ? 11 : 8.5} fontWeight={current ? 700 : 500} letterSpacing="1" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#152e31', strokeWidth: 2.4, strokeLinejoin: 'round' }}>{name}</text>}
        </g>;
        })}
      {!decorative && <g transform="translate(940 58)" opacity=".65" pointerEvents="none"><text y="-18" fill="#b6d6cc" textAnchor="middle" fontSize="10">N</text><path d="M0-10L5 8 0 4-5 8Z" fill="#bddac9"/><circle r="25" fill="none" stroke="#719e96" strokeWidth=".7"/></g>}
      <text x="22" y={decorative ? 580 : 697} fill="#68918b" fontSize="8" letterSpacing="2" pointerEvents="none">NATURAL EARTH · STRATEGIC ATLAS</text>
    </svg>
    {hovered && !noLabels && !obscured(hovered) && <div style={{ position: 'absolute', left: 20, top: 18, background: '#122b2de8', border: '1px solid #608d7766', padding: '9px 14px', borderRadius: 8, fontSize: 12, pointerEvents: 'none', color: '#d7eadb' }}>{countryById[hovered].flag} {countryById[hovered].name}{run?.blocked.includes(hovered) ? ' · BLOCKED' : run?.danger.includes(hovered) ? ' · DANGER' : ''}</div>}
  </div>;
}
