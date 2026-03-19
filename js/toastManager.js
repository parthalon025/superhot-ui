/**
 * Create a toast manager for managing toast stack state.
 * @returns {{ add(type, message, duration?): number, remove(id): void, clear(): void, getAll(): Array }}
 */
export function createToastManager() {
  let toasts = [];
  let nextId = 1;
  const listeners = new Set();

  const notify = () => listeners.forEach((fn) => fn(toasts));

  return {
    add(type, message, duration = 3000) {
      const id = nextId++;
      toasts = [...toasts, { id, type, message, duration }];
      notify();
      return id;
    },
    remove(id) {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    },
    clear() {
      toasts = [];
      notify();
    },
    getAll() {
      return toasts;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
