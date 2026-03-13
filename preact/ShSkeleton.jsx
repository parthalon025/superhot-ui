/**
 * ShSkeleton — loading placeholder with phosphor shimmer.
 *
 * Signal: data loading / not yet materialized
 * Emotional loop: tension → pause
 *
 * @param {object} props
 * @param {number} [props.rows=3] - Number of skeleton rows to render
 * @param {string} [props.width='100%'] - Width of each row (CSS value)
 * @param {string} [props.height='1em'] - Height of each row (CSS value)
 * @param {string} [props.class] - Additional class names for the wrapper
 */
export function ShSkeleton({ rows = 3, width = "100%", height = "1em", class: className, ...rest }) {
  const items = Array.from({ length: rows }, (_, idx) => idx);

  return (
    <div class={className} {...rest}>
      {items.map((idx) => (
        <div
          key={idx}
          class="sh-skeleton"
          style={{ width, height, marginBottom: idx < rows - 1 ? "0.5em" : undefined }}
          role="presentation"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
