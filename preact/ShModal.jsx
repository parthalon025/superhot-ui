import { useEffect, useRef } from "preact/hooks";

/**
 * System interrupt modal — atmosphere-guide.md Rule 29.
 * Traps focus and uses piOS voice.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title - Uppercase imperative (e.g. "CONFIRM: PURGE DLQ")
 * @param {string} [props.body] - Optional body text
 * @param {string} [props.confirmLabel="CONFIRM"]
 * @param {string} [props.cancelLabel="CANCEL"]
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 */
export function ShModal({
  open,
  title,
  body,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
  ...rest
}) {
  const overlayRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const handler = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onCancel?.();
  };

  return (
    <div
      class="sh-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      {...rest}
    >
      <div class="sh-modal">
        <div class="sh-modal-title">{title}</div>
        {body && <div class="sh-modal-body">{body}</div>}
        <div class="sh-modal-actions">
          <button class="sh-modal-action" onClick={onCancel} type="button">
            [{cancelLabel}]
          </button>
          <button
            class="sh-modal-action sh-modal-action--confirm"
            onClick={onConfirm}
            ref={confirmRef}
            type="button"
          >
            [{confirmLabel}]
          </button>
        </div>
      </div>
    </div>
  );
}
