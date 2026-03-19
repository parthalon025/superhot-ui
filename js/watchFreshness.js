import { applyFreshness } from "./freshness.js";

/**
 * Watch a container and auto-apply freshness to all children with data-sh-timestamp.
 * @param {Element} container
 * @param {object} [opts]
 * @param {number} [opts.interval=30000] - Poll interval in ms
 * @param {object} [opts.thresholds] - Custom freshness thresholds
 * @returns {() => void} Cleanup function
 */
export function watchFreshness(container, opts = {}) {
  const { interval = 30000, thresholds } = opts;

  const update = () => {
    if (!container) return;
    const els = container.querySelectorAll("[data-sh-timestamp]");
    for (const el of els) {
      const ts = Number(el.getAttribute("data-sh-timestamp"));
      if (ts) applyFreshness(el, ts, thresholds);
    }
  };

  update();
  const id = setInterval(update, interval);
  return () => clearInterval(id);
}
