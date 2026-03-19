import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync("js/audio.js", "utf8");

describe("tension drone", () => {
  it("defines setTensionDrone function", () => {
    assert.ok(src.includes("setTensionDrone"), "missing setTensionDrone");
  });
  it("defines stopTensionDrone function", () => {
    assert.ok(src.includes("stopTensionDrone"), "missing stopTensionDrone");
  });
  it("respects prefers-reduced-motion", () => {
    assert.ok(src.includes("prefers-reduced-motion"), "missing motion check in drone");
  });
  it("uses frequency array for escalation levels", () => {
    assert.ok(
      src.includes("40") && src.includes("60") && src.includes("80"),
      "missing drone frequencies",
    );
  });
});
