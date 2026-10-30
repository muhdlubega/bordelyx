import type { Run } from './engine';
import { countryById } from './geography';
import { getMapPolicy } from './map-policy';

export type MapMarkerKind = 'start' | 'finish' | 'current' | 'visited' | 'checkpoint' | 'blocked' | 'danger';
export type MapMarker = { key:string; countryId:string; kind:MapMarkerKind; label:string; ariaLabel:string; number?:number; collected?:boolean; offset:[number,number] };
export const markerColors:Record<MapMarkerKind,string> = {start:'#b6f7ce',finish:'#7cdee5',current:'#f1f5e8',visited:'#8fbd9e',checkpoint:'#f0bf79',blocked:'#ef9e94',danger:'#ec938b'};
export const markerTitles:Record<MapMarkerKind,string> = {start:'Start',finish:'Finish',current:'You are here',visited:'Visited',checkpoint:'Intel checkpoint',blocked:'Blocked',danger:'Danger zone'};

/** Semantic points only: no unrelated dots, inferred neighbors, or country-name hints. */
export function getMapMarkers(run?:Run):MapMarker[] {
  if(!run) return [];
  const policy=getMapPolicy(run);
  if(!policy.showMap || (run.mode==='pinpoint' && run.status==='playing')) return [];
  const points:MapMarker[]=[];
  const add=(kind:MapMarkerKind,id:string,label='',number?:number,collected?:boolean)=>{
    if(!countryById[id])return;
    const known=!['blocked','danger'].includes(kind);
    points.push({key:`${kind}-${id}`,countryId:id,kind,label,number,collected,offset:[0,0],ariaLabel:`${markerTitles[kind]}${number?` ${number}`:''}${collected?' collected':''}${known?`: ${countryById[id].name}`:''}`});
  };
  if(policy.onlyEndpoints){add('start',run.start,'START');add('finish',run.target,'FINISH');return points;}
  const fog=run.status==='playing'&&run.modifiers.includes('fog');
  const local=new Set([run.current,...countryById[run.current].neighbors,...run.route]);
  const visible=(id:string)=>!fog||local.has(id);
  if(policy.showHazards){
    for(const id of run.danger.filter(visible))add('danger',id);
    for(const id of run.blocked.filter(id=>visible(id)&&!run.danger.includes(id)))add('blocked',id);
  }
  const special=new Set([run.start,run.current,run.target,...run.checkpoints]);
  if(policy.showRoute){const visited=new Set<string>();run.route.forEach((id,index)=>{if(!special.has(id)&&!visited.has(id)){add('visited',id,'',index+1);visited.add(id);}});}
  if(policy.showCheckpoints)run.checkpoints.forEach((id,index)=>{if(visible(id)||run.collected.includes(id))add('checkpoint',id,`INTEL ${index+1}`,index+1,run.collected.includes(id));});
  if(run.mode!=='pinpoint')add('start',run.start,'START');
  add('finish',run.target,run.mode==='pinpoint'?'ANSWER':'FINISH');
  if(policy.showCurrentPosition)add('current',run.current,run.mode==='pinpoint'?'GUESS':'YOU');
  // Preserve every role at a shared country rather than painting one pin over another.
  const groups=new Map<string,MapMarker[]>();
  for(const point of points){const group=groups.get(point.countryId)??[];group.push(point);groups.set(point.countryId,group);}
  for(const group of groups.values())if(group.length>1){group.forEach((point,index)=>{point.offset=[(index-(group.length-1)/2)*34,0];});}
  return points;
}

/** Keep nearby important markers apart in screen pixels while retaining geographic anchors. */
export function layoutMapMarkers(points:MapMarker[],project:(lon:number,lat:number)=>[number,number],scale:number,height=720){
  const occupied:{x:number;y:number}[]=[];
  const important=new Set<MapMarkerKind>(['start','finish','current','checkpoint']);
  const positions=new Map<string,[number,number]>();
  for(const point of [...points].sort((a,b)=>Number(important.has(b.kind))-Number(important.has(a.kind)))){
    const c=countryById[point.countryId], [x,y]=project(c.lon,c.lat);
    let [dx,dy]=point.offset;
    if(important.has(point.kind)){
      for(let attempt=0;attempt<8&&occupied.some(p=>Math.hypot((x-p.x)*scale+dx,(y-p.y)*scale+dy)<32);attempt++){
        const angle=attempt*Math.PI*.75;dx=point.offset[0]+Math.cos(angle)*38;dy=point.offset[1]+Math.sin(angle)*36;
      }
      occupied.push({x:x+dx/scale,y:y+dy/scale});
    }
    dx=Math.max(24-x*scale,Math.min(1000*scale-24-x*scale,dx));
    dy=Math.max(18-y*scale,Math.min(height*scale-38-y*scale,dy));
    positions.set(point.key,[dx,dy]);
  }
  return points.map(point=>({...point,offset:positions.get(point.key)??point.offset}));
}
