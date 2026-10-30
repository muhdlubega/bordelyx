'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { countries, countryById } from '@/lib/geography';
import type { Run } from '@/lib/engine';
import {getMapMarkers,layoutMapMarkers,markerColors} from '@/lib/map-markers';
import MapMarkerIcon from './MapMarkerIcon';
import { getMapPolicy } from '@/lib/map-policy';
import {needsWorldAtlas,projectAtlas} from '@/lib/atlas-view';

type Geometry = { type: string; coordinates: number[][][] | number[][][][] };
type Feature = { properties: Record<string, string>; geometry: Geometry };
type AtlasProps = { run?: Run; onSelect?: (id: string) => void; decorative?: boolean };
let atlasPromise: Promise<Feature[]> | undefined;
const tiny = new Set(['AD', 'MC', 'LI', 'LU', 'VA', 'SM']);

function getFeatures() {
    if (!atlasPromise) atlasPromise = fetch('/world.geojson').then(r => {
        if (!r.ok) throw new Error('The local atlas could not be loaded.');
        return r.json();
    }).then(data => data.features);
    return atlasPromise;
}

export default function Atlas({ run, onSelect, decorative = false }: AtlasProps) {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [failed, setFailed] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const instance = useId().replace(/:/g, '');
    const policy = getMapPolicy(run);
    const host=useRef<HTMLDivElement>(null);
    const [pixelScale,setPixelScale]=useState(1);
    useEffect(() => {
        if (!policy.showCountryShapes) return;
        let live = true;
        getFeatures().then(data => { if (live) setFeatures(data); }).catch(() => {
            if (live) setFailed(true);
            atlasPromise = undefined;
        });
        return () => { live = false; };
    }, [policy.showCountryShapes]);
    const worldView = decorative || needsWorldAtlas(run);
    const project = (lon:number,lat:number):[number,number] => projectAtlas(lon,lat,worldView);
    const viewHeight=worldView?600:720;
    useEffect(()=>{const element=host.current;if(!element)return;const resize=()=>setPixelScale(Math.max(.1,Math.min(element.clientWidth/1000,element.clientHeight/viewHeight)));const observer=new ResizeObserver(resize);observer.observe(element);resize();return()=>observer.disconnect()},[viewHeight,policy.showMap]);
    const markers=layoutMapMarkers(getMapMarkers(run),project,pixelScale,viewHeight);
    const marked=new Set(markers.map(point=>point.countryId));
    const paths = useMemo(() => features.map(feature => {
        const code = feature.properties.ISO_A2_EH || feature.properties.ISO_A2;
        const id = countryById[code] ? code : feature.properties.ADMIN === 'Kosovo' ? 'XK' : '';
        const polygons = feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates as number[][][]]
            : feature.geometry.coordinates as number[][][][];
        const d = polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat], i) =>
            `${i ? 'L' : 'M'}${project(lon, lat).map(n => n.toFixed(1)).join(',')}`
        ).join(' ') + 'Z').join(' ')).join(' ');
        return { id, name: feature.properties.ADMIN, d };
    }), [features, worldView]);
    const fog = run?.status === 'playing' && run.modifiers.includes('fog');
    const visible = new Set(run ? [run.current, ...countryById[run.current].neighbors, ...run.route] : countries.map(c => c.id));
    const obscured = (id: string) => fog && !visible.has(id) ;
    const selectable = policy.allowCountrySelection && !decorative && !!onSelect;
    const choose = (id: string) => { if (id && selectable) onSelect?.(id); };
    const route = policy.showRoute ? run?.route.map(id => countryById[id]).filter(Boolean)
        .map(c => project(c.lon, c.lat).join(',')).join(' ') : '';
    const countryFill = (id: string) => {
        if (!id || obscured(id)) return '#101f26';
        if (policy.showHazards && run?.danger.includes(id)) return '#743b3c';
        if (policy.showHazards && run?.blocked.includes(id)) return '#252d36';
        if (policy.showCurrentPosition && run?.current === id) return '#a7eab0';
        if (run?.target === id && run.mode !== 'pinpoint') return '#4b857f';
        if (policy.showCheckpoints && run?.checkpoints.includes(id)) return run.collected.includes(id) ? '#487e66' : '#826342';
        if (selectable && id === hovered) return '#497e71';
        if (policy.showRoute && run?.route.includes(id)) return '#3f6b59';
        return '#233c3e';
    };
    if (!policy.showMap) return <div className="atlas-blind" role="img" aria-label="Blind modifier: map hidden. Navigate using typed country names."><span style={{ fontSize: 64, opacity: .45 }}>◉</span><h2>Trust your inner atlas.</h2><p>Blind mode is active. Navigate using country names.</p><small>Your route will be revealed at the finish.</small></div>;
    return <div ref={host} className={policy.onlyEndpoints ? 'atlas-surface atlas-endpoints-only' : 'atlas-surface'} style={{ width: '100%', height: '100%', position: 'relative', minHeight: 300, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 48%, #153031 0%, #0d2027 68%, #0b1b22 100%)' }}>
        {failed && policy.showCountryShapes && <p role="alert" style={{ position: 'absolute', zIndex: 2, top: 12, left: 20 }}>Atlas unavailable. You can still navigate with country search.</p>}
        <svg className="atlas-map" viewBox={worldView ? '0 0 1000 600' : '0 0 1000 720'} data-atlas-view={worldView ? 'world' : 'regional'} role="img" aria-label={policy.onlyEndpoints ? 'Ghost Route: only the start and extraction points are visible. Type country names to navigate.' : selectable ? 'Unlabeled country atlas. Select the requested country.' : 'Unlabeled strategy atlas. Enter country names below to move.'} style={{ display: 'block', width: '100%', height: '100%', minHeight: 300 }}>
            <defs>
                <pattern id={`grid-${instance}`} width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#7cadab" strokeWidth=".5" opacity=".13" /></pattern>
                <filter id={`glow-${instance}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
                <linearGradient id={`route-${instance}`}><stop stopColor="#baf5b4" /><stop offset="1" stopColor="#7be2d0" /></linearGradient>
            </defs>
            <rect width="1000" height="720" fill={`url(#grid-${instance})`} />
            {policy.showCountryShapes && <g className="territories" aria-hidden={!selectable && !policy.showCountryLabels}>
                {paths.map((p, i) => <path key={`${p.name}-${i}`} className={`territory ${selectable ? 'territory-selectable' : 'territory-readonly'} ${policy.showCurrentPosition && p.id === run?.current ? 'territory-current' : ''}`} d={p.d} fill={countryFill(p.id)} stroke={policy.showHazards && run?.danger.includes(p.id) ? '#bf6866' : selectable && p.id === hovered ? '#c0eed5' : '#537373'} strokeWidth={policy.showCurrentPosition && p.id === run?.current ? 2 : .7} strokeLinejoin="round" fillRule="evenodd" style={{ transition: 'fill .35s ease, stroke .2s ease', cursor: p.id && selectable ? 'pointer' : 'default', outline: 'none', pointerEvents: selectable ? 'auto' : 'none' }} tabIndex={p.id && selectable ? 0 : undefined} role={p.id && selectable ? 'button' : undefined} aria-label={p.id && selectable ? countryById[p.id].name : undefined} onMouseEnter={selectable ? () => setHovered(p.id) : undefined} onMouseLeave={selectable ? () => setHovered(null) : undefined} onFocus={selectable ? () => setHovered(p.id) : undefined} onBlur={selectable ? () => setHovered(null) : undefined} onClick={selectable ? () => choose(p.id) : undefined} onKeyDown={selectable ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(p.id); } } : undefined} />)}
            </g>}
            {route && <g pointerEvents="none"><polyline className="route-path" points={route} fill="none" stroke="#a7eab0" strokeWidth="8" opacity=".18" filter={`url(#glow-${instance})`} /><polyline className="route-path" points={route} fill="none" stroke={`url(#route-${instance})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" /></g>}
            {!decorative && <g className="map-points" pointerEvents="none">{markers.map(point=>{
                const country=countryById[point.countryId],[x,y]=project(country.lon,country.lat);
                const primary=['start','finish','current'].includes(point.kind),size=primary?28:point.kind==='checkpoint'?25:point.kind==='visited'?21:18;
                const [dx,dy]=point.offset,color=markerColors[point.kind];
                return <g key={point.key} className={`map-point marker-${point.kind}${policy.onlyEndpoints?' endpoint-pin':''}`} data-marker-kind={point.kind} data-country={point.countryId} role="img" aria-label={point.ariaLabel} transform={`translate(${x} ${y})`}>
                    {(dx||dy)&&<path d={`M0 0l${dx/pixelScale} ${dy/pixelScale}`} stroke={color} strokeWidth={1/pixelScale} strokeOpacity=".55"/>}
                    <g transform={`translate(${dx/pixelScale} ${dy/pixelScale}) scale(${1/pixelScale})`}>
                        <g transform={`translate(${-size/2} ${-size/2})`} style={{filter:primary?'drop-shadow(0 2px 5px #000b)':'none',opacity: (point.kind==='danger'||point.kind==='blocked') ? 0.86 : 1}}><MapMarkerIcon kind={point.kind} size={size} number={point.number} collected={point.collected}/></g>
                        {point.label&&<text className="map-point-label" y={point.kind==='current'?33:26} textAnchor="middle" fill={color} fontSize="9" fontWeight="700" fontFamily="inherit" letterSpacing="1" style={{paintOrder:'stroke',stroke:'#0b1d23',strokeWidth:3,strokeLinejoin:'round'}}>{point.label}</text>}
                    </g>
                </g>;
            })}</g>}
            {!decorative&&policy.showCountryLabels&&countries.filter(c=>!obscured(c.id)&&!marked.has(c.id)&&(!worldView||run?.route.includes(c.id)||c.id===run?.target)).map(c=>{
                const [x,y]=project(c.lon,c.lat),name=c.id==='BA'?'BOSNIA':c.id==='MK'?'N. MACEDONIA':c.name.toUpperCase();
                return <text key={c.id} className="map-label" x={x} y={y+3} fill="#bed2cb" fontFamily="inherit" fontSize="9" letterSpacing="1" textAnchor="middle" pointerEvents="none" style={{paintOrder:'stroke',stroke:'#152e31',strokeWidth:2.4,strokeLinejoin:'round'}}>{name}</text>;
            })}
            {selectable&&countries.filter(c=>tiny.has(c.id)).map(c=>{const [x,y]=project(c.lon,c.lat);return <circle key={c.id} cx={x} cy={y} r="3" fill="#94aba0" role="button" tabIndex={0} aria-label={c.name} onClick={()=>choose(c.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(c.id)}}}/>})}
            {!decorative && <g transform="translate(940 58)" opacity=".65" pointerEvents="none"><text y="-18" fill="#b6d6cc" textAnchor="middle" fontSize="10">N</text><path d="M0-10L5 8 0 4-5 8Z" fill="#bddac9" /><circle r="25" fill="none" stroke="#719e96" strokeWidth=".7" /></g>}
            <text x="22" y={worldView ? 580 : 697} fill="#68918b" fontSize="8" letterSpacing="2" pointerEvents="none">{policy.onlyEndpoints ? 'GHOST ROUTE · TRUST YOUR INNER ATLAS' : 'NATURAL EARTH · STRATEGIC ATLAS'}</text>
        </svg>
    </div>;
}
