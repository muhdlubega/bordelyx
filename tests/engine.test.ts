import assert from 'node:assert/strict';
import test from 'node:test';
import { countries, expeditionCountries, countryById, shortestPath } from '../lib/geography';
import { initialRun, move, tick, validMoves, type Mode } from '../lib/engine';
test('global borders are symmetric and seeded expedition countries remain reachable', () => {
    for (const c of countries) {
        for (const id of c.neighbors) {
            assert.ok(countryById[id], `${c.id} → ${id} exists`);
            assert.ok(countryById[id].neighbors.includes(c.id), `${c.id} ↔ ${id}`);
        }
        if (expeditionCountries.includes(c)) assert.ok(shortestPath('PT', c.id).length);
    }
    assert.deepEqual(shortestPath('PT', 'ES'), ['PT', 'ES']);
    assert.deepEqual(shortestPath('PT', 'ES', ['ES']), []);
});
test('daily seed is deterministic and obstacles preserve objective paths', () => {
    for (const mode of ['rush', 'royale', 'escape', 'heist', 'chain', 'pinpoint'] as Mode[]) {
        const r = initialRun(mode, '2026-10-30');
        assert.deepEqual(r, initialRun(mode, '2026-10-30'));
        assert.ok(shortestPath(r.start, r.target, r.blocked).length);
    }
});
test('route engine rejects non-borders and hardcore ends the run', () => {
    const r = initialRun('rush', 'test');
    const invalid = countries.find(c => c.id !== r.current && !countryById[r.current].neighbors.includes(c.id))!.id;
    assert.equal(move(r, invalid).current, r.current);
    assert.equal(move(r, invalid).invalidMoves, 1);
    assert.equal(move(initialRun('rush', 'test', ['hardcore']), invalid).status, 'lost');
});
test('all seeded rush and heist objectives can be completed', () => {
    for (const mode of ['rush', 'heist'] as Mode[])
        for (let seed = 0; seed < 40; seed++) {
            let r = initialRun(mode, String(seed));
            for (const goal of [...r.checkpoints, r.target]) {
                const path = shortestPath(r.current, goal, r.blocked);
                for (const id of path.slice(1))
                    r = move(r, id);
            }
            assert.equal(r.status, 'won', `${mode} ${seed}: ${r.message}`);
            assert.ok(r.score > 0);
        }
});
test('daily survival has a reachable safe solution', () => {
    for (const mode of ['royale', 'escape'] as Mode[])
        for (let seed = 0; seed < 40; seed++) {
            let r = initialRun(mode, String(seed));
            const path = shortestPath(r.current, r.target, r.blocked);
            for (const id of path.slice(1))
                r = move(r, id);
            assert.equal(r.status, 'won', `${mode} ${seed}: ${r.message}`);
        }
});
test('time is finite and ended runs are immutable', () => {
    const r = tick(initialRun('rush', 'timer'), 500);
    assert.equal(r.status, 'lost');
    assert.equal(r.timeLeft, 0);
    assert.equal(move(r, 'FR'), r);
});
test('pinpoint resolves an exact answer', () => {
    const r = initialRun('pinpoint', 'pin');
    const result = move(r, r.target);
    assert.equal(result.status, 'won');
    assert.equal(result.score, 5000);
});
test('heist intel requires a detour and either collection order remains reachable', () => {
    for (let seed = 0; seed < 40; seed++) {
        const r = initialRun('heist', String(seed)), direct = shortestPath(r.start, r.target);
        assert.ok(r.checkpoints.some(id => !direct.includes(id)), `seed ${seed} has off-route intel`);
        assert.ok(r.optimalMoves > direct.length - 1, `seed ${seed} requires an intel detour`);
        const costs = [r.checkpoints, [...r.checkpoints].reverse()].map(order => {
            let at = r.start, cost = 0;
            for (const id of [...order, r.target]) {
                const path = shortestPath(at, id, r.blocked);
                assert.ok(path.length);
                cost += path.length - 1;
                at = id;
            }
            return cost;
        });
        assert.equal(r.optimalMoves, Math.min(...costs));
    }
});
test('endless chain continues beyond twelve countries and ends when trapped', () => {
    const route = ['PT', 'ES', 'FR', 'BE', 'NL', 'DE', 'PL', 'CZ', 'SK', 'AT', 'SI', 'HR', 'HU', 'RO'];
    let r = initialRun('chain', 'endless', [], true);
    r = { ...r, start: 'PT', current: 'PT', route: ['PT'], blocked: [] };
    assert.equal(r.endless, true);
    assert.equal(r.maxMoves, countries.length);
    for (const id of route.slice(1)) {
        r = move(r, id);
        assert.equal(r.status, 'playing', `${id}: ${r.message}`);
    }
    assert.ok(r.route.length > 12);
    assert.equal(new Set(r.route).size, r.route.length);
    let trapped = initialRun('chain', 'trapped', [], true);
    trapped = { ...trapped, current: 'FR', route: ['FR'], blocked: [] };
    trapped = move(trapped, 'MC');
    assert.equal(trapped.status, 'lost');
    assert.match(trapped.message, /trapped/);
});
test('daily-style chain still ends at twelve and endless is ignored in other modes', () => {
    const route = ['PT', 'ES', 'FR', 'BE', 'NL', 'DE', 'PL', 'CZ', 'SK', 'AT', 'SI', 'HR'];
    let r = initialRun('chain', 'standard');
    r = { ...r, start: 'PT', current: 'PT', route: ['PT'], blocked: [] };
    for (const id of route.slice(1))
        r = move(r, id);
    assert.equal(r.status, 'won');
    assert.equal(r.route.length, 12);
    assert.equal(initialRun('rush', 'ignore', [], true).endless, false);
});
test('heist rejects incompatible one-way restriction without mutating caller settings', () => {
    const modifiers = ['oneWay', 'limited'] as const;
    const r = initialRun('heist', 'compatible', [...modifiers]);
    assert.deepEqual(r.modifiers, ['limited']);
    assert.deepEqual(modifiers, ['oneWay', 'limited']);
});

