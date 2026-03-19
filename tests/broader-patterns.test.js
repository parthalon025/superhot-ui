import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const filter = readFileSync("css/components/filter-panel.css", "utf8");
const signal = readFileSync("css/components/signal-bars.css", "utf8");

describe("filter-panel.css", () => {
  it("defines filter panel", () => {
    assert.ok(filter.includes(".sh-filter-panel"), "missing filter-panel");
  });
  it("defines filter chip", () => {
    assert.ok(filter.includes(".sh-filter-chip"), "missing filter-chip");
  });
  it("defines active filter chip", () => {
    assert.ok(filter.includes("sh-filter-chip--active"), "missing active chip");
  });
  it("defines active filters bar", () => {
    assert.ok(filter.includes(".sh-active-filters"), "missing active-filters");
  });
});

describe("signal-bars.css", () => {
  it("defines signal bars container", () => {
    assert.ok(signal.includes(".sh-signal-bars"), "missing signal-bars");
  });
  it("defines 5 signal levels", () => {
    assert.ok(signal.includes('data-sh-signal="5"'), "missing level 5");
  });
  it("uses threat color for weak signal", () => {
    assert.ok(signal.includes("--sh-threat"), "missing threat color for weak");
  });
  it("uses phosphor for strong signal", () => {
    assert.ok(signal.includes("--sh-phosphor"), "missing phosphor for strong");
  });
});
