import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ShNav } from "../dist/superhot.preact.js";

describe("ShNav", () => {
  const items = [
    { path: "/", label: "Home", icon: () => null },
    { path: "/about", label: "About", icon: () => null },
    { path: "/settings", label: "Settings", icon: () => null, system: true },
  ];

  it("renders without error", () => {
    const v = ShNav({ items, currentPath: "/" });
    assert.ok(v !== null && v !== undefined, "ShNav returned null");
  });

  it("renders nav element", () => {
    const v = ShNav({ items, currentPath: "/" });
    const str = JSON.stringify(v);
    assert.ok(str.includes('"nav"') || str.includes('"div"'), "no nav container found");
  });
});
