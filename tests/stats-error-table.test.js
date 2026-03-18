import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShErrorState, ShStatsGrid, ShDataTable } from "../dist/superhot.preact.js";

function findByClass(vnode, cls) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  const c = vnode.props?.class ?? vnode.props?.className ?? "";
  if (c.includes(cls)) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const ch of arr) results.push(...findByClass(ch, cls));
  return results;
}
function findByType(vnode, type) {
  if (!vnode || typeof vnode !== "object") return [];
  const results = [];
  if (vnode.type === type) results.push(vnode);
  const kids = vnode.props?.children;
  const arr = Array.isArray(kids) ? kids : kids ? [kids] : [];
  for (const c of arr) results.push(...findByType(c, type));
  return results;
}

describe("ShErrorState", () => {
  it("renders sh-frame with role=alert", () => {
    const v = ShErrorState({ title: "Oops", message: "Something failed" });
    assert.equal(v.props.role, "alert");
    assert.ok(v.props.class?.includes("sh-frame"), "missing sh-frame");
  });
  it("renders retry button when onRetry provided", () => {
    const v = ShErrorState({ onRetry: () => {} });
    const btns = findByType(v, "button");
    assert.ok(btns.length > 0, "no retry button");
  });
  it("renders no retry button when onRetry absent", () => {
    const v = ShErrorState({});
    const btns = findByType(v, "button");
    assert.equal(btns.length, 0, "unexpected retry button");
  });
});

describe("ShStatsGrid", () => {
  it("renders one div per stat", () => {
    const v = ShStatsGrid({
      stats: [
        { label: "A", value: 1 },
        { label: "B", value: 2 },
      ],
    });
    const str = JSON.stringify(v);
    assert.ok(str.includes('"A"') && str.includes('"B"'), "stat labels not rendered");
  });
  it("renders em-dash for null values", () => {
    const v = ShStatsGrid({ stats: [{ label: "X", value: null }] });
    const str = JSON.stringify(v);
    assert.ok(str.includes("\\u2014") || str.includes("—"), "missing em-dash for null");
  });
});

describe("ShDataTable", () => {
  it("renders table element", () => {
    const v = ShDataTable({ columns: [{ key: "id", label: "ID" }], rows: [] });
    const tables = findByType(v, "table");
    assert.ok(tables.length > 0, "no table element");
  });
  it("renders NO RESULTS when rows empty", () => {
    const v = ShDataTable({ columns: [{ key: "id", label: "ID" }], rows: [] });
    assert.ok(JSON.stringify(v).includes("NO RESULTS"), "missing empty state");
  });
  it("renders search input by default", () => {
    const v = ShDataTable({ columns: [], rows: [] });
    const inputs = findByType(v, "input");
    assert.ok(inputs.length > 0, "missing search input");
  });
  it("hides search when searchable=false", () => {
    const v = ShDataTable({ columns: [], rows: [], searchable: false });
    const inputs = findByType(v, "input");
    assert.equal(inputs.length, 0, "unexpected search input");
  });
});
