import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShEmptyState } from "../dist/superhot.preact.js";

function findByClass(vnode, cls) {
  if (!vnode || typeof vnode !== "object") return null;
  const props = vnode.props || {};
  if ((props.class || "").includes(cls)) return vnode;
  const children = Array.isArray(props.children)
    ? props.children
    : props.children
      ? [props.children]
      : [];
  for (const child of children) {
    const found = findByClass(child, cls);
    if (found) return found;
  }
  return null;
}

describe("ShEmptyState", () => {
  it("renders with sh-empty-state class", () => {
    const vnode = ShEmptyState({ mantra: "STANDBY" });
    assert.ok(vnode);
    assert.ok((vnode.props.class || "").includes("sh-empty-state"));
  });

  it("renders mantra text in mantra element", () => {
    const vnode = ShEmptyState({ mantra: "NO DATA" });
    const mantra = findByClass(vnode, "sh-empty-state__mantra");
    assert.ok(mantra);
    const children = Array.isArray(mantra.props.children)
      ? mantra.props.children
      : [mantra.props.children];
    assert.ok(children.includes("NO DATA"));
  });

  it("renders hint when provided", () => {
    const vnode = ShEmptyState({ mantra: "STANDBY", hint: "Ctrl+K" });
    const hint = findByClass(vnode, "sh-empty-state__hint");
    assert.ok(hint);
  });

  it("omits hint element when not provided", () => {
    const vnode = ShEmptyState({ mantra: "STANDBY" });
    const hint = findByClass(vnode, "sh-empty-state__hint");
    assert.equal(hint, null);
  });

  it("passes through additional class names", () => {
    const vnode = ShEmptyState({ mantra: "STANDBY", class: "custom" });
    assert.ok(vnode.props.class.includes("custom"));
    assert.ok(vnode.props.class.includes("sh-empty-state"));
  });
});
