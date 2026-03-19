import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/ansi.css", "utf8");

describe("ansi.css — ANSI SGR text attributes", () => {
  it("defines all text attribute classes", () => {
    for (const cls of [
      "sh-ansi-bold",
      "sh-ansi-dim",
      "sh-ansi-italic",
      "sh-ansi-underline",
      "sh-ansi-blink",
      "sh-ansi-blink-fast",
      "sh-ansi-reverse",
      "sh-ansi-hidden",
      "sh-ansi-strike",
      "sh-ansi-reset",
    ]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines ANSI foreground color classes", () => {
    for (const color of ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]) {
      assert.ok(css.includes(`.sh-ansi-fg-${color}`), `missing .sh-ansi-fg-${color}`);
    }
  });
  it("defines ANSI background color classes", () => {
    for (const color of ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]) {
      assert.ok(css.includes(`.sh-ansi-bg-${color}`), `missing .sh-ansi-bg-${color}`);
    }
  });
  it("defines blink keyframe", () => {
    assert.ok(css.includes("sh-ansi-blink-kf"), "missing blink keyframe");
  });
  it("respects prefers-reduced-motion for blink", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion rule for blink");
  });
});
