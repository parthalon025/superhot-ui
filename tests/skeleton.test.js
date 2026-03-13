/**
 * ShSkeleton tests
 * Imports from dist (built bundle — no JSX loader needed).
 * Tests that the component produces correct vnode structure.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShSkeleton } from "../dist/superhot.preact.js";

/**
 * Recursively collect vnodes whose props.class includes the given class name.
 *
 * @param {object|string|null} vnode
 * @param {string} className
 * @returns {object[]}
 */
function findByClass(vnode, className) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  const cls = vnode.props?.class ?? vnode.props?.className ?? "";
  if (cls.includes(className)) results.push(vnode);
  const children = vnode.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) results.push(...findByClass(child, className));
  } else if (children) {
    results.push(...findByClass(children, className));
  }
  return results;
}

describe("ShSkeleton", () => {
  it("renders default 3 skeleton rows", () => {
    const rendered = ShSkeleton({});
    const skeletons = findByClass(rendered, "sh-skeleton");
    assert.equal(skeletons.length, 3, "Expected 3 sh-skeleton rows by default");
  });

  it("renders correct number of rows for rows prop", () => {
    const rendered = ShSkeleton({ rows: 5 });
    const skeletons = findByClass(rendered, "sh-skeleton");
    assert.equal(skeletons.length, 5, "Expected 5 sh-skeleton rows");
  });

  it("renders 1 row when rows=1", () => {
    const rendered = ShSkeleton({ rows: 1 });
    const skeletons = findByClass(rendered, "sh-skeleton");
    assert.equal(skeletons.length, 1, "Expected 1 sh-skeleton row");
  });

  it("renders 0 rows when rows=0", () => {
    const rendered = ShSkeleton({ rows: 0 });
    const skeletons = findByClass(rendered, "sh-skeleton");
    assert.equal(skeletons.length, 0, "Expected 0 sh-skeleton rows");
  });

  it("applies width style to each skeleton row", () => {
    const rendered = ShSkeleton({ rows: 2, width: "80%" });
    const skeletons = findByClass(rendered, "sh-skeleton");
    assert.equal(skeletons.length, 2);
    for (const s of skeletons) {
      assert.equal(s.props?.style?.width, "80%", "Expected width 80% on row");
    }
  });

  it("applies height style to each skeleton row", () => {
    const rendered = ShSkeleton({ rows: 2, height: "2rem" });
    const skeletons = findByClass(rendered, "sh-skeleton");
    for (const s of skeletons) {
      assert.equal(s.props?.style?.height, "2rem", "Expected height 2rem on row");
    }
  });

  it("passes class through to wrapper element", () => {
    const rendered = ShSkeleton({ class: "my-wrapper", rows: 1 });
    assert.ok(rendered.props?.class?.includes("my-wrapper"), "Expected class on wrapper");
  });

  it("marks skeleton rows as aria-hidden", () => {
    const rendered = ShSkeleton({ rows: 2 });
    const skeletons = findByClass(rendered, "sh-skeleton");
    for (const s of skeletons) {
      assert.equal(s.props?.["aria-hidden"], "true", "Expected aria-hidden=true");
    }
  });
});
