/**
 * Register keyboard shortcuts for command palette integration.
 * @returns {{ register(key, label, action): void, unregister(key): void, getAll(): Array, handleKeyDown(event): void }}
 */
export function createShortcutRegistry() {
  const shortcuts = new Map();

  return {
    register(key, label, action) {
      shortcuts.set(key.toLowerCase(), { key, label, action });
    },
    unregister(key) {
      shortcuts.delete(key.toLowerCase());
    },
    getAll() {
      return [...shortcuts.values()];
    },
    handleKeyDown(event) {
      const parts = [];
      if (event.ctrlKey || event.metaKey) parts.push("ctrl");
      if (event.shiftKey) parts.push("shift");
      if (event.altKey) parts.push("alt");
      parts.push(event.key.toLowerCase());
      const combo = parts.join("+");

      const shortcut = shortcuts.get(combo);
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
  };
}
