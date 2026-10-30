/** A local, rendering-independent land-border graph. No ferries or overseas borders. */
export interface Country {
    id: string;
    name: string;
    flag: string;
    lon: number;
    lat: number;
    neighbors: string[];
}
const rows: [
    string,
    string,
    number,
    number,
    string
][] = [
    ['PT', 'Portugal', -8, 39.5, 'ES'], ['ES', 'Spain', -3.7, 40.4, 'PT FR AD'], ['AD', 'Andorra', 1.5, 42.5, 'ES FR'],
    ['FR', 'France', 2.4, 46.6, 'ES AD BE LU DE CH IT MC'], ['MC', 'Monaco', 7.42, 43.74, 'FR'],
    ['BE', 'Belgium', 4.7, 50.6, 'FR NL DE LU'], ['NL', 'Netherlands', 5.4, 52.2, 'BE DE'], ['LU', 'Luxembourg', 6.1, 49.8, 'BE FR DE'],
    ['DE', 'Germany', 10.4, 51.1, 'FR BE NL LU CH AT CZ PL DK'], ['DK', 'Denmark', 9.5, 56.2, 'DE'],
    ['CH', 'Switzerland', 8.2, 46.8, 'FR DE AT LI IT'], ['LI', 'Liechtenstein', 9.55, 47.16, 'CH AT'],
    ['AT', 'Austria', 14.1, 47.6, 'DE CH LI IT SI HU SK CZ'], ['IT', 'Italy', 12.6, 42.8, 'FR CH AT SI SM VA'],
    ['SM', 'San Marino', 12.46, 43.94, 'IT'], ['VA', 'Vatican City', 12.45, 41.9, 'IT'],
    ['CZ', 'Czechia', 15.5, 49.8, 'DE AT SK PL'], ['PL', 'Poland', 19.1, 52.1, 'DE CZ SK UA BY LT RU'],
    ['SK', 'Slovakia', 19.7, 48.7, 'CZ PL UA HU AT'], ['HU', 'Hungary', 19.4, 47.2, 'AT SK UA RO RS HR SI'],
    ['SI', 'Slovenia', 14.9, 46.1, 'IT AT HU HR'], ['HR', 'Croatia', 16.4, 45.2, 'SI HU RS BA ME'],
    ['BA', 'Bosnia and Herzegovina', 17.7, 44.2, 'HR RS ME'], ['ME', 'Montenegro', 19.2, 42.7, 'HR BA RS XK AL'],
    ['RS', 'Serbia', 20.8, 44, 'HU RO BG MK XK ME BA HR'], ['XK', 'Kosovo', 20.9, 42.6, 'RS ME AL MK'],
    ['AL', 'Albania', 20, 41.2, 'ME XK MK GR'], ['MK', 'North Macedonia', 21.7, 41.6, 'XK RS BG GR AL'],
    ['GR', 'Greece', 22.8, 39.2, 'AL MK BG TR'], ['BG', 'Bulgaria', 25.4, 42.7, 'RO RS MK GR TR'],
    ['RO', 'Romania', 24.9, 45.9, 'HU RS BG UA MD'], ['MD', 'Moldova', 28.5, 47.2, 'RO UA'],
    ['UA', 'Ukraine', 31.2, 49, 'PL SK HU RO MD BY RU'], ['BY', 'Belarus', 28, 53.5, 'PL LT LV RU UA'],
    ['LT', 'Lithuania', 23.9, 55.2, 'PL RU BY LV'], ['LV', 'Latvia', 24.9, 56.9, 'LT BY RU EE'],
    ['EE', 'Estonia', 25.5, 58.7, 'LV RU'], ['RU', 'Russia', 40, 58, 'NO FI EE LV BY UA GE AZ LT PL'],
    ['FI', 'Finland', 25.8, 64, 'SE NO RU'], ['SE', 'Sweden', 15.5, 62, 'NO FI'], ['NO', 'Norway', 10, 62, 'SE FI RU'],
    ['TR', 'Türkiye', 35.2, 39, 'GR BG GE AM AZ IR IQ SY'], ['GE', 'Georgia', 43.5, 42.1, 'RU AZ AM TR'],
    ['AM', 'Armenia', 44.9, 40.1, 'GE AZ IR TR'], ['AZ', 'Azerbaijan', 47.7, 40.4, 'RU GE AM IR TR'],
    ['IR', 'Iran', 53.7, 32.4, 'TR AM AZ IQ'], ['IQ', 'Iraq', 43.7, 33.2, 'TR IR SY JO SA KW'],
    ['SY', 'Syria', 38.5, 35, 'TR IQ JO IL LB'], ['LB', 'Lebanon', 35.9, 33.9, 'SY IL'],
    ['IL', 'Israel', 34.9, 31.4, 'LB SY JO EG'], ['JO', 'Jordan', 36.2, 31.2, 'SY IQ SA IL'],
    ['SA', 'Saudi Arabia', 45, 24, 'JO IQ KW'], ['KW', 'Kuwait', 47.5, 29.3, 'IQ SA'],
    ['EG', 'Egypt', 29.9, 26.8, 'IL LY'], ['LY', 'Libya', 17.2, 27, 'EG TN DZ'],
    ['TN', 'Tunisia', 9.5, 34, 'LY DZ'], ['DZ', 'Algeria', 2.6, 28, 'TN LY MA'], ['MA', 'Morocco', -6.4, 32, 'DZ'],
];
export const countries: Country[] = rows.map(([id, name, lon, lat, neighbors]) => ({ id, name, lon, lat, neighbors: neighbors.split(' '), flag: id === 'XK' ? '🇽🇰' : String.fromCodePoint(...[...id].map(c => 127397 + c.charCodeAt(0))) }));
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
