import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

export function ShThreatPulse({ active, persistent = false, class: className, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !ref.current || persistent) return;

    const style = getComputedStyle(ref.current);
    const duration = parseFloat(style.getPropertyValue('--sh-threat-pulse-duration') || '1.5') * 1000;
    const timer = setTimeout(() => {
      ref.current?.removeAttribute('data-sh-effect');
    }, duration * 2 + 100);

    return () => clearTimeout(timer);
  }, [active, persistent]);

  const attrs = {};
  if (active) {
    attrs['data-sh-effect'] = 'threat-pulse';
  }

  return h('div', { ref, class: className, ...attrs, ...rest }, children);
}
