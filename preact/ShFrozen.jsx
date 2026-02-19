import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { applyFreshness } from '../js/freshness.js';

export function ShFrozen({ timestamp, thresholds, class: className, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !timestamp) return;
    applyFreshness(ref.current, timestamp, thresholds);
    const interval = setInterval(() => {
      applyFreshness(ref.current, timestamp, thresholds);
    }, 30000);
    return () => clearInterval(interval);
  }, [timestamp, thresholds]);

  return h('div', { ref, class: className, ...rest }, children);
}
