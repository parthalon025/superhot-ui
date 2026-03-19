/**
 * ShErrorState — terminal-styled error fallback.
 */
export function ShErrorState({ title = "Error", message, onRetry, class: className, ...rest }) {
  return (
    <div
      class={`sh-frame${className ? ` ${className}` : ""}`}
      role="alert"
      aria-live="assertive"
      {...rest}
    >
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="color: var(--status-error); font-family: var(--font-mono); font-weight: 700;">
          FAULT: {title}
        </span>
      </div>
      {message && (
        <p style="font-family: var(--font-mono); font-size: var(--type-label); color: var(--text-secondary); margin-bottom: 12px;">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style="background: var(--bg-surface-raised); color: var(--text-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius); padding: 4px 12px; font-family: var(--font-mono); font-size: var(--type-label); cursor: pointer;"
        >
          RETRY
        </button>
      )}
    </div>
  );
}
export default ShErrorState;
