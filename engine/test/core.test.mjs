import test from 'node:test'; import assert from 'node:assert/strict'; import { rng, norm, ease } from '../src/core.js';
test('seeded RNG is repeatable',()=>{const a=rng(42),b=rng(42);assert.deepEqual(Array.from({length:20},()=>a()),Array.from({length:20},()=>b()))});
test('normalization clamps',()=>{assert.equal(norm(-1,0,10),0);assert.equal(norm(5,0,10),.5);assert.equal(norm(20,0,10),1)});test('ease endpoints',()=>{assert.equal(ease(0),0);assert.equal(ease(1),1)});
