/**
 * ShStatusBadge tests
 * Tests that the component sets correct data-sh-status attribute and label.
 * Imports from dist bundle to avoid JSX loader requirement.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShStatusBadge } from "../dist/superhot.preact.js";

describe("ShStatusBadge", () => {
  it("sets data-sh-status to provided status", () => {
    const rendered = ShStatusBadge({ status: "healthy" });
    assert.equal(rendered.props["data-sh-status"], "healthy");
  });

  it("sets correct status for each valid value", () => {
    const statuses = ["healthy", "error", "warning", "waiting", "active", "ok"];
    for (const status of statuses) {
      const rendered = ShStatusBadge({ status });
      assert.equal(
        rendered.props["data-sh-status"],
        status,
        `Expected data-sh-status="${status}"`
      );
    }
  });

  it("defaults label to status value when label not provided", () => {
    const rendered = ShStatusBadge({ status: "error" });
    assert.equal(rendered.props.children, "error", "Label should default to status");
  });

  it("uses provided label when given", () => {
    const rendered = ShStatusBadge({ status: "healthy", label: "OK" });
    assert.equal(rendered.props.children, "OK", "Should use provided label");
  });

  it("sets data-sh-glow to 'true' by default", () => {
    const rendered = ShStatusBadge({ status: "ok" });
    assert.equal(rendered.props["data-sh-glow"], "true");
  });

  it("sets data-sh-glow to 'false' when glow=false", () => {
    const rendered = ShStatusBadge({ status: "ok", glow: false });
    assert.equal(rendered.props["data-sh-glow"], "false");
  });

  it("includes sh-status-badge class", () => {
    const rendered = ShStatusBadge({ status: "active" });
    assert.ok(rendered.props.class.includes("sh-status-badge"), "Expected sh-status-badge class");
  });

  it("passes additional class prop through", () => {
    const rendered = ShStatusBadge({ status: "waiting", class: "my-badge" });
    assert.ok(rendered.props.class.includes("my-badge"), "Expected custom class on badge");
  });
});
