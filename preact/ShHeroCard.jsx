/**
 * ShHeroCard — KPI metric card with data freshness and optional sparkline.
 * Uses .sh-frame with cursor system and data-sh-state for staleness.
 *
 * No Preact hooks — uses callback refs for DOM side-effects so the component
 * can be called as a plain function in tests without a render cycle.
 *
 * @param {Object}  props
 * @param {*}       props.value      Display value (null → em-dash)
 * @param {string}  props.label      Frame header label
 * @param {string}  [props.unit]     Unit suffix (e.g. "%", "kW")
 * @param {string}  [props.delta]    Trend text below value
 * @param {boolean} [props.warning]  Warning state — amber value + border
 * @param {boolean} [props.loading]  Loading state — cursor-working
 * @param {Array}   [props.sparkData] uPlot data for sparkline
 * @param {string}  [props.sparkColor] Sparkline color token
 * @param {string}  [props.timestamp] ISO timestamp for freshness
 * @param {string}  [props.href]     Wraps card in <a> when provided
 */
import { computeFreshness } from "../js/freshness.js";
import { glitchText } from "../js/glitch.js";
import ShTimeChart from "./ShTimeChart.jsx";

export function ShHeroCard({
  value,
  label,
  unit,
  delta,
  warning,
  loading,
  sparkData,
  sparkColor,
  timestamp,
  href,
}) {
  const cursorClass = loading ? "sh-cursor-working" : "sh-cursor-active";

  // Callback ref: set up freshness polling when the DOM node is available.
  // Avoids useRef/useEffect so the component is safe to call as a plain function in tests.
  function attachFreshness(node) {
    if (!node || !timestamp) return;
    function update() {
      const state = computeFreshness(timestamp);
      node.setAttribute("data-sh-state", state);
    }
    update();
    const id = setInterval(update, 30000);
    // Store cleanup on the node itself so it can be called on unmount if needed
    node._shFreshnessCleanup = () => clearInterval(id);
  }

  const cardContent = (
    <div
      ref={attachFreshness}
      class={`sh-frame ${cursorClass}${warning ? " sh-hero-card--warning" : ""}`}
      data-label={label}
      style={warning ? "border-left: 3px solid var(--status-warning);" : ""}
    >
      <div style="display: flex; align-items: baseline; gap: var(--space-2); justify-content: space-between;">
        <div style="display: flex; align-items: baseline; gap: var(--space-2);">
          <span
            class="sh-hero-value"
            ref={(el) => {
              if (!el) return;
              const prev = el.getAttribute("data-sh-prev-value");
              const current = String(value);
              if (prev && prev !== current) {
                glitchText(el, { duration: 100, intensity: "low" });
              }
              el.setAttribute("data-sh-prev-value", current);
            }}
          >
            {value ?? "\u2014"}
          </span>
          {unit && <span class="sh-hero-unit">{unit}</span>}
        </div>
        <div style="width: var(--sh-hero-sparkline-width); flex-shrink: 0;">
          <ShTimeChart data={sparkData} compact height={32} color={sparkColor || "var(--accent)"} />
        </div>
      </div>
      {delta && <div class="sh-hero-delta">{delta}</div>}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        class="sh-clickable"
        style="display: block; text-decoration: none; color: inherit;"
      >
        {cardContent}
      </a>
    );
  }
  return cardContent;
}

export default ShHeroCard;
