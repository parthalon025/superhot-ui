import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShCollapsible } from "../dist/superhot.preact.js";

function findByType(vnode, type) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  if (vnode.type === type) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const c of arr) results.push(...findByType(c, type));
  return results;
}

describe("ShCollapsible", () => {
  it("renders a button toggle", () => {
    const v = ShCollapsible({ title: "Section" });
    const btns = findByType(v, "button");
    assert.ok(btns.length > 0, "no button rendered");
  });
  it("button has aria-expanded", () => {
    const v = ShCollapsible({ title: "Section", defaultOpen: true });
    const btns = findByType(v, "button");
    assert.ok(btns[0].props["aria-expanded"] !== undefined, "missing aria-expanded");
  });
  it("renders title text", () => {
    const v = ShCollapsible({ title: "My Section" });
    assert.ok(JSON.stringify(v).includes("My Section"), "title not rendered");
  });
});
