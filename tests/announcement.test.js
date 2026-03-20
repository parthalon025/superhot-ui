/**
 * ShAnnouncement tests.
 * Uses vnode inspection pattern — mirrors props logic without hooks execution.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Compute the static vnode props that ShAnnouncement would render.
 */
function announcementProps({
  message,
  personality = "glados",
  showCursor = true,
  source,
  class: className,
} = {}) {
  return {
    class: ["sh-announcement", className].filter(Boolean).join(" "),
    "data-sh-personality": personality,
    role: "status",
    "aria-live": "polite",
    "aria-label": source ? `${source}: ${message}` : message,
    hasSource: !!source,
    source,
  };
}

describe("ShAnnouncement", () => {
  it("renders with message text in aria-label", () => {
    const props = announcementProps({ message: "Hello, test subject." });
    assert.equal(props["aria-label"], "Hello, test subject.");
  });

  it("sets correct data-sh-personality for glados", () => {
    const props = announcementProps({ message: "test", personality: "glados" });
    assert.equal(props["data-sh-personality"], "glados");
  });

  it("sets correct data-sh-personality for cave", () => {
    const props = announcementProps({ message: "test", personality: "cave" });
    assert.equal(props["data-sh-personality"], "cave");
  });

  it("sets correct data-sh-personality for wheatley", () => {
    const props = announcementProps({ message: "test", personality: "wheatley" });
    assert.equal(props["data-sh-personality"], "wheatley");
  });

  it("sets correct data-sh-personality for turret", () => {
    const props = announcementProps({ message: "test", personality: "turret" });
    assert.equal(props["data-sh-personality"], "turret");
  });

  it("sets correct data-sh-personality for superhot", () => {
    const props = announcementProps({ message: "test", personality: "superhot" });
    assert.equal(props["data-sh-personality"], "superhot");
  });

  it("defaults personality to glados", () => {
    const props = announcementProps({ message: "test" });
    assert.equal(props["data-sh-personality"], "glados");
  });

  it("sets role=status", () => {
    const props = announcementProps({ message: "test" });
    assert.equal(props.role, "status");
  });

  it("sets aria-live=polite", () => {
    const props = announcementProps({ message: "test" });
    assert.equal(props["aria-live"], "polite");
  });

  it("includes sh-announcement class", () => {
    const props = announcementProps({ message: "test" });
    assert.ok(props.class.includes("sh-announcement"));
  });

  it("passes additional class through", () => {
    const props = announcementProps({ message: "test", class: "custom" });
    assert.ok(props.class.includes("custom"));
    assert.ok(props.class.includes("sh-announcement"));
  });

  it("aria-label includes source when provided", () => {
    const props = announcementProps({
      message: "The cake is a lie.",
      source: "ENRICHMENT CENTER",
    });
    assert.equal(props["aria-label"], "ENRICHMENT CENTER: The cake is a lie.");
  });

  it("aria-label is just message when no source", () => {
    const props = announcementProps({ message: "Testing." });
    assert.equal(props["aria-label"], "Testing.");
  });
});
