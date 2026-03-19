/**
 * ShEmptyState — terminal-styled empty/standby state.
 *
 * Signal: system idle, awaiting input
 * Emotional loop: stillness → anticipation
 *
 * @param {object} props
 * @param {string} [props.message='STANDBY']
 * @param {string} [props.hint] - Keyboard shortcut or action hint (e.g. "Ctrl+K")
 * @param {string} [props.class]
 */
export function ShEmptyState({ message = "STANDBY", hint, class: className, ...rest }) {
  return (
    <div
      class={`sh-frame${className ? ` ${className}` : ""}`}
      style="text-align: center; padding: 48px 24px"
      {...rest}
    >
      <div style="font-family: var(--font-mono); font-size: var(--type-display); color: var(--text-muted); letter-spacing: 0.2em">
        {message}
      </div>
      {hint && (
        <div
          class="sh-cursor-idle"
          style="font-family: var(--font-mono); font-size: var(--type-label); color: var(--text-secondary); margin-top: 12px"
        >
          {hint}
        </div>
      )}
    </div>
  );
}
export default ShEmptyState;
