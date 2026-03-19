import { useEffect, useRef } from "preact/hooks";
import { shatterElement } from "../js/shatter.js";

/**
 * ShToast — terminal-style system event notification.
 *
 * Signal: system event occurred
 * Emotional loop: execute → catharsis
 *
 * @param {object} props
 * @param {'info'|'warn'|'error'} [props.type='info']
 * @param {string} props.message
 * @param {Function} [props.onDismiss] - Called after dismiss animation completes
 * @param {number} [props.duration=3000] - Auto-dismiss delay in ms. 0 = persistent.
 * @param {string} [props.class]
 */
export function ShToast({
  type = "info",
  message,
  onDismiss,
  duration = 3000,
  class: className,
  ...rest
}) {
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        _dismiss(ref.current, onDismiss);
      }, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onDismiss]);

  function handleClick() {
    if (timerRef.current) clearTimeout(timerRef.current);
    onDismiss?.();
  }

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `[${hh}:${mm}:${ss}]`;

  const isPersistentError = type === "error" && duration === 0;

  return (
    <div
      ref={ref}
      class={["sh-toast", className].filter(Boolean).join(" ")}
      data-sh-toast-type={type}
      data-sh-effect={isPersistentError ? "threat-pulse" : undefined}
      onClick={handleClick}
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      {...rest}
    >
      <span class="sh-toast-time">{timestamp}</span>
      <span class="sh-toast-msg">{message}</span>
    </div>
  );
}

function _dismiss(el, onDismiss) {
  if (!el) {
    if (onDismiss) onDismiss();
    return;
  }
  shatterElement(el, { onComplete: onDismiss });
}
