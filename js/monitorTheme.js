/**
 * Set monitor phosphor theme and persist to localStorage.
 * @param {'cyan'|'amber'|'green'} theme
 */
export function setMonitorTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "cyan") {
    root.removeAttribute("data-sh-monitor");
  } else {
    root.setAttribute("data-sh-monitor", theme);
  }
  try {
    localStorage.setItem("sh-monitor-theme", theme);
  } catch (e) {
    // localStorage unavailable
  }
}

/**
 * Load monitor theme from localStorage and apply.
 * @returns {string} The applied theme
 */
export function loadMonitorTheme() {
  let theme = "cyan";
  try {
    theme = localStorage.getItem("sh-monitor-theme") || "cyan";
  } catch (e) {
    // localStorage unavailable
  }
  setMonitorTheme(theme);
  return theme;
}
