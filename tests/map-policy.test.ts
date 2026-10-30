import assert from 'node:assert/strict';
import test from 'node:test';
import { initialRun, move, useAbility, type Mode } from '../lib/engine';
import { getMapPolicy } from '../lib/map-policy';
import { shortestPath } from '../lib/geography';

test('routing modes hide country names and disallow all map selection by default', () => {
    for (const mode of ['rush', 'royale', 'heist', 'chain', 'escape', 'ghost'] as Mode[]) {
        const policy = getMapPolicy(initialRun(mode, 'typed-only'));
        assert.equal(policy.allowCountrySelection, false, mode);
        assert.equal(policy.showCountryLabels, false, mode);
        assert.equal(policy.showNeighborHints, false, mode);
    }
});
test('only a limited Pulse charge reveals neighboring options', () => {
    const run = initialRun('rush', 'pulse-hint');
    assert.equal(getMapPolicy(run).showNeighborHints, false);
    const pulsed = useAbility(run, 'pulse');
    assert.equal(pulsed.abilities.pulse, run.abilities.pulse - 1);
    assert.equal(getMapPolicy(pulsed).showNeighborHints, true);
    assert.equal(getMapPolicy(pulsed).allowCountrySelection, false);
    assert.equal(getMapPolicy(pulsed).showCountryLabels, false);
});
test('ghost map shows only start and end throughout the route, then reveals the result', () => {
    let run = initialRun('ghost', 'hidden-itinerary');
    const path = shortestPath(run.start, run.target, run.blocked);
    for (const id of path.slice(1, -1)) {
        run = move(run, id);
        const policy = getMapPolicy(run);
        assert.equal(policy.onlyEndpoints, true);
        for (const key of ['showCountryShapes', 'showCountryLabels', 'showRoute', 'showCurrentPosition', 'showCheckpoints', 'showHazards', 'showNeighborHints', 'showScoutHints', 'showTinyCountries'] as const) assert.equal(policy[key], false, key);
    }
    run = move(run, run.target);
    assert.equal(run.status, 'won');
    assert.equal(getMapPolicy(run).onlyEndpoints, false);
    assert.equal(getMapPolicy(run).showCountryShapes, true);
    assert.equal(getMapPolicy(run).showRoute, true);
    assert.equal(getMapPolicy(run).showCountryLabels, true);
    assert.equal(getMapPolicy(run).allowCountrySelection, false);
});
test('Pinpoint remains map-selectable with names and answer markers hidden', () => {
    const policy = getMapPolicy(initialRun('pinpoint', 'map-guess'));
    assert.equal(policy.allowCountrySelection, true);
    assert.equal(policy.showCountryLabels, false);
    assert.equal(policy.showCurrentPosition, false);
    assert.equal(policy.showNeighborHints, false);
    assert.equal(policy.showHazards, false);
});
