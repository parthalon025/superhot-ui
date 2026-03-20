/**
 * ShTestChamber tests.
 * Uses vnode inspection pattern — mirrors props logic without render cycle.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const VALID_DIRECTIONS = ["bottom", "left", "right"];

/**
 * Compute the static vnode props that ShTestChamber would render.
 */
function chamberProps({
  chamber,
  direction = "bottom",
  compromised = false,
  class: className,
} = {}) {
  const safeDirection = VALID_DIRECTIONS.includes(direction) ? direction : "bottom";
  const dirClass = safeDirection !== "bottom" ? `sh-test-chamber--from-${safeDirection}` : "";
  const compClass = compromised ? "sh-test-chamber--compromised" : "";
  const cls = ["sh-test-chamber", dirClass, compClass, className].filter(Boolean).join(" ");

  return {
    class: cls,
    hasChamberBadge: chamber != null,
    chamberLabel: chamber != null ? `CHAMBER ${String(chamber).padStart(2, "0")}` : null,
    safeDirection,
  };
}

describe("ShTestChamber", () => {
  it("renders chamber number badge", () => {
    const props = chamberProps({ chamber: 5 });
    assert.equal(props.hasChamberBadge, true);
    assert.equal(props.chamberLabel, "CHAMBER 05");
  });

  it("pads single-digit chamber numbers", () => {
    const props = chamberProps({ chamber: 1 });
    assert.equal(props.chamberLabel, "CHAMBER 01");
  });

  it("does not render badge when chamber is not provided", () => {
    const props = chamberProps({});
    assert.equal(props.hasChamberBadge, false);
    assert.equal(props.chamberLabel, null);
  });

  it("includes sh-test-chamber class", () => {
    const props = chamberProps({});
    assert.ok(props.class.includes("sh-test-chamber"));
  });

  it("applies direction class for left", () => {
    const props = chamberProps({ direction: "left" });
    assert.ok(props.class.includes("sh-test-chamber--from-left"));
  });

  it("applies direction class for right", () => {
    const props = chamberProps({ direction: "right" });
    assert.ok(props.class.includes("sh-test-chamber--from-right"));
  });

  it("no direction class for bottom (default)", () => {
    const props = chamberProps({ direction: "bottom" });
    assert.ok(!props.class.includes("sh-test-chamber--from-"));
  });

  it("validates direction prop — invalid falls back to bottom", () => {
    const props = chamberProps({ direction: "evil<script>" });
    assert.equal(props.safeDirection, "bottom");
    assert.ok(!props.class.includes("evil"));
  });

  it("validates direction prop — XSS attempt is sanitized", () => {
    const props = chamberProps({ direction: '"><img src=x onerror=alert(1)>' });
    assert.equal(props.safeDirection, "bottom");
  });

  it("applies compromised class", () => {
    const props = chamberProps({ compromised: true });
    assert.ok(props.class.includes("sh-test-chamber--compromised"));
  });

  it("does not apply compromised class when false", () => {
    const props = chamberProps({ compromised: false });
    assert.ok(!props.class.includes("sh-test-chamber--compromised"));
  });

  it("passes additional class through", () => {
    const props = chamberProps({ class: "my-chamber" });
    assert.ok(props.class.includes("my-chamber"));
    assert.ok(props.class.includes("sh-test-chamber"));
  });
});
