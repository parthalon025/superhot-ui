import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShGlitch } from "../dist/superhot.preact.js";

describe("ShGlitch", () => {
  it("renders a div with children", () => {
    const v = ShGlitch({ children: "text" });
    assert.ok(v);
    assert.equal(v.type, "div");
  });

  it("sets data-sh-effect=glitch when active", () => {
    const v = ShGlitch({ active: true, children: "glitch" });
    assert.equal(v.props["data-sh-effect"], "glitch");
  });

  it("does not set data-sh-effect when inactive", () => {
    const v = ShGlitch({ active: false, children: "stable" });
    assert.equal(v.props["data-sh-effect"], undefined);
  });

  it("does not set data-sh-effect when active is omitted", () => {
    const v = ShGlitch({ children: "stable" });
    assert.equal(v.props["data-sh-effect"], undefined);
  });

  it("defaults intensity to medium (no attribute set)", () => {
    const v = ShGlitch({ active: true, children: "text" });
    assert.equal(v.props["data-sh-glitch-intensity"], undefined);
  });

  it("sets data-sh-glitch-intensity for non-medium values", () => {
    const v = ShGlitch({ active: true, intensity: "high", children: "text" });
    assert.equal(v.props["data-sh-glitch-intensity"], "high");
  });

  it("sets data-sh-glitch-intensity=low", () => {
    const v = ShGlitch({ active: true, intensity: "low", children: "text" });
    assert.equal(v.props["data-sh-glitch-intensity"], "low");
  });

  it("does not set intensity attribute when inactive even if intensity provided", () => {
    const v = ShGlitch({ active: false, intensity: "high", children: "text" });
    assert.equal(v.props["data-sh-glitch-intensity"], undefined);
  });

  it("passes custom class", () => {
    const v = ShGlitch({ active: true, class: "my-class", children: "text" });
    assert.equal(v.props.class, "my-class");
  });

  it("passes through extra props", () => {
    const v = ShGlitch({ active: true, id: "g1", children: "text" });
    assert.equal(v.props.id, "g1");
  });

  it("renders children content", () => {
    const v = ShGlitch({ active: true, children: "hello" });
    assert.ok(JSON.stringify(v).includes("hello"));
  });
});
