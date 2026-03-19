import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShMantra } from "../dist/superhot.preact.js";

describe("ShMantra", () => {
  it("renders a div with children", () => {
    const v = ShMantra({ children: "content" });
    assert.ok(v);
    assert.equal(v.type, "div");
  });

  it("sets data-sh-mantra when active and text provided", () => {
    const v = ShMantra({ active: true, text: "OBEY", children: "content" });
    assert.equal(v.props["data-sh-mantra"], "OBEY");
  });

  it("does not set data-sh-mantra when inactive", () => {
    const v = ShMantra({ active: false, text: "OBEY", children: "content" });
    assert.equal(v.props["data-sh-mantra"], undefined);
  });

  it("does not set data-sh-mantra when active but text is empty", () => {
    const v = ShMantra({ active: true, text: "", children: "content" });
    assert.equal(v.props["data-sh-mantra"], undefined);
  });

  it("does not set data-sh-mantra when active but text is undefined", () => {
    const v = ShMantra({ active: true, children: "content" });
    assert.equal(v.props["data-sh-mantra"], undefined);
  });

  it("does not set data-sh-mantra when neither active nor text provided", () => {
    const v = ShMantra({ children: "content" });
    assert.equal(v.props["data-sh-mantra"], undefined);
  });

  it("passes custom class", () => {
    const v = ShMantra({ class: "custom", children: "content" });
    assert.equal(v.props.class, "custom");
  });

  it("passes through extra props", () => {
    const v = ShMantra({ id: "m1", "data-custom": "yes", children: "content" });
    assert.equal(v.props.id, "m1");
    assert.equal(v.props["data-custom"], "yes");
  });

  it("renders children content", () => {
    const v = ShMantra({ active: true, text: "OBEY", children: "inner text" });
    assert.ok(JSON.stringify(v).includes("inner text"));
  });
});
