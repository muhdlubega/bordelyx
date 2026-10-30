import type { Run } from './engine';

/** Central rendering contract: route knowledge comes from typed answers, never map clicks. */
export function getMapPolicy(run?: Run) {
    const playing = run?.status === 'playing';
    const onlyEndpoints = playing && run?.mode === 'ghost';
    const pinpoint = run?.mode === 'pinpoint';
    return {
        onlyEndpoints,
        showMap: !(playing && run?.modifiers.includes('blind')),
        showCountryShapes: !onlyEndpoints,
        showCountryLabels: !playing,
        allowCountrySelection: playing && pinpoint,
        showRoute: !onlyEndpoints && (!playing || !pinpoint),
        showCurrentPosition: !onlyEndpoints && (!playing || !pinpoint),
        showCheckpoints: !onlyEndpoints && !pinpoint,
        showHazards: !onlyEndpoints && !pinpoint,
        showNeighborHints: false,
        showScoutHints: false,
        showTinyCountries: !onlyEndpoints,
    };
}
