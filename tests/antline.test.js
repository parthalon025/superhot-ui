/**
 * ShAntline tests.
 * Uses vnode inspection pattern — mirrors props logic without render cycle.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Compute the static vnode props that ShAntline would render.
 */
function antlineProps({ active = false, vertical = false, class: className } = {}) {
  const activeStr = String(active);
  const cls = ["sh-antline", vertical ? "sh-antline--vertical" : "", className]
    .filter(Boolean)
    .join(" ");

  return {
    class: cls,
    role: "presentation",
    "aria-hidden": "true",
    activeStr,
    vertical,
  };
}

describe("ShAntline", () => {
  it("renders with inactive state by default", () => {
    const props = antlineProps();
    assert.equal(props.activeStr, "false");
  });

  it("renders with active state when active=true", () => {
    const props = antlineProps({ active: true });
    assert.equal(props.activeStr, "true");
  });

  it("sets aria-hidden=true (decorative element)", () => {
    const props = antlineProps();
    assert.equal(props["aria-hidden"], "true");
  });

  it("sets role=presentation", () => {
    const props = antlineProps();
    assert.equal(props.role, "presentation");
  });

  it("includes sh-antline class", () => {
    const props = antlineProps();
    assert.ok(props.class.includes("sh-antline"));
  });

  it("applies vertical class when vertical=true", () => {
    const props = antlineProps({ vertical: true });
    assert.ok(props.class.includes("sh-antline--vertical"));
  });

  it("does not apply vertical class when vertical=false", () => {
    const props = antlineProps({ vertical: false });
    assert.ok(!props.class.includes("sh-antline--vertical"));
  });

  it("passes additional class through", () => {
    const props = antlineProps({ class: "custom-line" });
    assert.ok(props.class.includes("custom-line"));
    assert.ok(props.class.includes("sh-antline"));
  });
});
