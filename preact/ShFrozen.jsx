import { useEffect, useRef } from "preact/hooks";
import { applyFreshness } from "../js/freshness.js";

/**
 * Wraps children and applies freshness state based on timestamp.
 *
 * @param {object} props
 * @param {number|import('@preact/signals').Signal<number>} props.timestamp
 *   Unix epoch ms. Pass a Signal for instant reactivity; plain number polls every 30s.
 * @param {object} [props.thresholds]
 * @param {string} [props.class]
 */
export function ShFrozen({ timestamp, thresholds, class: className, children, ...rest }) {
  const ref = useRef(null);
  const isSignal = timestamp != null && typeof timestamp === "object" && "value" in timestamp;

  useEffect(() => {
    if (!ref.current) return;
    const getValue = () => (isSignal ? timestamp.value : timestamp);

    const apply = () => {
      const val = getValue();
      if (val == null) return;
      applyFreshness(ref.current, val, thresholds);
    };

    apply();

    if (isSignal) {
      // Subscribe to signal changes — react instantly on update
      return timestamp.subscribe(() => apply());
    } else {
      // Plain number — poll every 30s
      const interval = setInterval(apply, 30_000);
      return () => clearInterval(interval);
    }
  }, [timestamp, thresholds, isSignal]);

  return (
    <div ref={ref} class={className} {...rest}>
      {children}
    </div>
  );
}
