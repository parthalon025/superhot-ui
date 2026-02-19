import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { applyFreshness } from '../js/freshness.js';

// Minimal DOM element mock
function mockElement() {
  const attrs = {};
  return {
    setAttribute(name, value) { attrs[name] = value; },
    getAttribute(name) { return attrs[name] ?? null; },
    _attrs: attrs,
  };
}

describe('applyFreshness', () => {
  let el;

  beforeEach(() => {
    el = mockElement();
  });

  it('returns fresh for recent timestamp', () => {
    const result = applyFreshness(el, Date.now());
    assert.equal(result, 'fresh');
    assert.equal(el._attrs['data-sh-state'], 'fresh');
  });

  it('returns cooling for 10-minute-old timestamp', () => {
    const tenMinAgo = Date.now() - 10 * 60 * 1000;
    const result = applyFreshness(el, tenMinAgo);
    assert.equal(result, 'cooling');
  });

  it('returns frozen for 45-minute-old timestamp', () => {
    const fortyFiveMinAgo = Date.now() - 45 * 60 * 1000;
    const result = applyFreshness(el, fortyFiveMinAgo);
    assert.equal(result, 'frozen');
  });

  it('returns stale for 2-hour-old timestamp', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const result = applyFreshness(el, twoHoursAgo);
    assert.equal(result, 'stale');
  });

  it('handles Date object input', () => {
    const result = applyFreshness(el, new Date());
    assert.equal(result, 'fresh');
  });

  it('handles custom thresholds', () => {
    const fiveSecAgo = Date.now() - 5000;
    const result = applyFreshness(el, fiveSecAgo, { cooling: 3, frozen: 10, stale: 20 });
    assert.equal(result, 'cooling');
  });

  it('returns fresh for null element', () => {
    const result = applyFreshness(null, Date.now());
    assert.equal(result, 'fresh');
  });

  it('returns fresh for null timestamp', () => {
    const result = applyFreshness(el, null);
    assert.equal(result, 'fresh');
  });

  it('returns fresh for future timestamp', () => {
    const future = Date.now() + 60000;
    const result = applyFreshness(el, future);
    assert.equal(result, 'fresh');
  });

  it('respects exact boundary at cooling threshold', () => {
    const exactlyCooling = Date.now() - 300 * 1000;
    const result = applyFreshness(el, exactlyCooling);
    assert.equal(result, 'cooling');
  });
});
