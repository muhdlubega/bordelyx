import { countries, countryById, type Country } from './geography';
const normalize = (value: string) => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[’'‐‑‒–—.,-]/g, ' ').replace(/\s+/g, ' ').trim().replace(/^the /, '');
const aliases: Record<string, string> = {
    turkey: 'TR', 'czech republic': 'CZ', bosnia: 'BA', 'bosnia herzegovina': 'BA', macedonia: 'MK', vatican: 'VA', 'the netherlands': 'NL',
    usa: 'US', 'united states of america': 'US', america: 'US', uk: 'GB', britain: 'GB', 'great britain': 'GB', 'united kingdom': 'GB',
    'ivory coast': 'CI', 'cote divoire': 'CI', 'cape verde': 'CV', burma: 'MM', swaziland: 'SZ', 'east timor': 'TL', 'south korea': 'KR', 'north korea': 'KP',
    'dr congo': 'CD', 'democratic republic of congo': 'CD', 'congo kinshasa': 'CD', 'congo brazzaville': 'CG', 'holy see': 'VA', 'state of palestine': 'PS', 'palestinian territories': 'PS',
    'aland islands': 'AX', 'bonaire sint eustatius and saba': 'BQ', 'saint helena ascension and tristan da cunha': 'SH',
    'sint maarten dutch part': 'SX', 'saint martin french part': 'MF', 'falkland islands malvinas': 'FK',
    'virgin islands british': 'VG', 'british virgin islands': 'VG', 'us virgin islands': 'VI', 'virgin islands us': 'VI',
    'saint kitts and nevis': 'KN', 'saint christopher and nevis': 'KN', 'saint lucia': 'LC',
    'saint vincent and the grenadines': 'VC', 'saint pierre and miquelon': 'PM', 'saint martin': 'MF',
    'saint barthelemy': 'BL', 'saint barts': 'BL', 'federated states of micronesia': 'FM',
};
const index = new Map<string, Country>();
for (const country of countries) for (const name of [country.name, ...(country.aliases ?? [])]) index.set(normalize(name), country);
/** Unrestricted country-name entry: no dropdown, regional whitelist or prefix matching. */
export function resolveCountryName(value: string): Country | undefined {
    const name = normalize(value);
    if (/^(?:u\.?s\.?a\.?|u\.?k\.?)$/i.test(value.trim())) return countryById[value.trim().toLowerCase().includes('k') ? 'GB' : 'US'];
    if (aliases[name]) return countryById[aliases[name]];
    if (name.length < 3) return;
    return index.get(name);
}
