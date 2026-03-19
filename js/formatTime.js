/**
 * Format timestamps in military/piOS style (atmosphere Rule 24).
 *
 * @param {number} epochMs - Unix epoch milliseconds
 * @param {'full'|'compact'|'date'|'relative'|'duration'} [mode='full']
 * @returns {string}
 */
export function formatTime(epochMs, mode = "full") {
  const d = new Date(epochMs);
  const pad = (n) => String(n).padStart(2, "0");

  switch (mode) {
    case "full":
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    case "compact":
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    case "date":
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    case "relative": {
      const seconds = Math.floor((Date.now() - epochMs) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    }
    case "duration": {
      const seconds = Math.floor(epochMs / 1000);
      if (seconds < 60) return `${seconds}s`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }
    default:
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}
