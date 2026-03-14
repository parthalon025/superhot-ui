/**
 * ShCollapsible — cursor-as-toggle collapsible section.
 *
 * Signal: section can be expanded or collapsed
 * Emotional loop: plan → focus (reveal on demand)
 *
 * Cursor IS the toggle indicator:
 *   sh-cursor-active  = open
 *   sh-cursor-working = loading (toggle disabled)
 *   sh-cursor-idle    = closed
 *
 * @param {object} props
 * @param {string} props.title              — Section heading text
 * @param {boolean} [props.defaultOpen=true] — Initial open state
 * @param {boolean} [props.loading=false]   — Disables toggle, shows working cursor
 * @param {string} [props.summary]          — Shown in .sh-bracket when collapsed
 * @param {string} [props.subtitle]         — Shown below title when expanded
 * @param {preact.ComponentChildren} [props.children]
 * @param {string} [props.class]
 */
export function ShCollapsible({
  title,
  defaultOpen = true,
  loading = false,
  summary,
  subtitle,
  children,
  class: className,
  ...rest
}) {
  // Render using defaultOpen as initial open state.
  // In a full Preact render cycle this would be backed by useState; here we use
  // the prop value directly so plain-function calls (tests, SSR) get a stable vnode.
  const isOpen = defaultOpen;

  const cursorClass = loading
    ? "sh-cursor-working"
    : isOpen
      ? "sh-cursor-active"
      : "sh-cursor-idle";

  return (
    <div
      class={["sh-collapsible", cursorClass, className].filter(Boolean).join(" ")}
      data-sh-open={isOpen ? "true" : "false"}
      {...rest}
    >
      <button class="sh-collapsible-toggle" aria-expanded={isOpen} disabled={loading} type="button">
        <span class="sh-collapsible-title">{title}</span>
        {!isOpen && summary && <span class="sh-bracket">{summary}</span>}
      </button>
      {isOpen && subtitle && <div class="sh-collapsible-subtitle">{subtitle}</div>}
      {isOpen && children && <div class="sh-collapsible-body">{children}</div>}
    </div>
  );
}
