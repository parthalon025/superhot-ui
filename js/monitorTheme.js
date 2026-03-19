/**
 * Set phosphor monitor variant and persist to localStorage.
 * @param {'cyan'|'amber'|'green'} variant — Monitor phosphor color mode
 */
export function setMonitorVariant(variant) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (variant === "cyan") {
    root.removeAttribute("data-sh-monitor");
  } else {
    root.setAttribute("data-sh-monitor", variant);
  }
  try {
    localStorage.setItem("sh-monitor-variant", variant);
  } catch (e) {
    // localStorage unavailable
  }
}

/**
 * Load monitor variant from localStorage and apply.
 * @returns {string} The applied variant
 */
export function loadMonitorVariant() {
  let variant = "cyan";
  try {
    variant = localStorage.getItem("sh-monitor-variant") || "cyan";
  } catch (e) {
    // localStorage unavailable
  }
  setMonitorVariant(variant);
  return variant;
}
