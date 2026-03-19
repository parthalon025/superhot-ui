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

  it("assigns nodes to separate columns (linear chain)", () => {
    const linearNodes = [
      { id: "a", label: "A", status: "ok" },
      { id: "b", label: "B", status: "ok" },
      { id: "c", label: "C", status: "ok" },
    ];
    const linearEdges = [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
    ];
    const result = ShPipeline({ nodes: linearNodes, edges: linearEdges });
    const str = JSON.stringify(result);
    // Should contain translate transforms with different x positions
    const transforms = [...str.matchAll(/"translate\((\d+)/g)].map((m) => parseInt(m[1]));
    const uniqueX = new Set(transforms);
    assert.ok(uniqueX.size >= 2, "nodes in a chain should have different x positions");
  });

  it("renders cyclic edge without crashing", () => {
    const cyclicNodes = [
      { id: "a", label: "A", status: "ok" },
      { id: "b", label: "B", status: "ok" },
    ];
    const cyclicEdges = [
      { from: "a", to: "b" },
      { from: "b", to: "a" },
    ];
    assert.doesNotThrow(() => ShPipeline({ nodes: cyclicNodes, edges: cyclicEdges }));
  });

  it("edges group rendered before nodes group", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    const edgesIdx = str.indexOf("pipeline-edges");
    const nodesIdx = str.indexOf("pipeline-nodes");
    assert.ok(edgesIdx < nodesIdx, "edges group should come before nodes group in SVG");
  });
});
