/**
 * ShTestChamber — Panel assembly container.
 *
 * Children with class "sh-panel" animate in with staggered slide.
 * Like Portal's test chamber panels assembling around the player.
 *
 * Signal: content assembly, layout materialization
 * Emotional loop: anticipation → reveal
 *
 * @param {object} props
 * @param {number} [props.chamber] - Optional chamber number badge
 * @param {'bottom'|'left'|'right'} [props.direction='bottom'] - Panel slide direction
 * @param {string} [props.class]
 * @param {import('preact').ComponentChildren} props.children
 */
export function ShTestChamber({
  chamber,
  direction = "bottom",
  class: className,
  children,
  ...rest
}) {
  const dirClass = direction !== "bottom" ? `sh-test-chamber--from-${direction}` : "";
  const cls = ["sh-test-chamber", dirClass, className].filter(Boolean).join(" ");

  return (
    <div class={cls} {...rest}>
      {chamber != null && (
        <span class="sh-test-chamber-number">CHAMBER {String(chamber).padStart(2, "0")}</span>
      )}
      {children}
    </div>
  );
}
