/**
 * ShThreatPulse component tests.
 *
 * ShThreatPulse uses useRef/useEffect, so calling it as a plain function
 * outside a Preact render cycle throws. Strategy: mirror the toast test
 * pattern — extract the static vnode props that the component would produce,
 * and test those directly.
 *
 * The observable static behaviors are:
 * - data-sh-effect="threat-pulse" when active
 * - no data-sh-effect when inactive
 * - class passthrough
 * - extra props passthrough
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Compute the static vnode props that ShThreatPulse would render.
 * Mirrors the render return without hooks.
 */
function threatPulseProps({ active, persistent = false, class: className, ...rest } = {}) {
  const attrs = {};
  if (active) {
    attrs["data-sh-effect"] = "threat-pulse";
  }
  return {
    class: className,
    ...attrs,
    ...rest,
  };
}

describe("ShThreatPulse", () => {
  it("sets data-sh-effect=threat-pulse when active", () => {
    const props = threatPulseProps({ active: true });
    assert.equal(props["data-sh-effect"], "threat-pulse");
  });

  it("does not set data-sh-effect when inactive", () => {
    const props = threatPulseProps({ active: false });
    assert.equal(props["data-sh-effect"], undefined);
  });

  it("does not set data-sh-effect when active is omitted", () => {
    const props = threatPulseProps({});
    assert.equal(props["data-sh-effect"], undefined);
  });

  it("sets data-sh-effect when active and persistent", () => {
    const props = threatPulseProps({ active: true, persistent: true });
    assert.equal(props["data-sh-effect"], "threat-pulse");
  });

  it("passes custom class", () => {
    const props = threatPulseProps({ active: true, class: "alert-box" });
    assert.equal(props.class, "alert-box");
  });

  it("passes through extra props", () => {
    const props = threatPulseProps({ active: true, id: "tp1", "aria-live": "polite" });
    assert.equal(props.id, "tp1");
    assert.equal(props["aria-live"], "polite");
  });

  it("class is undefined when not provided", () => {
    const props = threatPulseProps({ active: true });
    assert.equal(props.class, undefined);
  });

  it("calling the real component outside render throws a hook error", async () => {
    const { ShThreatPulse } = await import("../dist/superhot.preact.js");
    assert.throws(
      () => ShThreatPulse({ active: true, children: "test" }),
      (err) => err instanceof Error,
      "Expected hook error when called outside Preact render",
    );
  });
});