test('ghost routes are deterministic, solvable and keep endpoint-only restrictions', () => {
    for (let seed = 0; seed < 30; seed++) {
        let run = initialRun('ghost', `ghost-${seed}`, ['blind', 'fog', 'noLabels', 'limited']);
        assert.deepEqual(run, initialRun('ghost', `ghost-${seed}`, ['blind', 'fog', 'noLabels', 'limited']));
        assert.deepEqual(run.modifiers, ['limited']);
        for (const id of shortestPath(run.start, run.target, run.blocked).slice(1)) run = move(run, id);
        assert.equal(run.status, 'won');
    }
});


test('every successful move crosses one border and two-border shortcuts are rejected', () => {
    const run = { ...initialRun('rush', 'one-border'), start: 'PT', current: 'PT', route: ['PT'], blocked: [], danger: [] };
    assert.equal(move(run, 'FR').current, 'PT');
    assert.equal(move(run, 'FR').invalidMoves, 1);
    const next = move(run, 'ES');
    assert.deepEqual(next.route, ['PT', 'ES']);
    assert.equal(next.turn, 1);
    assert.equal(next.score, 150);
    assert.deepEqual(run.route, ['PT']);
});

test('danger waves have no protection and follow each survival mode cadence', () => {
    for (const mode of ['royale', 'escape'] as const) {
        const initial = initialRun(mode, 'danger-cadence');
        const run = { ...initial, start: 'PT', current: 'PT', route: ['PT'], target: 'GR', blocked: [], danger: ['FR'] };
        const next = move(run, 'ES');
        assert.equal(next.danger.includes('ES'), mode === 'escape');
        assert.equal(next.status, mode === 'escape' ? 'lost' : 'playing');
    }
});

test('chain and one-way rules reject previously visited countries', () => {
    for (const [mode, modifiers] of [['chain', []], ['rush', ['oneWay']]] as const) {
        const initial = initialRun(mode, 'no-revisits', [...modifiers]);
        const run = { ...initial, current: 'NL', route: ['FR', 'BE', 'NL'], blocked: [] };
        assert.equal(validMoves(run).includes('BE'), false);
        assert.equal(move(run, 'BE').current, 'NL');
        assert.match(move(run, 'BE').message, /already visited/);
    }
});
