import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/modal.css", "utf8");

describe("modal.css", () => {
  it("defines overlay class", () => {
    assert.ok(css.includes(".sh-modal-overlay"), "missing overlay");
  });
  it("defines modal body class", () => {
    assert.ok(css.includes(".sh-modal"), "missing modal");
  });
  it("defines action classes", () => {
    assert.ok(css.includes(".sh-modal-action"), "missing action");
    assert.ok(css.includes(".sh-modal-action--confirm"), "missing confirm variant");
  });
  it("uses overlay token for backdrop", () => {
    assert.ok(css.includes("--bg-overlay"), "missing overlay token");
  });
  it("uses sharp corners", () => {
    assert.ok(css.includes("var(--radius)"), "should use radius token");
  });
  it("respects reduced motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
  it("supports forced colors", () => {
    assert.ok(css.includes("forced-colors"), "missing forced-colors");
  });
});
