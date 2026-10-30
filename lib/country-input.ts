import {countries, type Country} from './geography';
const normalize=(value:string)=>value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z ]/g,'').replace(/\s+/g,' ');
const aliases:Record<string,string>={'turkey':'TR','czech republic':'CZ','bosnia':'BA','bosnia herzegovina':'BA','macedonia':'MK','vatican':'VA','the netherlands':'NL'};
/** Full names only: territory clicks, autocomplete and ISO shortcuts cannot solve route games. */
export function resolveCountryName(value:string):Country|undefined{
 const name=normalize(value);
 if(name.length<3)return;
 return countries.find(country=>normalize(country.name)===name||aliases[name]===country.id);
}
