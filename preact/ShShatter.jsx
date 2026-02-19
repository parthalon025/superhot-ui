import { h } from 'preact';
import { useRef, useCallback } from 'preact/hooks';
import { shatterElement } from '../js/shatter.js';

export function ShShatter({ onDismiss, class: className, children, ...rest }) {
  const ref = useRef(null);

  const dismiss = useCallback(() => {
    if (!ref.current) {
      onDismiss?.();
      return;
    }
    shatterElement(ref.current, { onComplete: onDismiss });
  }, [onDismiss]);

  return h('div', {
    ref,
    class: className,
    'data-sh-dismiss': '',
    onClick: dismiss,
    ...rest,
  }, children);
}
