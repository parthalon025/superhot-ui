/**
 * ShTimeChart — uPlot time-series chart wrapper.
 * Themed to the SUPERHOT aesthetic: void surfaces, threat-red lines,
 * terminal mono labels.
 *
 * No Preact hooks — uses callback ref for uPlot init so the component
 * can be called as a plain function in tests without a render cycle.
 *
 * @param {Object}   props
 * @param {Array}    [props.data]      Array of {t, v} objects (t=unix seconds, v=number). Null/empty → empty state.
 * @param {boolean}  [props.compact]   Compact mode — smaller height, no axes/legend/cursor.
 * @param {string}   [props.color]     CSS color string or var() reference. Default: 'var(--accent)'.
 * @param {string}   [props.label]     Series label (shown in legend). Default: ''.
 * @param {number}   [props.height]    Override --sh-chart-height (px).
 * @param {string}   [props.className] Extra CSS classes.
 */

// uPlot is a browser-only dependency — guard for Node test environment
let uPlot;
try {
  uPlot = require("uplot");
} catch (_) {}

export function ShTimeChart({
  data = null,
  compact = false,
  color = "var(--accent)",
  label = "",
  height,
  className = "",
}) {
  const isEmpty = !data || !Array.isArray(data) || data.length === 0;

  // Build CSS class string
  const classes = [
    "sh-chart",
    compact ? "sh-chart--compact" : "",
    isEmpty ? "sh-chart--empty" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Inline style — height override via custom property
  const style = height != null ? { "--sh-chart-height": `${height}px` } : undefined;

  // Empty state: return styled placeholder
  if (isEmpty) {
    return (
      <div class={classes} style={style} aria-hidden="true">
        {"\u2014"}
      </div>
    );
  }

  // Callback ref — initializes uPlot when the DOM node is first attached.
  // Using a callback ref (not useRef) so this component is safe to call
  // as a plain function in tests without a render cycle.
  // _lastCleanup is captured per-instance via closure so the null call on
  // unmount can disconnect the ResizeObserver and destroy the uPlot instance.
  let _lastCleanup = null;

  function attachChart(el) {
    if (!el) {
      // Preact calls with null on unmount — run cleanup
      if (_lastCleanup) {
        _lastCleanup();
        _lastCleanup = null;
      }
      return;
    }
    if (el._chartInit) return;
    el._chartInit = true;
    let chart, ro;
    try {
      // uPlot is not available in Node (test env) — bail out gracefully
      if (!uPlot || typeof window === "undefined") return;

      // Resolve CSS custom properties before passing to uPlot
      const computedStyle = getComputedStyle(el);
      const resolvedColor = color.startsWith("var(")
        ? computedStyle.getPropertyValue(color.slice(4, -1).trim()).trim() || "currentColor"
        : color;
      const textTertiary =
        computedStyle.getPropertyValue("--text-tertiary").trim() || "transparent";

      // Convert {t, v} array to uPlot's [timestamps, values] format
      const xs = data.map((d) => d.t);
      const ys = data.map((d) => d.v);
      const uData = [xs, ys];

      const opts = {
        width: el.offsetWidth || 200,
        height: el.offsetHeight || (compact ? 48 : 120),
        series: [
          {}, // x (timestamps) — uPlot always needs an empty first series
          {
            stroke: resolvedColor,
            fill: resolvedColor + "22",
            label,
            width: 1.5,
          },
        ],
        axes: compact
          ? [{ show: false }, { show: false }]
          : [
              {
                stroke: textTertiary,
                ticks: { stroke: textTertiary },
                grid: { stroke: textTertiary, width: 0.5 },
              },
              {
                stroke: textTertiary,
                ticks: { stroke: textTertiary },
                grid: { stroke: textTertiary, width: 0.5 },
              },
            ],
        legend: { show: !compact },
        cursor: { show: !compact },
        padding: compact ? [2, 2, 2, 2] : undefined,
      };

      chart = new uPlot(opts, uData, el);

      // Resize observer re-fits chart when container dimensions change
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          if (chart && el.offsetWidth > 0) {
            chart.setSize({ width: el.offsetWidth, height: el.offsetHeight });
          }
        });
        ro.observe(el);
      }

      // Register cleanup — called when Preact invokes the ref with null on unmount
      _lastCleanup = () => {
        if (ro) ro.disconnect();
        if (chart && typeof chart.destroy === "function") chart.destroy();
      };
    } catch (err) {
      // silent — chart unavailable in this environment (e.g., Node/JSDOM)
      if (typeof console !== "undefined")
        console.warn("[ShTimeChart] chart init failed:", err.message);
    }
  }

  return (
    <div
      class={classes}
      style={style}
      ref={attachChart}
      aria-label={label || "time series chart"}
    />
  );
}

export default ShTimeChart;
