import type {Run} from '@/lib/engine';
import {getMapPolicy} from '@/lib/map-policy';
import type {MapMarkerKind} from '@/lib/map-markers';
import MapMarkerIcon from './MapMarkerIcon';
export default function MapLegend({run}:{run:Run}){
  const policy=getMapPolicy(run);
  if(!policy.showMap || run.mode==='pinpoint'&&run.status==='playing')return null;
  const entries:{kind:MapMarkerKind;label:string}[]=run.mode==='pinpoint'?[{kind:'finish',label:'Answer'},{kind:'current',label:'Your guess'}]:[{kind:'start',label:'Start'},{kind:'finish',label:'Finish'}];
  if(!policy.onlyEndpoints && run.mode!=='pinpoint'){
    entries.push({kind:'current',label:'You'},{kind:'visited',label:'Visited'});
    if(run.mode==='heist')entries.push({kind:'checkpoint',label:'Intel'});
    if(run.blocked.length)entries.push({kind:'blocked',label:'Blocked'});
    if(run.danger.length)entries.push({kind:'danger',label:'Danger'});
  }
  return <div className="map-legend map-marker-legend" aria-label="Map marker legend" style={{flexWrap:'wrap',gap:'8px 14px'}}>{entries.map(({kind,label})=><span key={kind}><MapMarkerIcon kind={kind} size={17} number={kind==='visited'?2:undefined}/>{label}</span>)}</div>;
}
