import { ShThreatPulse } from "./ShThreatPulse.jsx";

/**
 * ShStatCard — decision-driving system metric HUD card.
 *
 * Signal: state of a system metric and whether it needs action
 * Emotional loop: all nodes (persistent dashboard metric)
 *
 * @param {object} props
 * @param {string} props.label              — metric name, displayed UPPERCASE
 * @param {string|number} props.value       — the reading ("3/12", "paused", 12)
 * @param {'healthy'|'error'|'warning'|'waiting'|'active'|'ok'} props.status
 * @param {string} [props.detail]           — secondary context ("3 failing")
 * @param {string} [props.href]             — makes card a full-bleed anchor
 * @param {string} [props.class]
 */
export function ShStatCard({ label, value, status, detail, href, class: className, ...rest }) {
  const isError = status === "error";

  const ariaLabel = `${label}: ${value ?? "\u2014"} \u2014 ${status}`;

  const inner = href ? (
    <a
      href={href}
      class={["sh-stat-card", className].filter(Boolean).join(" ")}
      data-sh-status={status}
      aria-label={ariaLabel}
      {...rest}
    >
      <span class="sh-stat-card-label">{label}</span>
      <span class="sh-stat-card-value">{value}</span>
      {detail && <span class="sh-stat-card-detail">{detail}</span>}
    </a>
  ) : (
    <div
      class={["sh-stat-card", className].filter(Boolean).join(" ")}
      data-sh-status={status}
      aria-label={ariaLabel}
      {...rest}
    >
      <span class="sh-stat-card-label">{label}</span>
      <span class="sh-stat-card-value">{value}</span>
      {detail && <span class="sh-stat-card-detail">{detail}</span>}
    </div>
  );

  if (isError) {
    return (
      <ShThreatPulse active persistent>
        {inner}
      </ShThreatPulse>
    );
  }

  return inner;
}
