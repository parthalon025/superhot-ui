import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync("scripts/preflight.js", "utf8");

describe("preflight.js", () => {
  it("checks for emoji icons", () => {
    assert.ok(src.includes("emoji"), "missing emoji check");
  });
  it("checks cursor pointer", () => {
    assert.ok(src.includes("cursor"), "missing cursor check");
  });
  it("checks focus-visible", () => {
    assert.ok(src.includes("focus-visible"), "missing focus check");
  });
  it("checks reduced-motion", () => {
    assert.ok(src.includes("prefers-reduced-motion"), "missing motion check");
  });
  it("checks void dominance", () => {
    assert.ok(
      src.includes("Void") || src.includes("void") || src.includes("dark"),
      "missing void check",
    );
  });
});
