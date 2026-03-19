import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/matrix-rain.css", "utf8");

describe("matrix-rain.css", () => {
  it("defines matrix rain container", () => {
    assert.ok(css.includes(".sh-matrix-rain"), "missing matrix-rain");
  });
  it("defines canvas overlay", () => {
    assert.ok(css.includes(".sh-matrix-rain-canvas"), "missing canvas class");
  });
  it("respects reduced motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
  it("respects hardware capability", () => {
    assert.ok(css.includes("data-sh-capability"), "missing capability");
  });
});
