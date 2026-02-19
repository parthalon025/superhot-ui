import { h } from 'preact';

export function ShMantra({ text, active, class: className, children, ...rest }) {
  const attrs = {};
  if (active && text) {
    attrs['data-sh-mantra'] = text;
  }

  return h('div', { class: className, ...attrs, ...rest }, children);
}
