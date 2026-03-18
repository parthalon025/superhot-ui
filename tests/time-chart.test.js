import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShTimeChart } from "../dist/superhot.preact.js";

describe("ShTimeChart", () => {
  it("renders empty state when no data", () => {
    const result = ShTimeChart({ data: null });
    assert.ok(result, "renders without crashing");
    const str = JSON.stringify(result);
    assert.ok(str.includes("sh-chart"), "has sh-chart class");
  });

  it("renders empty state for empty array", () => {
    const result = ShTimeChart({ data: [] });
    assert.ok(result, "renders without crashing");
    const str = JSON.stringify(result);
    assert.ok(str.includes("sh-chart--empty"), "has empty class");
  });

  it("renders with data without crashing", () => {
    const data = [
      { t: 1700000000, v: 42 },
      { t: 1700000060, v: 44 },
    ];
    const result = ShTimeChart({ data });
    assert.ok(result, "renders without crashing");
    const str = JSON.stringify(result);
    assert.ok(!str.includes("sh-chart--empty"), "no empty state when data provided");
  });

  it("applies compact class", () => {
    const result = ShTimeChart({ data: [], compact: true });
    const str = JSON.stringify(result);
    assert.ok(str.includes("compact"), "has compact class");
  });

  it("handles height prop", () => {
    const result = ShTimeChart({ data: [], height: 64 });
    const str = JSON.stringify(result);
    assert.ok(str.includes("64"), "has height value");
  });

  it("renders a div element", () => {
    const result = ShTimeChart({ data: null });
    assert.equal(result.type, "div", "root element is a div");
  });

  it("renders non-empty state as div with ref when data provided", () => {
    const data = [
      { t: 1700000000, v: 10 },
      { t: 1700000060, v: 20 },
    ];
    const result = ShTimeChart({ data });
    assert.equal(result.type, "div", "root element is a div");
    assert.ok(result, "renders without crashing");
  });

  it("accepts custom className", () => {
    const result = ShTimeChart({ data: null, className: "my-custom" });
    const str = JSON.stringify(result);
    assert.ok(str.includes("my-custom"), "custom class applied");
  });
});
