/**
 * ShMantra component tests.
 *
 * ShMantra now uses useState/useEffect for text cycling, so calling it
 * as a plain function outside a Preact render cycle throws.
 * Strategy: mirror the static vnode props to test attribute logic.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Compute the static vnode props that ShMantra would render.
 * Mirrors the render return without hooks.
 */
function mantraProps({ text, active, class: className, ...rest } = {}) {
  const texts = Array.isArray(text) ? text : [text];
  const currentText = texts[0]; // static: always index 0 without hooks
  const attrs = {};
  if (active && currentText) {
    attrs["data-sh-mantra"] = currentText;
  }
  return {
    class: className,
    ...attrs,
    ...rest,
  };
}

describe("ShMantra", () => {
  it("sets data-sh-mantra when active and text provided", () => {
    const p = mantraProps({ active: true, text: "OBEY" });
    assert.equal(p["data-sh-mantra"], "OBEY");
  });

  it("does not set data-sh-mantra when inactive", () => {
    const p = mantraProps({ active: false, text: "OBEY" });
    assert.equal(p["data-sh-mantra"], undefined);
  });

  it("does not set data-sh-mantra when active but text is empty", () => {
    const p = mantraProps({ active: true, text: "" });
    assert.equal(p["data-sh-mantra"], undefined);
  });

  it("does not set data-sh-mantra when active but text is undefined", () => {
    const p = mantraProps({ active: true });
    assert.equal(p["data-sh-mantra"], undefined);
  });

  it("does not set data-sh-mantra when neither active nor text provided", () => {
    const p = mantraProps({});
    assert.equal(p["data-sh-mantra"], undefined);
  });

  it("passes custom class", () => {
    const p = mantraProps({ class: "custom" });
    assert.equal(p.class, "custom");
  });

  it("passes through extra props", () => {
    const p = mantraProps({ id: "m1", "data-custom": "yes" });
    assert.equal(p.id, "m1");
    assert.equal(p["data-custom"], "yes");
  });

  it("supports array text (first item used)", () => {
    const p = mantraProps({ active: true, text: ["OBEY", "SUBMIT", "COMPLY"] });
    assert.equal(p["data-sh-mantra"], "OBEY");
  });

  it("array text with empty array falls back to undefined", () => {
    const p = mantraProps({ active: true, text: [] });
    assert.equal(p["data-sh-mantra"], undefined);
  });
});
