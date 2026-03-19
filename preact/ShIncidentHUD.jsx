import { useState, useEffect } from "preact/hooks";

/**
 * ShIncidentHUD — system-wide incident banner with severity and elapsed time.
 *
 * Signal: "active system-wide incident"
 * Pushes content down. Persists until acknowledged or resolved.
 *
 * @param {object} props
 * @param {boolean} props.active - Whether the incident is active
 * @param {'warning'|'critical'} [props.severity='warning']
 * @param {string} props.message - Incident description
 * @param {number} [props.timestamp] - Epoch ms when incident started
 * @param {Function} [props.onAcknowledge] - Called when ACK button clicked
 * @param {string} [props.class]
 */
export function ShIncidentHUD({
  active,
  severity = "warning",
  message,
  timestamp,
  onAcknowledge,
  class: className,
  ...rest
}) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!active || timestamp == null) return;

    function update() {
      const delta = Math.floor((Date.now() - timestamp) / 1000);
      if (delta < 60) {
        setElapsed(`${delta}s`);
      } else if (delta < 3600) {
        const mins = Math.floor(delta / 60);
        const secs = delta % 60;
        setElapsed(`${mins}m ${secs}s`);
      } else {
        const hrs = Math.floor(delta / 3600);
        const mins = Math.floor((delta % 3600) / 60);
        setElapsed(`${hrs}h ${mins}m`);
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active, timestamp]);

  if (!active) return null;

  const cls = ["sh-incident-hud", `sh-incident-hud--${severity}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div class={cls} role="alert" aria-live="assertive" {...rest}>
      <span class="sh-incident-hud-message">{message}</span>
      {timestamp != null && <span class="sh-incident-hud-time">{elapsed}</span>}
      {onAcknowledge && (
        <button type="button" class="sh-incident-hud-action" onClick={onAcknowledge}>
          ACK
        </button>
      )}
    </div>
  );
}
