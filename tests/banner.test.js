import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/banner.css", "utf8");

describe("banner.css", () => {
  it("defines .sh-page-banner", () => {
    assert.ok(css.includes(".sh-page-banner"), "missing .sh-page-banner");
  });
  it("has scan beam animation via ::after", () => {
    assert.ok(css.includes("sh-banner-scan"), "missing sh-banner-scan keyframe");
  });
  it("has phosphor glow animation", () => {
    assert.ok(css.includes("sh-banner-glow"), "missing sh-banner-glow keyframe");
  });
  it("disables animations under prefers-reduced-motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion rule");
  });
});
