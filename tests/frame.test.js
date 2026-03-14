import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/frame.css", "utf8");

describe("frame.css", () => {
  it("defines .sh-frame with data-label pseudo-header", () => {
    assert.ok(css.includes(".sh-frame"), "missing .sh-frame");
    assert.ok(css.includes("attr(data-label)"), "missing data-label attr");
    assert.ok(css.includes("attr(data-footer)"), "missing data-footer attr");
  });
  it("hides ::before when data-label absent", () => {
    assert.ok(css.includes(":not([data-label])"), "missing no-label guard");
  });
  it("defines .sh-bracket with pseudo brackets", () => {
    assert.ok(css.includes(".sh-bracket"), "missing .sh-bracket");
    assert.ok(css.includes('"["'), "missing [ bracket");
    assert.ok(css.includes('"]"'), "missing ] bracket");
  });
  it("defines .sh-status-pill with variants", () => {
    assert.ok(css.includes(".sh-status-pill"), "missing .sh-status-pill");
    assert.ok(css.includes("--healthy"), "missing healthy variant");
    assert.ok(css.includes("--warning"), "missing warning variant");
    assert.ok(css.includes("--error"), "missing error variant");
  });
  it("defines .sh-cursor-active, working, idle", () => {
    assert.ok(css.includes(".sh-cursor-active"), "missing cursor-active");
    assert.ok(css.includes(".sh-cursor-working"), "missing cursor-working");
    assert.ok(css.includes(".sh-cursor-idle"), "missing cursor-idle");
  });
  it("defines .sh-terminal-bg", () => {
    assert.ok(css.includes(".sh-terminal-bg"), "missing sh-terminal-bg");
    assert.ok(css.includes("repeating-linear-gradient"), "missing CRT stripe");
  });
  it("defines .sh-card and .sh-callout", () => {
    assert.ok(css.includes(".sh-card"), "missing .sh-card");
    assert.ok(css.includes(".sh-callout"), "missing .sh-callout");
  });
  it("cursor blink respects prefers-reduced-motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing motion media query");
  });
});
