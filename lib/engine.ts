import { countries, countryById, shortestPath, distanceKm } from './geography';
export type Mode = 'royale' | 'heist' | 'rush' | 'chain' | 'escape' | 'pinpoint';
export type Modifier = 'blind' | 'noLabels' | 'timeRush' | 'hardcore' | 'fog' | 'limited' | 'oneWay' | 'chaos';
export type Ability = 'dash' | 'shield' | 'scout' | 'reroute' | 'pulse';
export interface Run {
    mode: Mode;
    seed: string;
    modifiers: Modifier[];
    endless?: boolean;
    start: string;
    current: string;
    target: string;
    checkpoints: string[];
    collected: string[];
    route: string[];
    blocked: string[];
    danger: string[];
    turn: number;
    maxMoves: number;
    timeLeft: number;
    score: number;
    status: 'playing' | 'won' | 'lost';
    message: string;
    abilities: Record<Ability, number>;
    effects: {
        dash: boolean;
        shield: boolean;
        scout: boolean;
        pulse: boolean;
    };
    history: Run[];
    invalidMoves: number;
    abilitiesUsed: number;
    optimalMoves: number;
    dangerOrigin: string;
}
export function hashSeed(seed: string): number { let h = 2166136261; for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
} return h >>> 0; }
function random(seed: string) { let n = hashSeed(seed); return () => { n += 0x6D2B79F5; let t = Math.imul(n ^ n >>> 15, 1 | n); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pairs = [['PT', 'HU'], ['FR', 'GR'], ['NL', 'RO'], ['IT', 'PL'], ['ES', 'BG'], ['DE', 'TR'], ['BE', 'AL'], ['CH', 'UA'], ['DK', 'IT'], ['PL', 'GR'], ['MA', 'TR'], ['AT', 'TN']];
export function initialRun(mode: Mode, seed: string, modifiers: Modifier[] = [], endless = false): Run {
    // Intel detours may require revisits; do not enable an incompatible restriction.
    if (mode === 'heist')
        modifiers = modifiers.filter(modifier => modifier !== 'oneWay');
    const rand = random(seed + mode), pool = mode === 'royale' || mode === 'escape' ? pairs.slice(0, 10) : pairs, pair = pool[Math.floor(rand() * pool.length)], start = pair[0], target = pair[1];
    const path = shortestPath(start, target), checkpoints: string[] = [];
    const protectedPaths = [path];
    if (mode === 'heist') {
        const second = path[Math.min(path.length - 2, Math.floor(path.length * 2 / 3))];
        const distance = (a: string, b: string) => shortestPath(a, b).length - 1;
        const cost = (id: string) => Math.min(distance(start, id) + distance(id, second) + distance(second, target), distance(start, second) + distance(second, id) + distance(id, target));
        // Intel lives off the direct route, adding a real route-planning decision.
        const options = countries.filter(c => !path.includes(c.id) && !['VA', 'SM', 'MC', 'LI', 'AD'].includes(c.id))
            .filter(c => cost(c.id) > path.length - 1).sort((a, b) => cost(a.id) - cost(b.id)).slice(0, 6);
        const first = options[Math.floor(rand() * options.length)].id;
        checkpoints.push(first, second);
        // Both collection orders remain available after obstacle generation.
        for (const order of [[first, second], [second, first]]) {
            let at = start;
            for (const goal of [...order, target]) {
                protectedPaths.push(shortestPath(at, goal));
                at = goal;
            }
        }
    }
    const forbidden = new Set(protectedPaths.flat()), blocked = countries.filter(c => !forbidden.has(c.id) && !['VA', 'SM', 'MC', 'LI', 'AD'].includes(c.id)).filter(() => rand() < .06).map(c => c.id);
    const dangerMargin = (id: string) => Math.min(...path.map((step, index) => shortestPath(id, step).length - 1 - Math.floor(index / (mode === 'escape' ? 1 : 2))));
    const dangerOrigin = countries.filter(c => !forbidden.has(c.id)).sort((a, b) => dangerMargin(b.id) - dangerMargin(a.id))[0].id;
    let optimalMoves = path.length - 1;
    if (mode === 'heist') {
        optimalMoves = Math.min(...[checkpoints, [...checkpoints].reverse()].map(order => { let at = start, total = 0; for (const goal of [...order, target]) {
            total += shortestPath(at, goal, blocked).length - 1;
            at = goal;
        } return total; }));
    }
    return { mode, seed, endless: mode === 'chain' && endless, modifiers: [...new Set(modifiers)], start, current: start, target, checkpoints, collected: [], route: [start], blocked,
        danger: mode === 'royale' || mode === 'escape' ? [dangerOrigin] : [], dangerOrigin, turn: 0, maxMoves: mode === 'chain' ? (endless ? countries.length : 20) : optimalMoves + (modifiers.includes('limited') ? 2 : 7),
        timeLeft: modifiers.includes('timeRush') ? 75 : 180, score: 0, status: 'playing', message: mode === 'pinpoint' ? `Find ${countryById[target].name} on the map.` : mode === 'chain' ? (endless ? 'Keep the chain alive. Visit new countries until you are trapped.' : 'Build a chain of 12 unique bordering countries.') : mode === 'heist' ? 'Collect both intel caches, then reach extraction.' : 'Plot your route. Every border is a decision.',
        abilities: { dash: 1, shield: 1, scout: 1, reroute: 1, pulse: 2 }, effects: { dash: false, shield: false, scout: false, pulse: false }, history: [], invalidMoves: 0, abilitiesUsed: 0, optimalMoves };
}
function snapshot(r: Run): Run { return { ...r, history: [] }; }
function copy(r: Run): Run { return { ...r, route: [...r.route], danger: [...r.danger], blocked: [...r.blocked], collected: [...r.collected], abilities: { ...r.abilities }, effects: { ...r.effects }, history: [...r.history] }; }
export function validMoves(r: Run): string[] {
    const forbidden = [...r.blocked, ...r.danger, ...((r.mode === 'chain' || r.modifiers.includes('oneWay')) ? r.route.filter(id => id !== r.current) : [])], candidates = r.effects.dash ? countries.filter(c => { const p = shortestPath(r.current, c.id, forbidden); return p.length >= 2 && p.length <= 3; }).map(c => c.id) : countryById[r.current].neighbors;
    return candidates.filter(id => !forbidden.includes(id) && (!(r.mode === 'chain' || r.modifiers.includes('oneWay')) || !r.route.includes(id)));
}
export function upcomingDanger(r: Run): string[] { return [...new Set(r.danger.flatMap(id => countryById[id].neighbors))].filter(id => !r.danger.includes(id)); }
function finish(r: Run): Run {
    const won = r.mode === 'chain' ? r.route.length >= (r.endless ? countries.length : 12) : r.current === r.target && (r.mode !== 'heist' || r.checkpoints.every(c => r.collected.includes(c)));
    if (won) {
        r.status = 'won';
        r.score += 1000 + Math.max(0, Math.round(r.timeLeft * 3)) + Math.max(0, (r.optimalMoves + 4 - r.turn) * 100);
        r.message = r.mode === 'chain' ? (r.endless ? 'Every country. One extraordinary chain.' : 'Twelve countries. One unbroken chain.') : 'Extraction complete. The world was yours.';
        return r;
    }
    if (r.turn >= r.maxMoves) {
        r.status = 'lost';
        r.message = 'Out of moves. Try a tighter route.';
    }
    else if (r.danger.includes(r.current)) {
        r.status = 'lost';
        r.message = 'The danger zone caught you. Use a Shield before the next expansion.';
    }
    else if (validMoves(r).length === 0) {
        r.status = 'lost';
        r.message = 'Your route is trapped. Try a different opening.';
    }
    return r;
}
export function move(run: Run, countryId: string): Run {
    if (run.status !== 'playing')
        return run;
    const r = copy(run), id = countryId.toUpperCase();
    if (!countryById[id])
        return { ...r, message: 'Choose a country from the map or search.' };
    if (r.mode === 'pinpoint') {
        const km = distanceKm(id, r.target);
        r.route = [id];
        r.current = id;
        r.turn = 1;
        r.status = id === r.target ? 'won' : 'lost';
        r.score = Math.max(0, Math.round(5000 * Math.exp(-km / 1700)));
        r.message = id === r.target ? 'Perfect pinpoint. Right on the world.' : `${countryById[id].name} is ${Math.round(km).toLocaleString()} km from ${countryById[r.target].name} (country centers).`;
        return r;
    }
    if (!validMoves(r).includes(id)) {
        r.invalidMoves++;
        r.score = Math.max(0, r.score - 50);
        r.message = r.blocked.includes(id) ? 'That border is blocked. Reroute can reopen an obstacle.' : r.danger.includes(id) ? 'Danger zone. Find another route.' : 'No valid land border. Try a neighboring country.';
        if (r.modifiers.includes('hardcore')) {
            r.status = 'lost';
            r.message = 'Hardcore: one invalid border ends the run.';
        }
        return r;
    }
    r.history.push(snapshot(run));
    const steps = r.effects.dash ? shortestPath(r.current, id, [...r.blocked, ...r.danger, ...((r.mode === 'chain' || r.modifiers.includes('oneWay')) ? r.route.filter(x => x !== r.current) : [])]).slice(1) : [id];
    if (r.modifiers.includes('oneWay') && steps.some(step => r.route.includes(step)))
        return { ...run, message: 'One-Way Route: you cannot revisit a country.' };
    r.route.push(...steps);
    r.current = id;
    r.turn++;
    r.score += steps.length * 150;
    r.effects.dash = false;
    r.effects.pulse = false;
    r.effects.scout = false;
    for (const step of steps)
        if (r.checkpoints.includes(step) && !r.collected.includes(step)) {
            r.collected.push(step);
            r.score += 350;
        }
    r.message = r.checkpoints.includes(id) ? 'Intel secured. Keep moving.' : `Border crossed. Welcome to ${countryById[id].name}.`;
    // Victory is resolved before the danger wave: reaching extraction is safe.
    if ((r.mode === 'chain' && r.route.length >= (r.endless ? countries.length : 12)) || (r.mode !== 'chain' && id === r.target && (r.mode !== 'heist' || r.checkpoints.every(c => r.collected.includes(c)))))
        return finish(r);
    if ((r.mode === 'royale' || r.mode === 'escape') && r.turn % (r.mode === 'escape' ? 1 : 2) === 0) {
        const wave = upcomingDanger(r);
        r.danger = [...r.danger, ...wave.filter(n => !(r.effects.shield && n === r.current))];
        if (r.effects.shield) {
            r.message = 'Shield absorbed the danger wave.';
            r.effects.shield = false;
        }
        else
            r.message += ' The danger zone is expanding.';
    }
    if (r.modifiers.includes('chaos') && r.turn % 3 === 0) {
        const choices = validMoves(r).filter(n => n !== r.target && !r.checkpoints.includes(n));
        if (choices.length > 1) {
            const chosen = choices[hashSeed(r.seed + r.turn) % choices.length];
            r.blocked.push(chosen);
            r.message = `Chaos event: the border into ${countryById[chosen].name} has closed.`;
        }
    }
    return finish(r);
}
export function useAbility(run: Run, ability: Ability): Run {
    if (run.status !== 'playing' || run.abilities[ability] <= 0)
        return run;
    if (run.modifiers.includes('hardcore') && (ability === 'pulse' || ability === 'scout'))
        return { ...run, message: 'Hardcore disables hints and scouting.' };
    if (run.effects[ability as keyof Run['effects']])
        return { ...run, message: 'That ability is already active.' };
    const r = copy(run);
    r.abilities[ability]--;
    r.abilitiesUsed++;
    if (ability === 'reroute') {
        const local = r.blocked.find(id => countryById[r.current].neighbors.includes(id)), id = local ?? r.blocked[0];
        if (id) {
            r.blocked = r.blocked.filter(x => x !== id);
            r.message = `Reroute opened ${countryById[id].name}.`;
        }
        else {
            r.danger = r.danger.filter(id => !countryById[r.current].neighbors.includes(id));
            r.message = 'Reroute cleared danger on neighboring countries.';
        }
    }
    else {
        r.effects[ability] = true;
        r.message = { dash: 'Dash ready: cross up to two borders in one action.', shield: 'Shield armed. Your country survives one danger wave.', scout: 'Scout online. Next danger wave revealed.', pulse: 'Pulse active. Valid neighboring moves are highlighted.' }[ability];
    }
    return r;
}
export function undoMove(run: Run): Run {
    if (run.modifiers.includes('hardcore') || !run.history.length || run.status !== 'playing')
        return run;
    const previous = run.history[run.history.length - 1];
    // Undo never refunds abilities or time, preventing repeated free casts.
    return { ...previous, abilities: { ...run.abilities }, abilitiesUsed: run.abilitiesUsed, timeLeft: run.timeLeft, history: run.history.slice(0, -1), message: 'Last move undone.' };
}
export function tick(run: Run, seconds = 1): Run {
    if (run.status !== 'playing')
        return run;
    const timeLeft = Math.max(0, run.timeLeft - Math.max(0, seconds));
    return { ...run, timeLeft, ...(timeLeft === 0 ? { status: 'lost' as const, message: 'Time expired. Every second counts.' } : {}) };
}
export function shareText(run: Run): string { return `BORDELYX · ${run.mode.toUpperCase()}\n${run.status === 'won' ? '🟩' : '🟥'} ${run.score.toLocaleString()} pts · ${run.turn} moves\n${run.route.map(id => countryById[id].flag).join(' ')}\nChallenge: ${run.seed}`; }
