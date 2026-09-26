import test from 'node:test';
import assert from 'node:assert/strict';
import { typewriterText, wordStagger, punchSlam, statCallout, endCardLockup } from '../src/typography.js';

function mockP5() {
  const calls = [];
  return {
    calls,
    CENTER: 'center',
    LEFT: 'left',
    BOLD: 'bold',
    NORMAL: 'normal',
    push() { calls.push('push'); },
    pop() { calls.push('pop'); },
    textAlign() {},
    textStyle() {},
    textFont() {},
    textSize() {},
    fill() {},
    noStroke() {},
    translate() {},
    rotate() {},
    scale() {},
    text(str) { calls.push(`text:${str}`); },
    textWidth(str) { return str.length * 10; },
    drawingContext: { globalAlpha: 1 }
  };
}

test('typewriterText renders partial text over time', () => {
  const p = mockP5();
  typewriterText(p, 'HELLO', 0, 0, 0.1, 0, 20);
  const hasText = p.calls.some(c => c.startsWith('text:HE'));
  assert.ok(hasText, 'should render first 2 characters');
});

test('typewriterText renders nothing before start', () => {
  const p = mockP5();
  typewriterText(p, 'HELLO', 0, 0, 0, 1, 20);
  const textCall = p.calls.find(c => c.startsWith('text:'));
  assert.ok(textCall === 'text:█' || textCall === 'text:', 'should only show cursor or nothing');
});

test('wordStagger renders each word', () => {
  const p = mockP5();
  wordStagger(p, 'Motion Graphics Engine', 0, 0, 1, 0);
  const textCalls = p.calls.filter(c => c.startsWith('text:'));
  assert.equal(textCalls.length, 3);
  assert.deepEqual(textCalls, ['text:Motion', 'text:Graphics', 'text:Engine']);
});

test('punchSlam renders text when active', () => {
  const p = mockP5();
  punchSlam(p, 'BOOM', 100, 100, 0.2, 0);
  const textCall = p.calls.find(c => c.startsWith('text:BOOM'));
  assert.ok(textCall, 'should render BOOM');
});

test('punchSlam does nothing before trigger time', () => {
  const p = mockP5();
  punchSlam(p, 'BOOM', 100, 100, 0.5, 1.0);
  const textCall = p.calls.find(c => c.startsWith('text:BOOM'));
  assert.equal(textCall, undefined, 'should not render before trigger');
});

test('statCallout renders value then label', () => {
  const p = mockP5();
  statCallout(p, '40%', 'faster renders', 100, 100, 0.8, 0);
  const texts = p.calls.filter(c => c.startsWith('text:'));
  assert.ok(texts.some(c => c.includes('40%')), 'should render stat value');
  assert.ok(texts.some(c => c.includes('faster renders')), 'should render stat label');
});

test('statCallout renders nothing before start', () => {
  const p = mockP5();
  statCallout(p, '40%', 'faster renders', 100, 100, 0, 1.0);
  assert.equal(p.calls.filter(c => c.startsWith('text:')).length, 0);
});

test('endCardLockup renders headline and subline', () => {
  const p = mockP5();
  endCardLockup(p, ['SHIP IT', 'claude directs · code draws'], 640, 300, 1.0, 0);
  const texts = p.calls.filter(c => c.startsWith('text:'));
  assert.ok(texts.length >= 4, 'should render headline words plus subline words');
});
