/**
 * Mark nav items active based on scroll position.
 * @param {Element[]} sections - Section elements with IDs
 * @param {Function} onActive - Called with section ID when active section changes
 * @param {object} [opts]
 * @param {number} [opts.offset=100] - Pixels from top to consider "active"
 * @returns {() => void} Cleanup function
 */
export function scrollSpy(sections, onActive, opts = {}) {
  const { offset = 100 } = opts;

  const handler = () => {
    let activeId = null;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= offset) {
        activeId = section.id;
      }
    }
    if (activeId) onActive(activeId);
  };

  window.addEventListener("scroll", handler, { passive: true });
  handler();
  return () => window.removeEventListener("scroll", handler);
}
