import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createToastManager } from "../js/toastManager.js";
import { createShortcutRegistry } from "../js/shortcuts.js";

describe("createToastManager", () => {
  it("adds and retrieves toasts", () => {
    const mgr = createToastManager();
    mgr.add("info", "hello");
    assert.strictEqual(mgr.getAll().length, 1);
    assert.strictEqual(mgr.getAll()[0].message, "hello");
  });
  it("removes toast by id", () => {
    const mgr = createToastManager();
    const id = mgr.add("info", "test");
    mgr.remove(id);
    assert.strictEqual(mgr.getAll().length, 0);
  });
  it("clears all toasts", () => {
    const mgr = createToastManager();
    mgr.add("info", "a");
    mgr.add("error", "b");
    mgr.clear();
    assert.strictEqual(mgr.getAll().length, 0);
  });
  it("notifies subscribers", () => {
    const mgr = createToastManager();
    const cb = mock.fn();
    mgr.subscribe(cb);
    mgr.add("info", "test");
    assert.strictEqual(cb.mock.calls.length, 1);
  });
});

describe("createShortcutRegistry", () => {
  it("registers and retrieves shortcuts", () => {
    const reg = createShortcutRegistry();
    reg.register("ctrl+k", "Command Palette", () => {});
    assert.strictEqual(reg.getAll().length, 1);
    assert.strictEqual(reg.getAll()[0].label, "Command Palette");
  });
  it("unregisters shortcuts", () => {
    const reg = createShortcutRegistry();
    reg.register("ctrl+k", "Test", () => {});
    reg.unregister("ctrl+k");
    assert.strictEqual(reg.getAll().length, 0);
  });
  it("handles keydown for registered shortcut", () => {
    const reg = createShortcutRegistry();
    const action = mock.fn();
    reg.register("ctrl+k", "Test", action);
    reg.handleKeyDown({
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      key: "k",
      preventDefault: mock.fn(),
    });
    assert.strictEqual(action.mock.calls.length, 1);
  });
});
