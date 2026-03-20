/**
 * ShAntline — Portal-inspired animated connecting line between elements.
 *
 * Signal: relationship/flow between two UI elements
 * Emotional loop: connection, state transition
 *
 * @param {object} props
 * @param {boolean} [props.active=false] - Active state (orange) vs inactive (blue)
 * @param {boolean} [props.vertical=false] - Vertical orientation
 * @param {string} [props.class]
 * @param {import('preact').ComponentChildren} [props.children] - Content placed between endpoint nodes
 */
export function ShAntline({
  active = false,
  vertical = false,
  class: className,
  children,
  ...rest
}) {
  const activeStr = String(active);
  const cls = ["sh-antline", vertical ? "sh-antline--vertical" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div class={cls} role="presentation" aria-hidden="true" {...rest}>
      <div class="sh-antline-node" data-sh-antline-active={activeStr} />
      <div class="sh-antline-line" data-sh-antline-active={activeStr} />
      {children}
      <div class="sh-antline-line" data-sh-antline-active={activeStr} />
      <div class="sh-antline-node" data-sh-antline-active={activeStr} />
    </div>
  );
}
