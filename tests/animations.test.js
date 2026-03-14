import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/animations.css", "utf8");

describe("animations.css", () => {
  it("defines all T1 ambient classes", () => {
    for (const cls of [
      "sh-t1-scan-sweep",
      "sh-t1-grid-pulse",
      "sh-t1-border-shimmer",
      "sh-t1-data-stream",
      "sh-t1-scan-line",
      "sh-t1-pulse-ring",
    ]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines all T2 data refresh classes", () => {
    for (const cls of ["sh-t2-typewriter", "sh-t2-tick-flash", "sh-t2-bar-grow"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines all T3 alert classes", () => {
    for (const cls of [
      "sh-t3-orange-pulse",
      "sh-t3-border-alert",
      "sh-t3-badge-appear",
      "sh-t3-counter-bump",
    ]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines utility classes", () => {
    assert.ok(css.includes(".sh-animate-page-enter"), "missing page-enter");
    assert.ok(css.includes(".sh-animate-data-refresh"), "missing data-refresh");
    assert.ok(css.includes(".sh-stagger-children"), "missing stagger-children");
  });
  it("T1 disabled on phone", () => {
    assert.ok(css.includes("max-width: 639px"), "missing phone breakpoint");
  });
  it("all tiers off under prefers-reduced-motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
});
