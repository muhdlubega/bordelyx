import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRun,move,validMoves} from '../lib/engine';
import {getMapMarkers,layoutMapMarkers} from '../lib/map-markers';
import {countryById} from '../lib/geography';

test('start and finish keep distinct roles after the player leaves the start',()=>{
 const run=initialRun('rush','markers');const next=move(run,validMoves(run)[0]);
 const points=getMapMarkers(next);
 assert.equal(points.find(p=>p.kind==='start')?.countryId,run.start);
 assert.equal(points.find(p=>p.kind==='finish')?.countryId,run.target);
 assert.equal(points.find(p=>p.kind==='current')?.countryId,next.current);
 assert.ok(points.every(p=>p.kind!=='visited'||next.route.includes(p.countryId)));
});
test('coincident start/current points both survive with separate positions',()=>{
 const run=initialRun('rush','same-point'),points=getMapMarkers(run),start=points.find(p=>p.kind==='start')!,current=points.find(p=>p.kind==='current')!;
 assert.equal(start.countryId,current.countryId);assert.notDeepEqual(start.offset,current.offset);
});
test('Ghost Route exposes exactly two fixed endpoints before and after a move',()=>{
 let run=initialRun('ghost','ghost-markers');const before=getMapMarkers(run);run=move(run,validMoves(run)[0]);const after=getMapMarkers(run);
 assert.deepEqual(before.map(p=>[p.kind,p.countryId]),[['start',run.start],['finish',run.target]]);
 assert.deepEqual(after.map(p=>[p.kind,p.countryId]),before.map(p=>[p.kind,p.countryId]));
});
test('Pinpoint hides all answer points during play and reveals answer/guess on completion',()=>{
 const run=initialRun('pinpoint','pin-markers');assert.deepEqual(getMapMarkers(run),[]);
 const result=move(run,run.target);assert.deepEqual(getMapMarkers(result).map(p=>p.kind),['finish','current']);
});
test('intel checkpoints retain numbered collected-state markers',()=>{
 const run=initialRun('heist','intel-markers');run.collected=[run.checkpoints[0]];
 const caches=getMapMarkers(run).filter(p=>p.kind==='checkpoint');assert.equal(caches.length,2);assert.equal(caches[0].number,1);assert.equal(caches[0].collected,true);assert.equal(caches[1].number,2);
});
test('fog hides distant hazards while retaining the known start and destination',()=>{
 const run=initialRun('royale','fog-markers',['fog']);run.danger=['CN'];run.blocked=['US'];
 const points=getMapMarkers(run);assert.equal(points.some(p=>['danger','blocked'].includes(p.kind)),false);assert.ok(points.some(p=>p.kind==='start'));assert.ok(points.some(p=>p.kind==='finish'));
 assert.deepEqual(getMapMarkers({...run,modifiers:['blind']}),[]);
});
test('hazard marker labels do not disclose unguessed country names',()=>{
 const run=initialRun('rush','hazard-markers');run.blocked=['CN'];const blocked=getMapMarkers(run).find(p=>p.kind==='blocked')!;
 assert.equal(blocked.ariaLabel,'Blocked');assert.equal(blocked.label,'');
});
test('nearby primary point layout separates markers in screen pixels',()=>{
 const run=initialRun('rush','layout');const points=getMapMarkers(run).filter(p=>['start','finish','current'].includes(p.kind));
 const laidOut=layoutMapMarkers(points,()=>[500,300],.35);
 const current=laidOut.find(p=>p.kind==='current')!,start=laidOut.find(p=>p.kind==='start')!;
 assert.ok(Math.hypot(current.offset[0]-start.offset[0],current.offset[1]-start.offset[1])>=32);
 assert.ok(laidOut.every(p=>countryById[p.countryId]));
});
