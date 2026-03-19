import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/components/incident-hud.css", "utf8");

describe("incident-hud.css", () => {
  it("defines incident HUD class", () => {
    assert.ok(css.includes(".sh-incident-hud"), "missing incident-hud");
  });
  it("defines warning severity", () => {
    assert.ok(css.includes("sh-incident-hud--warning"), "missing warning");
  });
  it("defines critical severity", () => {
    assert.ok(css.includes("sh-incident-hud--critical"), "missing critical");
  });
  it("defines message class", () => {
    assert.ok(css.includes("sh-incident-hud-message"), "missing message");
  });
  it("defines action button", () => {
    assert.ok(css.includes("sh-incident-hud-action"), "missing action");
  });
  it("respects reduced motion", () => {
    assert.ok(css.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
  it("supports forced colors", () => {
    assert.ok(css.includes("forced-colors"), "missing forced-colors");
  });
});
