import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/utilities.css", "utf8");

describe("utilities.css", () => {
  it("defines opacity semantic classes", () => {
    for (const cls of [
      "sh-opacity-current",
      "sh-opacity-secondary",
      "sh-opacity-historical",
      "sh-opacity-disabled",
    ]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines spacing gap classes", () => {
    for (const cls of ["sh-gap-entity", "sh-gap-related", "sh-gap-section", "sh-gap-panel"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines typography classes", () => {
    for (const cls of ["sh-label", "sh-value", "sh-status-code"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines hover vocabulary", () => {
    for (const cls of ["sh-hover-reveal", "sh-hover-phosphor-border"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
  it("defines grid crystalline class", () => {
    assert.ok(css.includes(".sh-grid"), "missing .sh-grid");
  });
  it("defines prompt prefix classes", () => {
    for (const cls of ["sh-prompt", "sh-prompt-root"]) {
      assert.ok(css.includes(`.${cls}`), `missing .${cls}`);
    }
  });
});
