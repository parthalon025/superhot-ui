/**
 * ShStatusBadge — terminal entity health state indicator.
 *
 * Signal: entity health state
 * Emotional loop: all nodes (status is always visible)
 *
 * @param {object} props
 * @param {'healthy'|'error'|'warning'|'waiting'|'active'|'ok'} props.status
 * @param {string} [props.label] - Display label. Defaults to status value if not provided.
 * @param {boolean} [props.glow=true] - Show glow box-shadow matching status color
 * @param {string} [props.class]
 */
export function ShStatusBadge({ status, label, glow = true, class: className, ...rest }) {
  return (
    <span
      class={["sh-status-badge", className].filter(Boolean).join(" ")}
      data-sh-status={status}
      data-sh-glow={String(glow)}
      {...rest}
    >
      {label != null ? label : status}
    </span>
  );
}
