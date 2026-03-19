import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync("js/audio.js", "utf8");

describe("audio.js extended SFX", () => {
  it("defines boot sound type", () => {
    assert.ok(src.includes("boot"), "missing boot SFX");
  });
  it("defines static sound type", () => {
    assert.ok(src.includes("static"), "missing static SFX");
  });
  it("defines warning sound type", () => {
    assert.ok(src.includes("warning"), "missing warning SFX");
  });
  it("defines recovery sound type", () => {
    assert.ok(src.includes("recovery"), "missing recovery SFX");
  });
});
