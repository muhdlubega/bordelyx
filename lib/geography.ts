/** A local, rendering-independent land-border graph. No ferries or overseas borders. */
export interface Country {
    id: string;
    name: string;
    flag: string;
    lon: number;
    lat: number;
    neighbors: string[];
    aliases?: string[];
}
import globalData from './world-geography.json';
import regionalData from './regional-geography.json';
/** A global local graph; islands and separate landmasses intentionally need not be connected. */
export const countries: Country[] = globalData.map(country => ({ ...country, flag: country.id === 'XK' ? '🇽🇰' : String.fromCodePoint(...[...country.id].map(c => 127397 + c.charCodeAt(0))) }));
/** Stable original challenge pool; guesses and movement may use the full world graph. */
export const expeditionCountries: Country[] = regionalData.map(row => countries.find(country => country.id === row.id)!);
export const countryById: Record<string, Country> = Object.fromEntries(countries.map(c => [c.id, c]));
export function shortestPath(start: string, end: string, blocked: string[] = []): string[] {
    if (!countryById[start] || !countryById[end] || blocked.includes(end))
        return [];
    const queue: string[][] = [[start]], seen = new Set([start]), forbidden = new Set(blocked);
    for (let i = 0; i < queue.length; i++) {
        const path = queue[i], last = path[path.length - 1];
        if (last === end)
            return path;
        for (const n of countryById[last].neighbors)
            if (!seen.has(n) && !forbidden.has(n)) {
                seen.add(n);
                queue.push([...path, n]);
            }
    }
    return [];
}
export function distanceKm(a: string, b: string): number {
    const x = countryById[a], y = countryById[b];
    if (!x || !y)
        return Infinity;
    const rad = Math.PI / 180, dlat = (y.lat - x.lat) * rad, dlon = (y.lon - x.lon) * rad;
    const v = Math.sin(dlat / 2) ** 2 + Math.cos(x.lat * rad) * Math.cos(y.lat * rad) * Math.sin(dlon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}
