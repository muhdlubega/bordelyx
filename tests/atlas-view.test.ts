import test from 'node:test';
import assert from 'node:assert/strict';
import {needsWorldAtlas,projectAtlas} from '../lib/atlas-view';
test('valid routes outside the expedition region switch to a worldwide map',()=>{assert.equal(needsWorldAtlas({route:['PT','ES'],current:'ES',target:'HU'}),false);assert.equal(needsWorldAtlas({route:['RU','CN'],current:'CN',target:'HU'}),true);assert.equal(needsWorldAtlas({route:['US','CA'],current:'CA',target:'MX'}),true)});
test('worldwide projection keeps remote countries inside the atlas',()=>{for(const [lon,lat] of [[-106,57],[104,35],[174,-41]]){const [x,y]=projectAtlas(lon,lat,true);assert.ok(x>=0&&x<=1000);assert.ok(y>=0&&y<=600)}});
