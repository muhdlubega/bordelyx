import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export type RecordRun = {
    seed: string;
    mode: string;
    score: number;
    won: boolean;
    date: string;
};
export interface ProgressData {
    runs: RecordRun[];
    dailyDates: string[];
    streak: number;
    best: number;
    achievements: string[];
}
interface Progress extends ProgressData {
    save: (r: RecordRun, daily?: boolean) => void;
}
const utcToday = () => new Date().toISOString().slice(0, 10);
function previousDay(date: string): string { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); }
/** A circuit streak remains live until the end of the next UTC day. */
export function calculateStreak(dates: string[], today = utcToday()): number {
    const completed = new Set(dates);
    let cursor = completed.has(today) ? today : previousDay(today), streak = 0;
    while (completed.has(cursor)) {
        streak++;
        cursor = previousDay(cursor);
    }
    return streak;
}
export function recordProgress(s: ProgressData, r: RecordRun, daily = false, today = utcToday()): ProgressData {
    const completed = daily && r.won;
    const dailyDates = completed ? [...new Set([...s.dailyDates, r.date])].sort() : s.dailyDates;
    const streak = calculateStreak(dailyDates, today);
    const achievements = [...new Set([...s.achievements, 'First expedition', ...(r.won ? ['Border breaker'] : []), ...(r.score >= 3000 ? ['Atlas ace'] : []), ...(completed ? ['Circuit finisher'] : []), ...(streak >= 3 ? ['On fire'] : [])])];
    return { runs: [r, ...s.runs].slice(0, 100), dailyDates, streak, best: Math.max(s.best, r.score), achievements };
}
const useProgressStore = create<Progress>()(persist((set) => ({
    runs: [], dailyDates: [], streak: 0, best: 0, achievements: [],
    save: (r, daily = false) => set(s => recordProgress(s, r, daily))
}), {
    name: 'bordelyx-progress-v1',
    merge: (persisted, current) => { const saved = persisted as Partial<ProgressData> | undefined; return { ...current, ...saved, streak: calculateStreak(saved?.dailyDates ?? []) }; }
}));
/** Recompute on render too, so reopening the passport after midnight expires old streaks. */
export function useProgress(): Progress { const state = useProgressStore(); return { ...state, streak: calculateStreak(state.dailyDates) }; }
