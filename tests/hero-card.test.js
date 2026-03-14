import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShHeroCard } from "../dist/superhot.preact.js";

function findByClass(vnode, cls) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  const c = vnode.props?.class ?? vnode.props?.className ?? "";
  if (c.includes(cls)) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const child of arr) results.push(...findByClass(child, cls));
  return results;
}

describe("ShHeroCard", () => {
  it("renders .sh-frame wrapper", () => {
    const v = ShHeroCard({ value: "42", label: "Anomalies" });
    const frames = findByClass(v, "sh-frame");
    assert.ok(frames.length > 0, "missing sh-frame");
  });
  it("applies cursor-active class when not loading", () => {
    const v = ShHeroCard({ value: "42", label: "Test" });
    const frames = findByClass(v, "sh-cursor-active");
    assert.ok(frames.length > 0, "expected sh-cursor-active");
  });
  it("applies cursor-working class when loading", () => {
    const v = ShHeroCard({ value: null, label: "Test", loading: true });
    const frames = findByClass(v, "sh-cursor-working");
    assert.ok(frames.length > 0, "expected sh-cursor-working");
  });
  it("renders value when provided", () => {
    const v = ShHeroCard({ value: "99", label: "Test" });
    const str = JSON.stringify(v);
    assert.ok(str.includes("99"), "value not rendered");
  });
  it("renders em-dash when value is null", () => {
    const v = ShHeroCard({ value: null, label: "Test" });
    const str = JSON.stringify(v);
    assert.ok(str.includes("\\u2014") || str.includes("—"), "missing em-dash for null value");
  });
  it("wraps in anchor when href provided", () => {
    const v = ShHeroCard({ value: "5", label: "Test", href: "#/test" });
    assert.equal(v.type, "a", "expected anchor wrapper");
    assert.equal(v.props.href, "#/test");
  });
});
