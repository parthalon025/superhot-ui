import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const timeline = readFileSync("css/components/event-timeline.css", "utf8");
const steps = readFileSync("css/components/progress-steps.css", "utf8");

describe("event-timeline.css", () => {
  it("defines timeline container", () => {
    assert.ok(timeline.includes(".sh-event-timeline"), "missing timeline");
  });
  it("defines event item", () => {
    assert.ok(timeline.includes(".sh-event-item"), "missing event-item");
  });
  it("defines severity variants", () => {
    assert.ok(timeline.includes("sh-event-item--error"), "missing error variant");
    assert.ok(timeline.includes("sh-event-item--warning"), "missing warning variant");
    assert.ok(timeline.includes("sh-event-item--success"), "missing success variant");
  });
  it("respects reduced motion", () => {
    assert.ok(timeline.includes("prefers-reduced-motion"), "missing reduced-motion");
  });
});

describe("progress-steps.css", () => {
  it("defines steps container", () => {
    assert.ok(steps.includes(".sh-progress-steps"), "missing progress-steps");
  });
  it("defines step states", () => {
    assert.ok(steps.includes("sh-progress-step--complete"), "missing complete");
    assert.ok(steps.includes("sh-progress-step--current"), "missing current");
    assert.ok(steps.includes("sh-progress-step--error"), "missing error");
  });
  it("uses piOS separator", () => {
    assert.ok(steps.includes('">"'), "missing > separator");
  });
});
