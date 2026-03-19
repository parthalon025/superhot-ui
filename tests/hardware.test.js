import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectCapability } from "../js/hardware.js";

describe("detectCapability", () => {
  it("returns a valid tier string", () => {
    const tier = detectCapability();
    assert.ok(["minimal", "low", "medium", "full"].includes(tier));
  });
  it("returns string type", () => {
    assert.strictEqual(typeof detectCapability(), "string");
  });
});
