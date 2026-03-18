import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  trackEffect,
  activeEffectCount,
  isOverBudget,
  resetEffects,
  MAX_EFFECTS,
} from "../js/atmosphere.js";

describe("Effect density tracker", () => {
  beforeEach(() => {
    resetEffects();
  });

  it("starts with zero active effects", () => {
    assert.equal(activeEffectCount(), 0);
  });

  it("trackEffect increments count and returns cleanup", () => {
    const cleanup = trackEffect("pulse-1");
    assert.equal(activeEffectCount(), 1);
    cleanup();
    assert.equal(activeEffectCount(), 0);
  });

  it("tracks multiple effects independently", () => {
    const c1 = trackEffect("pulse-1");
    const c2 = trackEffect("glitch-1");
    const c3 = trackEffect("mantra-1");
    assert.equal(activeEffectCount(), 3);
    c2();
    assert.equal(activeEffectCount(), 2);
    c1();
    c3();
    assert.equal(activeEffectCount(), 0);
  });

  it("isOverBudget returns false at MAX_EFFECTS", () => {
    for (let i = 0; i < MAX_EFFECTS; i++) trackEffect(`e-${i}`);
    assert.equal(isOverBudget(), false);
  });

  it("isOverBudget returns true above MAX_EFFECTS", () => {
    for (let i = 0; i <= MAX_EFFECTS; i++) trackEffect(`e-${i}`);
    assert.equal(isOverBudget(), true);
  });

  it("double-cleanup is safe (no negative count)", () => {
    const cleanup = trackEffect("pulse-1");
    cleanup();
    cleanup();
    assert.equal(activeEffectCount(), 0);
  });

  it("MAX_EFFECTS is 3", () => {
    assert.equal(MAX_EFFECTS, 3);
  });
});
