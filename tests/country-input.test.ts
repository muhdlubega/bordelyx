import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCountryName} from '../lib/country-input';
test('typed moves require a complete country name rather than a code or prefix',()=>{assert.equal(resolveCountryName('FR'),undefined);assert.equal(resolveCountryName('Fran'),undefined);assert.equal(resolveCountryName('France')?.id,'FR');assert.equal(resolveCountryName('  germany  ')?.id,'DE')});
test('common country names and accent-insensitive names resolve to supported territories',()=>{assert.equal(resolveCountryName('Turkey')?.id,'TR');assert.equal(resolveCountryName('Türkiye')?.id,'TR');assert.equal(resolveCountryName('Turkiye')?.id,'TR');assert.equal(resolveCountryName('Czech Republic')?.id,'CZ');assert.equal(resolveCountryName('not a country'),undefined)});
