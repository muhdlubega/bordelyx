import {countryById} from './geography';
import type {Run} from './engine';

/** Keep the familiar expedition framing until a valid route travels beyond it. */
export function needsWorldAtlas(run?:Pick<Run,'route'|'current'|'target'>):boolean {
  return !!run && [...run.route,run.current,run.target].some(id=>{
    const c=countryById[id];
    return c && (c.lon < -15 || c.lon > 61 || c.lat < 18 || c.lat > 73);
  });
}
export function projectAtlas(lon:number,lat:number,world:boolean):[number,number] {
  return world ? [(lon+180)*1000/360,(90-lat)*600/180] : [(lon+15)*1000/76,(73-lat)*720/55];
}
