import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShPageBanner } from "../dist/superhot.preact.js";

function findByType(vnode, type) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  if (vnode.type === type) results.push(vnode);
  const children = vnode.props?.children;
  const kids = Array.isArray(children) ? children : children ? [children] : [];
  for (const c of kids) results.push(...findByType(c, type));
  return results;
}

describe("ShPageBanner", () => {
  it("renders .sh-page-banner wrapper", () => {
    const v = ShPageBanner({ namespace: "SH", page: "HOME" });
    assert.ok(v.props?.class?.includes("sh-page-banner"), "missing sh-page-banner class");
  });
  it("renders an svg element", () => {
    const v = ShPageBanner({ namespace: "SH", page: "HOME" });
    const svgs = findByType(v, "svg");
    assert.ok(svgs.length > 0, "no svg rendered");
  });
  it("renders subtitle p when subtitle provided", () => {
    const v = ShPageBanner({ namespace: "SH", page: "HOME", subtitle: "test" });
    const ps = findByType(v, "p");
    assert.ok(ps.length > 0, "no subtitle p rendered");
  });
  it("renders no subtitle p when not provided", () => {
    const v = ShPageBanner({ namespace: "SH", page: "HOME" });
    const ps = findByType(v, "p");
    assert.equal(ps.length, 0, "unexpected subtitle p rendered");
  });
  it("uses custom separator", () => {
    const v = ShPageBanner({ namespace: "SH", page: "TEST", separator: "+" });
    const svgs = findByType(v, "svg");
    assert.ok(svgs.length > 0, "svg not rendered with custom separator");
  });
});
