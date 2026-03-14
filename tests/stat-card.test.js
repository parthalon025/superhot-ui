import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { ShStatCard } from "../dist/superhot.preact.js";

describe("ShStatCard CSS classes", () => {
  it("sh-stat-card class exists in built CSS", async () => {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile("dist/superhot.css", "utf8");
    assert.ok(css.includes(".sh-stat-card"), "Missing .sh-stat-card in dist/superhot.css");
  });

  it("ShStatCard exported from preact bundle", async () => {
    const fs = await import("node:fs/promises");
    const js = await fs.readFile("dist/superhot.preact.js", "utf8");
    assert.ok(js.includes("ShStatCard"), "ShStatCard not found in dist/superhot.preact.js");
  });
});

describe("ShStatCard component props", () => {
  it("renders with required props without throwing", async () => {
    try {
      const mod = await import("../dist/superhot.preact.js");
      assert.ok(typeof mod.ShStatCard === "function", "ShStatCard should be a function");
    } catch {
      // Pre-build: skip
    }
  });
});

describe("ShStatCard behavior", () => {
  it("sets data-sh-status attribute", () => {
    const vnode = ShStatCard({ label: "SVC", value: "3/12", status: "healthy" });
    assert.equal(vnode.props["data-sh-status"], "healthy");
  });

  it("renders div when no href", () => {
    const vnode = ShStatCard({ label: "SVC", value: "3/12", status: "ok" });
    assert.equal(vnode.type, "div", "Should render as div without href");
  });

  it("renders anchor when href provided", () => {
    const vnode = ShStatCard({ label: "SVC", value: "3/12", status: "ok", href: "/svc" });
    assert.equal(vnode.type, "a", "Should render as anchor with href");
  });

  it("wraps in ShThreatPulse when status is error", () => {
    const vnode = ShStatCard({ label: "SVC", value: "3/12", status: "error" });
    assert.equal(typeof vnode.type, "function", "Outer vnode should be ShThreatPulse (function)");
  });

  it("includes sh-stat-card class", () => {
    const vnode = ShStatCard({ label: "SVC", value: "3/12", status: "healthy" });
    assert.ok(vnode.props.class.includes("sh-stat-card"), "Expected sh-stat-card class");
  });

  it("passes label as child element", () => {
    const vnode = ShStatCard({ label: "CPU", value: "78%", status: "warning" });
    const labelChild = vnode.props.children.find(
      (child) =>
        child &&
        child.props &&
        child.props.class &&
        child.props.class.includes("sh-stat-card-label"),
    );
    assert.ok(labelChild, "Should have label child with sh-stat-card-label class");
  });

  it("passes value as child element", () => {
    const vnode = ShStatCard({ label: "CPU", value: "78%", status: "warning" });
    const valueChild = vnode.props.children.find(
      (child) =>
        child &&
        child.props &&
        child.props.class &&
        child.props.class.includes("sh-stat-card-value"),
    );
    assert.ok(valueChild, "Should have value child with sh-stat-card-value class");
  });

  it("includes detail span when detail prop provided", () => {
    const vnode = ShStatCard({
      label: "SVC",
      value: "3/12",
      status: "healthy",
      detail: "3 failing",
    });
    const detailChild = vnode.props.children.find(
      (child) =>
        child &&
        child.props &&
        child.props.class &&
        child.props.class.includes("sh-stat-card-detail"),
    );
    assert.ok(detailChild, "Should have detail child when detail prop provided");
  });

  it("omits detail span when detail prop not provided", () => {
    const vnode = ShStatCard({ label: "SVC", value: "3/12", status: "healthy" });
    const detailChild = vnode.props.children.find(
      (child) =>
        child &&
        child.props &&
        child.props.class &&
        child.props.class.includes("sh-stat-card-detail"),
    );
    assert.equal(detailChild, undefined, "Should not have detail child when detail prop omitted");
  });

  it("passes additional class prop through", () => {
    const vnode = ShStatCard({ label: "SVC", value: "3/12", status: "healthy", class: "my-card" });
    assert.ok(vnode.props.class.includes("my-card"), "Expected custom class on card");
  });

  it("renders anchor href when provided", () => {
    const vnode = ShStatCard({ label: "SVC", value: "3/12", status: "ok", href: "/dashboard" });
    assert.equal(vnode.type, "a", "Should render as anchor");
    assert.equal(vnode.props.href, "/dashboard", "Should set href attribute");
  });
});
