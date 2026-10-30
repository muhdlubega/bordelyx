import assert from 'node:assert/strict';
import test from 'node:test';
import { countries, countryById, shortestPath } from '../lib/geography';
import { initialRun, move, useAbility, undoMove, tick, validMoves, type Mode } from '../lib/engine';
test('local borders are symmetric and every node is reachable', () => {
    for (const c of countries) {
        for (const id of c.neighbors) {
            assert.ok(countryById[id], `${c.id} → ${id} exists`);
            assert.ok(countryById[id].neighbors.includes(c.id), `${c.id} ↔ ${id}`);
        }
        assert.ok(shortestPath('PT', c.id).length);
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
test('dash consumes a single charge and crosses two borders in one turn', () => {
    let r = initialRun('rush', 'dash');
    r = useAbility(r, 'dash');
    assert.equal(r.abilities.dash, 0);
    const target = validMoves(r).find(id => shortestPath(r.current, id, [...r.blocked, ...r.danger]).length === 3)!;
    assert.ok(target);
    r = move(r, target);
    assert.equal(r.turn, 1);
    assert.equal(r.route.length, 3);
    assert.equal(r.effects.dash, false);
    assert.equal(useAbility(r, 'dash').abilities.dash, 0);
});
test('shield protects its country for one danger wave', () => {
    let r = initialRun('escape', 'shield');
    const next = validMoves(r)[0];
    const neighbor = countryById[next].neighbors.find(id => id !== r.current)!;
    r = { ...r, danger: [neighbor] };
    r = useAbility(r, 'shield');
    r = move(r, next);
    assert.ok(!r.danger.includes(next));
    assert.equal(r.effects.shield, false);
    assert.notEqual(r.status, 'lost');
});
test('undo does not refund time or used abilities and cannot bypass hardcore', () => {
    let r = initialRun('rush', 'undo');
    r = move(r, validMoves(r)[0]);
    r = useAbility(r, 'pulse');
    r = tick(r, 10);
    const restored = undoMove(r);
    assert.equal(restored.current, r.start);
    assert.equal(restored.timeLeft, r.timeLeft);
    assert.equal(restored.abilities.pulse, 1);
    let hardcore = initialRun('rush', 'undo', ['hardcore']);
    hardcore = move(hardcore, validMoves(hardcore)[0]);
    assert.equal(undoMove(hardcore), hardcore);
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
test('dash cannot cross a visited intermediate country in chain or one-way runs', () => {
    for (const [mode, mods] of [['chain', []], ['rush', ['oneWay']]] as const) {
        let r = initialRun(mode, 'dash-no-repeat', [...mods]);
        r = { ...r, start: 'FR', current: 'NL', route: ['FR', 'BE', 'NL'], blocked: ['DE'] };
        r = useAbility(r, 'dash');
        assert.ok(!validMoves(r).includes('LU'), 'NL → BE → LU must not reuse Belgium');
        assert.equal(move(r, 'LU').current, 'NL');
        r = { ...r, blocked: [] };
        assert.ok(validMoves(r).includes('LU'), 'an unvisited two-border alternative is legal');
        const moved = move(r, 'LU');
        assert.deepEqual(moved.route, ['FR', 'BE', 'NL', 'DE', 'LU']);
        assert.equal(new Set(moved.route).size, moved.route.length);
    }
});
test('heist rejects incompatible one-way restriction without mutating caller settings', () => {
    const modifiers = ['oneWay', 'limited'] as const;
    const r = initialRun('heist', 'compatible', [...modifiers]);
    assert.deepEqual(r.modifiers, ['limited']);
    assert.deepEqual(modifiers, ['oneWay', 'limited']);
});
