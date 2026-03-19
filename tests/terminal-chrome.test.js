import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/terminal-chrome.css", "utf8");

describe("terminal-chrome.css", () => {
  it("defines phosphor monitor variants", () => {
    assert.ok(css.includes('data-sh-monitor="amber"'), "missing amber variant");
    assert.ok(css.includes('data-sh-monitor="green"'), "missing green variant");
  });
  it("defines collapsible CSS", () => {
    assert.ok(css.includes(".sh-collapsible"), "missing collapsible");
    assert.ok(css.includes(".sh-collapsible-summary"), "missing collapsible summary");
    assert.ok(css.includes(".sh-collapsible-content"), "missing collapsible content");
  });
  it("defines rest-frame delay utilities", () => {
    assert.ok(css.includes(".sh-rest-after-shatter"), "missing rest-after-shatter");
    assert.ok(css.includes(".sh-rest-after-glitch"), "missing rest-after-glitch");
  });
  it("defines box-drawing grid alignment class", () => {
    assert.ok(css.includes(".sh-terminal-grid"), "missing terminal-grid");
  });
  it("terminal-grid disables ligatures", () => {
    assert.ok(css.includes("font-variant-ligatures: none"), "missing ligature disable");
  });
});
