import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShPipeline } from "../dist/superhot.preact.js";

describe("ShPipeline", () => {
  const nodes = [
    { id: "a", label: "Fetch", status: "ok" },
    { id: "b", label: "Process", status: "running" },
    { id: "c", label: "Store", status: "idle" },
  ];
  const edges = [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
  ];

  it("renders without crashing", () => {
    const result = ShPipeline({ nodes, edges });
    assert.ok(result, "renders");
  });

  it("has sh-pipeline class", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes("sh-pipeline"), "has class");
  });

  it("renders compact variant", () => {
    const result = ShPipeline({ nodes, edges, compact: true });
    const str = JSON.stringify(result);
    assert.ok(str.includes("compact"), "has compact class");
  });

  it("handles empty nodes", () => {
    const result = ShPipeline({ nodes: [], edges: [] });
    assert.ok(result, "renders empty state");
  });

  it("renders node labels", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes("Fetch"), "contains node label");
  });

  it("applies node status class", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes("node--ok") || str.includes("node--running"), "has status class");
  });
});
