import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCountryName} from '../lib/country-input';
test('typed moves require a complete country name rather than a code or prefix',()=>{assert.equal(resolveCountryName('FR'),undefined);assert.equal(resolveCountryName('Fran'),undefined);assert.equal(resolveCountryName('France')?.id,'FR');assert.equal(resolveCountryName('  germany  ')?.id,'DE')});
test('common country names and accent-insensitive names resolve to supported territories',()=>{assert.equal(resolveCountryName('Turkey')?.id,'TR');assert.equal(resolveCountryName('Türkiye')?.id,'TR');assert.equal(resolveCountryName('Turkiye')?.id,'TR');assert.equal(resolveCountryName('Czech Republic')?.id,'CZ');assert.equal(resolveCountryName('not a country'),undefined)});
test('worldwide names and common names are accepted without a regional whitelist',()=>{
 for(const [name,id] of [['China','CN'],['Canada','CA'],['United States','US'],['USA','US'],['United States of America','US'],['United Kingdom','GB'],['UK','GB'],['Japan','JP'],['Australia','AU'],['Fiji','FJ'],['South Korea','KR'],['Côte d’Ivoire','CI'],['New Zealand','NZ'],['Brazil','BR'],['Antigua and Barbuda','AG'],['Saint Kitts and Nevis','KN'],['Saint Lucia','LC'],['Saint Vincent and the Grenadines','VC'],['São Tomé and Príncipe','ST'],['Federated States of Micronesia','FM']])assert.equal(resolveCountryName(name)?.id,id,name);
 assert.equal(resolveCountryName('Atlantis'),undefined);
 assert.equal(resolveCountryName('Chin'),undefined);
});
test('invalid inserted digits and punctuation are not silently rewritten as correct countries',()=>{for(const name of ['Can4ada','France123','Ger!many',"Cana'da",'Fr.ance','Chi$na','Atlantis'])assert.equal(resolveCountryName(name),undefined,name);assert.equal(resolveCountryName('Côte d’Ivoire')?.id,'CI');assert.equal(resolveCountryName('Timor-Leste')?.id,'TL');assert.equal(resolveCountryName('U.S.A.')?.id,'US');assert.equal(resolveCountryName('U.K.')?.id,'GB')});
