/** Generate local country names and a global land-border graph from bundled Natural Earth data. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const readJSON=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const world=await readJSON('../public/world.geojson');
const regional=await readJSON('../lib/regional-geography.json');
const isoCodes=`AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(' ');
const display=new Intl.DisplayNames('en',{type:'region'});
const names={CD:'Democratic Republic of the Congo',CG:'Republic of the Congo',CI:'Côte d’Ivoire',KR:'South Korea',KP:'North Korea',PS:'Palestine',TW:'Taiwan',TR:'Türkiye',VA:'Vatican City'};
// Centers for small countries/territories omitted by the 1:110m atlas. They have no inferred borders.
const centers={AG:[-61.8,17.1],AI:[-63.1,18.2],AS:[-170.7,-14.3],AW:[-69.97,12.52],AX:[19.9,60.2],BB:[-59.54,13.18],BH:[50.55,26.05],BL:[-62.83,17.9],BM:[-64.75,32.3],BQ:[-68.3,12.2],BV:[3.36,-54.42],CC:[96.83,-12.17],CK:[-159.78,-21.24],CV:[-24,16],CW:[-68.99,12.17],CX:[105.63,-10.49],DM:[-61.37,15.41],FM:[158.2,6.9],FO:[-6.9,62],GD:[-61.68,12.12],GF:[-53.1,3.9],GG:[-2.58,49.46],GI:[-5.35,36.14],GP:[-61.55,16.25],GS:[-36.6,-54.4],GU:[144.79,13.44],HK:[114.17,22.32],HM:[73.5,-53.1],IM:[-4.55,54.2],IO:[71.5,-6],JE:[-2.13,49.2],KI:[172.97,1.45],KM:[43.3,-11.7],KN:[-62.75,17.3],KY:[-81.25,19.3],LC:[-60.98,13.91],MF:[-63.07,18.08],MH:[171.18,7.13],MO:[113.54,22.2],MP:[145.75,15.2],MQ:[-61.02,14.64],MS:[-62.2,16.75],MT:[14.4,35.9],MU:[57.55,-20.28],MV:[73.2,3.2],NF:[167.95,-29.04],NR:[166.93,-.53],NU:[-169.87,-19.05],PF:[-149.56,-17.68],PM:[-56.33,46.78],PN:[-128.3,-24.37],PW:[134.5,7.5],RE:[55.53,-21.12],SC:[55.45,-4.62],SG:[103.82,1.35],SH:[-5.7,-15.9],SJ:[18.1,78],ST:[6.61,.19],SX:[-63.06,18.04],TC:[-71.8,21.7],TK:[-171.8,-9.2],TO:[-175.2,-21.2],TV:[179.2,-8.5],UM:[-177.4,28.2],VC:[-61.2,13.25],VG:[-64.6,18.4],VI:[-64.8,18.3],WF:[-176.2,-13.3],WS:[-172.1,-13.8],YT:[45.15,-12.82]};
const records=new Map(isoCodes.map(id=>[id,{id,name:names[id]??display.of(id),lon:centers[id]?.[0]??0,lat:centers[id]?.[1]??0,neighbors:[],aliases:[]}])) ;
records.set('XK',{id:'XK',name:'Kosovo',lon:20.9,lat:42.6,neighbors:[],aliases:[]});
const sourceId=p=>p.ADMIN==='Somaliland'?'SO':p.ADMIN==='Northern Cyprus'?'CY':p.ISO_A2_EH;
const addAlias=(record,value)=>{if(typeof value==='string'&&value&&value!==record.name&&!record.aliases.includes(value))record.aliases.push(value)};
const sourceFeatures=[];
for(const feature of world.features){const p=feature.properties,id=sourceId(p),record=records.get(id);if(!record)continue;
 if(!record.lon&&!record.lat||p.ADMIN!=='Somaliland'&&p.ADMIN!=='Northern Cyprus'){record.lon=p.LABEL_X;record.lat=p.LABEL_Y;}
 for(const field of ['ADMIN','NAME','NAME_LONG','NAME_EN','FORMAL_EN','NAME_CIAWF'])addAlias(record,p[field]);
 sourceFeatures.push({feature,id});
}
const segments=new Map();
const point=([x,y])=>`${x.toFixed(6)},${y.toFixed(6)}`;
for(const {feature,id} of sourceFeatures){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
 for(const polygon of polygons){
  // Keep the existing no-overseas-shortcuts rule: France is its European mainland/Corsica.
  if(id==='FR'&&polygon[0].some(([lon,lat])=>lon < -20 || lat < 35))continue;
  for(const ring of polygon)for(let i=1;i<ring.length;i++){const a=point(ring[i-1]),b=point(ring[i]);if(a===b)continue;const key=a<b?`${a}|${b}`:`${b}|${a}`;if(!segments.has(key))segments.set(key,new Set());segments.get(key).add(id);}
 }
}
const connect=(a,b)=>{if(a===b||!records.has(a)||!records.has(b))return;for(const [left,right] of [[a,b],[b,a]]){const r=records.get(left);if(!r.neighbors.includes(right))r.neighbors.push(right)}};
for(const ids of segments.values()){if(ids.size!==2)continue;const[a,b]=ids;connect(a,b);}
// Preserve hand-verified regional/microstate borders and their stable neighbor ordering.
for(const row of regional){const record=records.get(row.id);record.name=row.name;record.lon=row.lon;record.lat=row.lat;record.neighbors=[...row.neighbors,...record.neighbors.filter(n=>!row.neighbors.includes(n))];for(const n of row.neighbors)connect(row.id,n);}
// Small real borders omitted at this atlas scale; no bridge/ferry-only connections.
for(const [a,b] of [['PS','EG'],['GI','ES'],['GF','BR'],['GF','SR'],['HK','CN'],['MO','CN'],['MF','SX'],['BW','ZM']])connect(a,b);
const result=[...regional.map(row=>records.get(row.id)),...isoCodes.filter(id=>!regional.some(row=>row.id===id)).map(id=>records.get(id))];
for(const r of result){r.lon=Number(r.lon.toFixed(4));r.lat=Number(r.lat.toFixed(4));for(const n of r.neighbors)if(!records.get(n)?.neighbors.includes(r.id))throw Error(`Asymmetric border ${r.id} ↔ ${n}`);}
await mkdir(new URL('../public/data/',import.meta.url),{recursive:true});
await writeFile(new URL('../lib/world-geography.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
await writeFile(new URL('../public/data/borders.json',import.meta.url),JSON.stringify({scope:'Worldwide ISO country/territory names plus Kosovo. Borders derived from bundled Natural Earth shared polygon segments, supplemented by the original regional microstate graph; no ferries or France overseas shortcuts. Small islands have no land borders. Cartography is not a statement regarding sovereignty.',countries:result},null,2)+'\n');
console.log(`Generated ${result.length} country/territory entries and ${result.reduce((sum,r)=>sum+r.neighbors.length,0)/2} land borders.`);
console.log('Atlas-omitted entries:',result.filter(r=>!r.lon&&!r.lat).map(r=>r.id).join(' '));
