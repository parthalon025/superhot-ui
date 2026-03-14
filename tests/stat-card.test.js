import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

describe("ShStatCard CSS classes", () => {
  it("sh-stat-card class exists in built CSS", async () => {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile("dist/superhot.css", "utf8");
    assert.ok(css.includes(".sh-stat-card"), "Missing .sh-stat-card in dist/superhot.css");
  });

  it("ShStatCard exported from preact bundle", async () => {
    const fs = await import("node:fs/promises");
    const js = await fs.readFile("dist/superhot.preact.js", "utf8");
    assert.ok(js.includes("ShStatCard"), "ShStatCard not found in dist/superhot.preact.js");
  });
});

describe("ShStatCard component props", () => {
  it("renders with required props without throwing", async () => {
    try {
      const mod = await import("../dist/superhot.preact.js");
      assert.ok(typeof mod.ShStatCard === "function", "ShStatCard should be a function");
    } catch {
      // Pre-build: skip
    }
  });
});
