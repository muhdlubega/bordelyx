import {markerColors,type MapMarkerKind} from '@/lib/map-markers';
type IconProps={kind:MapMarkerKind;size?:number;number?:number;collected?:boolean};
/** Fixed internal SVG paths; user-entered content is never interpolated into this markup. */
function markerIconBody({kind,number,collected}:IconProps){
  const color=markerColors[kind],n=Math.max(0,Math.trunc(Number(number)||0));
  const shapes:Record<MapMarkerKind,string>={
    start:`<circle cx="16" cy="16" r="14" fill="#102820" stroke="${color}" stroke-width="1.5"/><path d="M10 25V7m1 1h13l-4 5 4 5H11" stroke="${color}" fill="#b6f7ce20" stroke-width="2" stroke-linejoin="round"/>`,
    finish:`<path d="m16 1 15 15-15 15L1 16Z" fill="#123035" stroke="${color}" stroke-width="1.5"/><path d="M10 25V8h13v10H10" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 9h4v4h-4Zm8 0h3v4h-3Zm-4 4h4v4h-4Z" fill="${color}"/>`,
    current:`<circle cx="16" cy="16" r="15" fill="#f1f5e81a" stroke="${color}" stroke-width="1.2"/><path d="m16 5 9 21-9-5-9 5Z" fill="${color}" stroke="#17362b" stroke-width="1.5" stroke-linejoin="round"/>`,
    visited:`<circle cx="16" cy="16" r="12" fill="#1b382b" stroke="${color}" stroke-width="1.5"/><text x="16" y="20" font-size="12" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle" fill="${color}">${n||'•'}</text>`,
    checkpoint:`<path d="m16 1 14 15-14 15L2 16Z" fill="${collected?'#203b29':'#3a2d1b'}" stroke="${collected?'#b6f7ce':color}" stroke-width="1.7"/>${collected?'<path d="m9 16 5 5 10-11" stroke="#b6f7ce" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>':`<rect x="8" y="12" width="16" height="11" rx="2" stroke="${color}" stroke-width="1.5"/><path d="M12 12V9h8v3M8 16h16m-8-2v5" stroke="${color}" stroke-width="1.5"/>`}`,
    blocked:`<rect x="3" y="3" width="26" height="26" rx="5" fill="#382224" stroke="${color}" stroke-width="1.5"/><path d="m10 10 12 12m0-12L10 22" stroke="${color}" stroke-width="2.8" stroke-linecap="round"/>`,
    danger:`<path d="M16 2 31 28H1Z" fill="#3c2327" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 10v8" stroke="${color}" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="23" r="1.7" fill="${color}"/>`,
  };
  return shapes[kind];
}
export function markerIconMarkup(props:IconProps){const size=props.size??24;return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" aria-hidden="true" style="display:block;overflow:visible">${markerIconBody(props)}</svg>`;}
export default function MapMarkerIcon(props:IconProps){const size=props.size??24;return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{display:'block',flexShrink:0,overflow:'visible'}} dangerouslySetInnerHTML={{__html:markerIconBody(props)}}/>;}
