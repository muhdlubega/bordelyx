import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateStreak, recordProgress, type ProgressData } from '../lib/progress';
const empty: ProgressData = { runs: [], dailyDates: [], streak: 0, best: 0, achievements: [] };
const win = { seed: 'daily', mode: 'circuit', score: 3400, won: true, date: '2026-10-30' };
test('streak expires after a missed UTC day and does not retain historical maximum', () => {
    const dates = ['2026-10-26', '2026-10-27', '2026-10-28'];
    assert.equal(calculateStreak(dates, '2026-10-28'), 3);
    assert.equal(calculateStreak(dates, '2026-10-29'), 3);
    assert.equal(calculateStreak(dates, '2026-10-30'), 0);
    const reset = recordProgress({ ...empty, dailyDates: dates, streak: 3 }, win, true, '2026-10-30');
    assert.equal(reset.streak, 1);
    assert.equal(reset.best, 3400);
});
test('daily retries count once and UTC month boundaries are consecutive', () => {
    const dates = ['2026-09-30', '2026-10-01', '2026-10-01'];
    assert.equal(calculateStreak(dates, '2026-10-02'), 2);
    const saved = recordProgress(recordProgress(empty, win, true, '2026-10-30'), win, true, '2026-10-30');
    assert.equal(saved.streak, 1);
    assert.deepEqual(saved.dailyDates, ['2026-10-30']);
});
test('failed circuits and practice runs do not award daily completion', () => {
    const failed = recordProgress(empty, { ...win, won: false }, true, '2026-10-30');
    assert.equal(failed.streak, 0);
    assert.deepEqual(failed.dailyDates, []);
    assert.ok(!failed.achievements.includes('Circuit finisher'));
    const practice = recordProgress(empty, win, false, '2026-10-30');
    assert.equal(practice.streak, 0);
    assert.deepEqual(practice.dailyDates, []);
});
test('saving practice after an expired streak clears the displayed count but preserves badges', () => {
    const old = { ...empty, dailyDates: ['2026-10-25', '2026-10-26', '2026-10-27'], streak: 3, achievements: ['On fire'] };
    const saved = recordProgress(old, win, false, '2026-10-30');
    assert.equal(saved.streak, 0);
    assert.ok(saved.achievements.includes('On fire'));
});
