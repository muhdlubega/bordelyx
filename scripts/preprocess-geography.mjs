/** Validate and export the bundled land-border graph. Run with npm run geography. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const src=await readFile(new URL('../lib/geography.ts',import.meta.url),'utf8');
const block=src.slice(src.indexOf('const rows:'),src.indexOf('export const countries'));
const records=[...block.matchAll(/\['([A-Z]{2})','([^']+)',(-?[\d.]+),(-?[\d.]+),'([^']+)'\]/g)].map(([,id,name,lon,lat,neighbors])=>({id,name,lon:Number(lon),lat:Number(lat),neighbors:neighbors.split(' ')}));
const indexed=Object.fromEntries(records.map(c=>[c.id,c]));
for(const c of records)for(const n of c.neighbors){if(!indexed[n]?.neighbors.includes(c.id))throw Error(`Asymmetric or missing border: ${c.id} ↔ ${n}`);}
await mkdir(new URL('../public/data/',import.meta.url),{recursive:true});
await writeFile(new URL('../public/data/borders.json',import.meta.url),JSON.stringify({scope:'Europe, North Africa and western Asia; mainland land borders only. Kosovo modeled separately; no claim regarding status.',countries:records},null,2)+'\n');
console.log(`Validated and exported ${records.length} countries and ${records.reduce((sum,c)=>sum+c.neighbors.length,0)/2} land borders.`);
