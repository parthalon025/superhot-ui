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
import { useState } from "preact/hooks";

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
  let open, setOpen;
  try {
    [open, setOpen] = useState(defaultOpen);
  } catch {
    // Called as plain function outside Preact render (tests, SSR) — use defaultOpen as static value
    open = defaultOpen;
    setOpen = () => {};
  }

  const cursorClass = loading ? "sh-cursor-working" : open ? "sh-cursor-active" : "sh-cursor-idle";

  function toggle() {
    if (!loading) setOpen(!open);
  }

  return (
    <div
      class={["sh-collapsible", cursorClass, className].filter(Boolean).join(" ")}
      data-sh-open={open ? "true" : "false"}
      {...rest}
    >
      <button
        class="sh-collapsible-toggle"
        aria-expanded={open}
        disabled={loading}
        type="button"
        onClick={toggle}
      >
        <span class="sh-collapsible-title">{title}</span>
        {!open && summary && <span class="sh-bracket">{summary}</span>}
      </button>
      {open && subtitle && <div class="sh-collapsible-subtitle">{subtitle}</div>}
      {open && children && <div class="sh-collapsible-body">{children}</div>}
    </div>
  );
}

export default ShCollapsible;
