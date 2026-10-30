'use client';
import { useEffect, useRef } from 'react';
import mapboxgl, { type ExpressionSpecification, type GeoJSONSource, type Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { countryById } from '@/lib/geography';
import { validMoves, type Run } from '@/lib/engine';
import { getMapPolicy } from '@/lib/map-policy';
import {needsWorldAtlas} from '@/lib/atlas-view';
export interface MapboxAtlasProps {
    run?: Run;
    onSelect?: (id: string) => void;
    onError?: () => void;
}
const idExpression: ExpressionSpecification = ['coalesce', ['get', 'ISO_A2_EH'], ['get', 'ISO_A2']];
function fillExpression(run?: Run): ExpressionSpecification {
    const match: unknown[] = ['match', idExpression];
    const policy = getMapPolicy(run);
    for (const country of Object.values(countryById)) {
        const id = country.id;
        const fill = policy.showHazards && run?.danger.includes(id) ? '#743b3c' : policy.showHazards && run?.blocked.includes(id) ? '#252d36' : policy.showCurrentPosition && run?.current === id ? '#b4efb4' : run?.target === id && run.mode !== 'pinpoint' ? '#50958b' : policy.showCheckpoints && run?.checkpoints.includes(id) ? run.collected.includes(id) ? '#487e66' : '#826342' : policy.showRoute && run?.route.includes(id) ? '#3f6b59' : policy.showNeighborHints && run && validMoves(run).includes(id) ? '#31594f' : '#233c3e';
        match.push(id, fill);
    }
    match.push('#142e34');
    return match as ExpressionSpecification;
}
function routeData(run?: Run) {
    const coordinates = (getMapPolicy(run).showRoute ? run?.route ?? [] : []).map(id => countryById[id]).filter(Boolean).map(c => [c.lon, c.lat]);
    return { type: 'FeatureCollection' as const, features: coordinates.length > 1 ? [{ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates } }] : [] };
}
/** Optional renderer. All terrain and route data remain local; the game engine never depends on Mapbox. */
export default function MapboxAtlas({ run, onSelect, onError }: MapboxAtlasProps) {
    const host = useRef<HTMLDivElement>(null), map = useRef<MapboxMap | null>(null), markers = useRef<mapboxgl.Marker[]>([]);
    const latest = useRef({ run, onSelect, onError });
    latest.current = { run, onSelect, onError };
    function paint() {
        const atlas = map.current, r = latest.current.run;
        if (!atlas?.getLayer('countries'))
            return;
        atlas.setPaintProperty('countries', 'fill-color', fillExpression(r));
        (atlas.getSource('route') as GeoJSONSource | undefined)?.setData(routeData(r));
        for (const marker of markers.current)
            marker.remove();
        markers.current = [];
        if (!r)
            return;
        const policy = getMapPolicy(r);
        if (needsWorldAtlas(r)) { atlas.setMinZoom(0); atlas.setMaxBounds([[-180,-85],[180,85]]); if (atlas.getZoom() > 2) atlas.fitBounds([[-180,-70],[180,80]],{padding:30,duration:0}); }
        for (const [id, kind] of [...(policy.showCurrentPosition ? [[r.current, 'current']] : []), ...(r.mode === 'pinpoint' ? [] : [[r.target, 'target']]), ...(policy.showCheckpoints ? r.checkpoints.filter(id => !r.collected.includes(id)).map(id => [id, 'intel']) : [])]) {
            const country = countryById[id];
            if (!country)
                continue;
            const el = document.createElement('div');
            el.className = `mapbox-game-marker ${kind}`;
            el.style.cssText = `width:${kind === 'current' ? 18 : 13}px;height:${kind === 'current' ? 18 : 13}px;border-radius:${kind === 'intel' ? '3px' : '50%'};background:${kind === 'intel' ? '#ffc280' : kind === 'target' ? '#7be2d0' : '#c3f6b5'};border:3px solid #16392e;box-shadow:0 0 0 7px #b5f5b31c,0 0 24px #b5f5b355;pointer-events:none;`;
            el.setAttribute('aria-label', `${kind}: ${country.name}`);
            markers.current.push(new mapboxgl.Marker({ element: el }).setLngLat([country.lon, country.lat]).addTo(atlas));
        }
    }
    useEffect(() => {
        if (!host.current)
            return;
        if (!mapboxgl.supported()) {
            latest.current.onError?.();
            return;
        }
        let atlas: MapboxMap;
        try {
            atlas = new mapboxgl.Map({
                container: host.current, accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
                style: { version: 8, sources: { world: { type: 'geojson', data: '/world.geojson' }, route: { type: 'geojson', data: routeData(latest.current.run) } }, layers: [
                        { id: 'ocean', type: 'background', paint: { 'background-color': '#0c222a' } },
                        { id: 'countries', type: 'fill', source: 'world', paint: { 'fill-color': fillExpression(latest.current.run), 'fill-opacity': .96 } },
                        { id: 'borders', type: 'line', source: 'world', paint: { 'line-color': '#65877f', 'line-width': .8 } },
                        { id: 'route-glow', type: 'line', source: 'route', paint: { 'line-color': '#a7eab0', 'line-width': 9, 'line-opacity': .15 } },
                        { id: 'route-line', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#c2f4b5', 'line-width': 3, 'line-dasharray': [2, 2] } },
                    ] },
                center: [20, 46], zoom: 3, minZoom: 2, maxZoom: 8, maxBounds: [[-22, 12], [68, 76]],
                attributionControl: false, performanceMetricsCollection: false, projection: 'mercator', fadeDuration: 250,
            });
            map.current = atlas;
            atlas.on('load', paint);
            atlas.on('error', () => latest.current.onError?.());
            atlas.on('click', 'countries', event => {
                const properties = (event.features?.[0] as unknown as {
                    properties?: Record<string, string>;
                } | undefined)?.properties;
                const id = properties?.ISO_A2_EH || properties?.ISO_A2;
                if (getMapPolicy(latest.current.run).allowCountrySelection && id && countryById[id])
                    latest.current.onSelect?.(id);
            });
            atlas.on('mouseenter', 'countries', () => { atlas.getCanvas().style.cursor = getMapPolicy(latest.current.run).allowCountrySelection ? 'pointer' : 'default'; });
            atlas.on('mouseleave', 'countries', () => { atlas.getCanvas().style.cursor = ''; });
            const resize = new ResizeObserver(() => atlas.resize());
            resize.observe(host.current);
            return () => { resize.disconnect(); for (const marker of markers.current)
                marker.remove(); markers.current = []; atlas.remove(); map.current = null; };
        }
        catch {
            latest.current.onError?.();
        }
    }, []);
    useEffect(() => { paint(); }, [run]);
    return <div className="mapbox-atlas" style={{ position: 'absolute', inset: 0, minHeight: 300 }}><div ref={host} style={{ position: 'absolute', inset: 0 }} aria-label="Unlabeled local geography atlas. Enter country names to move; only Pinpoint uses map selection."/><span style={{ position: 'absolute', bottom: 10, left: 14, fontSize: 9, color: '#8aa9a0', letterSpacing: 2, pointerEvents: 'none' }}>NATURAL EARTH · MAPBOX GL</span></div>;
}
