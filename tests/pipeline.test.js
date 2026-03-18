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

  it("wraps node labels in brackets", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes("[Fetch]"), "label should be wrapped in brackets");
  });

  it("includes arrowhead marker definition", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes("sh-pipeline-arrow"), "should define arrowhead marker");
  });

  it("includes glow filter defs", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes("sh-pipeline-glow"), "should define glow filter");
  });

  it("applies role=button to node groups", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes('"role":"button"'), "node groups should have role=button");
  });

  it("applies tabIndex to node groups", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes('"tabIndex":0'), "node groups should have tabIndex=0");
  });

  it("includes animate element for running node", () => {
    const runningNodes = [{ id: "a", label: "Run", status: "running" }];
    const result = ShPipeline({ nodes: runningNodes, edges: [] });
    const str = JSON.stringify(result);
    assert.ok(str.includes("animate"), "running node should include animate element");
  });

  it("includes role glyph for running node", () => {
    const runningNodes = [{ id: "a", label: "Run", status: "running" }];
    const result = ShPipeline({ nodes: runningNodes, edges: [] });
    const str = JSON.stringify(result);
    assert.ok(str.includes("\u25B8"), "running node should include \u25B8 glyph");
  });

  it("includes [!] badge for error node", () => {
    const failedNodes = [{ id: "a", label: "Fail", status: "error" }];
    const result = ShPipeline({ nodes: failedNodes, edges: [] });
    const str = JSON.stringify(result);
    assert.ok(str.includes("[!]"), "error node should include [!] badge");
  });

  it("renders ASCII health gauge when stats provided", () => {
    const nodesWithStats = [{ id: "a", label: "A", status: "running", running: 3, total: 5 }];
    const result = ShPipeline({ nodes: nodesWithStats, edges: [] });
    const str = JSON.stringify(result);
    assert.ok(str.includes("\u2588") || str.includes("\u2591"), "should render health gauge chars");
  });

  it("edge paths include marker-end for arrowhead", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes("marker-end"), "edge paths should reference arrowhead marker");
  });

  it("includes dot-matrix background pattern", () => {
    const result = ShPipeline({ nodes, edges });
    const str = JSON.stringify(result);
    assert.ok(str.includes("sh-pipeline-grid"), "should include grid background pattern");
  });
});
