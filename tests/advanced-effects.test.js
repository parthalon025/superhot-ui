import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/advanced-effects.css", "utf8");

describe("advanced-effects.css", () => {
  it("defines signal degradation class", () => {
    assert.ok(css.includes(".sh-signal-degraded"), "missing signal-degraded");
  });
  it("signal degradation has jitter keyframe", () => {
    assert.ok(css.includes("sh-signal-jitter"), "missing jitter keyframe");
  });
  it("defines interlace class", () => {
    assert.ok(css.includes(".sh-interlace"), "missing interlace");
  });
  it("interlace uses repeating-linear-gradient", () => {
    assert.ok(css.includes("repeating-linear-gradient"), "missing gradient");
  });
  it("defines burn-in attribute selector", () => {
    assert.ok(css.includes("data-sh-burn-in"), "missing burn-in");
  });
  it("burn-in uses mix-blend-mode screen", () => {
    assert.ok(
      css.includes("mix-blend-mode: screen") || css.includes("mix-blend-mode:screen"),
      "missing screen blend",
    );
  });
  it("defines threshold bar class", () => {
    assert.ok(css.includes(".sh-threshold-bar"), "missing threshold-bar");
  });
  it("threshold bar uses --sh-fill", () => {
    assert.ok(css.includes("--sh-fill"), "missing fill variable");
  });
  it("respects prefers-reduced-motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
  it("defines hardware capability selectors", () => {
    assert.ok(css.includes("data-sh-capability"), "missing capability selectors");
  });
});
