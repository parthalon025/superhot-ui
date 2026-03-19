import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { EscalationTimer } from "../js/escalation.js";

describe("EscalationTimer", () => {
  it("starts at level 0 (component)", () => {
    const timer = new EscalationTimer();
    assert.strictEqual(timer.level, 0);
    assert.strictEqual(timer.levelName, "component");
  });
  it("advance increments level and calls onEscalate", () => {
    const cb = mock.fn();
    const timer = new EscalationTimer({ onEscalate: cb });
    timer.advance();
    assert.strictEqual(timer.level, 1);
    assert.strictEqual(timer.levelName, "sidebar");
    assert.strictEqual(cb.mock.calls.length, 1);
    assert.deepStrictEqual(cb.mock.calls[0].arguments, [1, "sidebar"]);
  });
  it("does not exceed max level", () => {
    const timer = new EscalationTimer();
    timer.level = 3;
    timer.advance();
    assert.strictEqual(timer.level, 3);
  });
  it("reset goes back to 0 and calls onReset", () => {
    const cb = mock.fn();
    const timer = new EscalationTimer({ onReset: cb });
    timer.level = 2;
    timer.reset();
    assert.strictEqual(timer.level, 0);
    assert.strictEqual(cb.mock.calls.length, 1);
  });
  it("stop cancels pending timers", () => {
    const timer = new EscalationTimer();
    timer.start();
    timer.stop();
    assert.strictEqual(timer._timerId, null);
  });
  it("walks through all levels", () => {
    const levels = [];
    const timer = new EscalationTimer({
      onEscalate: (l, n) => levels.push(n),
    });
    timer.advance(); // 1 sidebar
    timer.advance(); // 2 section
    timer.advance(); // 3 layout
    timer.advance(); // should not go past 3
    assert.deepStrictEqual(levels, ["sidebar", "section", "layout"]);
    assert.strictEqual(timer.level, 3);
  });
});
