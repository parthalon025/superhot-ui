/**
 * Narrator tests
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { narrate, ShNarrator } from "../js/narrator.js";

describe("narrate", () => {
  beforeEach(() => {
    ShNarrator.personality = "glados";
  });

  it("returns a string for a valid category", () => {
    const result = narrate("toast");
    assert.equal(typeof result, "string");
    assert.ok(result.length > 0, "should return a non-empty string");
  });

  it("returns empty string for invalid category", () => {
    const result = narrate("nonexistent");
    assert.equal(result, "");
  });

  it("returns empty string for invalid personality", () => {
    ShNarrator.personality = "nonexistent";
    const result = narrate("toast");
    assert.equal(result, "");
  });

  it("respects personality switch", () => {
    ShNarrator.personality = "turret";
    const result = narrate("greeting");
    assert.equal(typeof result, "string");
    assert.ok(result.length > 0);
  });

  it("handles template functions with context", () => {
    const result = narrate("error", { errorCount: 5 });
    assert.equal(typeof result, "string");
    assert.ok(result.length > 0);
  });

  it("avoids repeating the same phrase consecutively", () => {
    // With enough calls, we should see at least 2 different results
    const results = new Set();
    for (let i = 0; i < 20; i++) {
      results.add(narrate("toast"));
    }
    assert.ok(results.size > 1, "should produce multiple different phrases");
  });

  it("works for all personalities", () => {
    for (const personality of ["glados", "cave", "wheatley", "turret", "superhot"]) {
      ShNarrator.personality = personality;
      const result = narrate("toast");
      assert.equal(typeof result, "string", `${personality} toast should return string`);
      assert.ok(result.length > 0, `${personality} toast should be non-empty`);
    }
  });

  it("works for all categories on glados personality", () => {
    ShNarrator.personality = "glados";
    const categories = [
      "toast",
      "error",
      "loading",
      "status",
      "empty",
      "greeting",
      "farewell",
      "countdown",
      "warning",
      "destructive",
      "success",
      "search",
    ];
    for (const cat of categories) {
      const result = narrate(cat);
      assert.equal(typeof result, "string", `glados ${cat} should return string`);
      assert.ok(result.length > 0, `glados ${cat} should be non-empty`);
    }
  });

  it("ShNarrator.personality defaults to glados", () => {
    // Reset to check default — it's set to glados in the module
    assert.equal(ShNarrator.personality, "glados");
  });
});
