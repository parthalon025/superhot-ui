/**
 * ShStatsGrid — labeled value grid for key metrics.
 */
export function ShStatsGrid({ stats = [], cols, class: className, ...rest }) {
  const gridStyle = cols
    ? `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 12px;`
    : "display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;";

  return (
    <div class={className} style={gridStyle} {...rest}>
      {stats.map((stat, i) => (
        <div key={i} style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-family: var(--font-mono); font-size: var(--type-label); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary);">
            {stat.label}
          </span>
          <span style="font-family: var(--font-mono); font-size: var(--type-headline); font-weight: 600; color: var(--text-primary);">
            {stat.value ?? "\u2014"}
            {stat.unit && (
              <span style="font-size: var(--type-label); color: var(--text-secondary); margin-left: 3px;">
                {stat.unit}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
export default ShStatsGrid;
