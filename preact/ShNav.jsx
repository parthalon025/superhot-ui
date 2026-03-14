/**
 * ShNav — responsive 3-mode navigation shell.
 * Phone: fixed bottom tab bar (primary items + More sheet).
 * Tablet: collapsible left icon rail (56px ↔ 240px).
 * Desktop: fixed left sidebar (240px, sh-terminal-bg).
 *
 * Uses sh-nav-phone-wrapper / sh-nav-rail-wrapper / sh-nav-sidebar-wrapper
 * CSS classes for breakpoint visibility (no Tailwind dependency).
 *
 * @param {Object}   props
 * @param {Array}    props.items        [{path, label, icon, system?}]
 * @param {string}   props.currentPath  Active route path
 * @param {*}        [props.logo]       JSX for brand/logo slot
 * @param {*}        [props.footer]     JSX for footer slot
 */
import { useState, useEffect } from "preact/hooks";

function ChevronIcon({ down }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <polyline points={down ? "6 9 12 15 18 9" : "6 15 12 9 18 15"} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PhoneNav({ items, currentPath, footer }) {
  let moreOpen, setMoreOpen;
  try {
    [moreOpen, setMoreOpen] = useState(false);
  } catch {
    moreOpen = false;
    setMoreOpen = () => {};
  }

  const primaryItems = items.filter((it) => !it.system).slice(0, 4);
  const systemItems = items.filter((it) => it.system);

  return (
    <nav class="sh-nav-phone" aria-label="Primary navigation">
      {moreOpen && (
        <div class="sh-nav-sheet">
          <div class="sh-nav-sheet-backdrop" onClick={() => setMoreOpen(false)} />
          <div class="sh-nav-sheet-content">
            <div class="sh-nav-sheet-header">
              <span style="font-size: var(--type-label); font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                More
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                style="background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 4px;"
              >
                <CloseIcon />
              </button>
            </div>
            <div style="padding: 8px 0;">
              {systemItems.map((item) => {
                const active = currentPath === item.path;
                return (
                  <a
                    key={item.path}
                    href={`#${item.path}`}
                    class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
                    style="padding: 12px 20px; font-size: 14px;"
                  >
                    <item.icon />
                    {item.label}
                  </a>
                );
              })}
              {footer && (
                <div style="padding: 12px 20px; border-top: 1px solid var(--border-subtle); margin-top: 4px;">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {primaryItems.map((item) => {
        const active = currentPath === item.path;
        return (
          <a
            key={item.path}
            href={`#${item.path}`}
            style={`display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 48px; min-height: 48px; font-size: 10px; font-weight: 500; text-decoration: none; gap: 2px; border-top: 2px solid ${active ? "var(--accent)" : "transparent"}; color: ${active ? "var(--accent)" : "var(--text-tertiary)"}; margin-top: -2px;`}
            aria-label={item.label}
          >
            <item.icon />
            <span>{item.label}</span>
          </a>
        );
      })}

      {systemItems.length > 0 && (
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          style={`display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 48px; min-height: 48px; font-size: 10px; font-weight: 500; gap: 2px; background: none; border: none; border-top: 2px solid ${moreOpen ? "var(--accent)" : "transparent"}; color: ${moreOpen ? "var(--accent)" : "var(--text-tertiary)"}; margin-top: -2px; cursor: pointer;`}
          aria-label="More navigation options"
          aria-expanded={moreOpen}
        >
          <MoreIcon />
          <span>More</span>
        </button>
      )}
    </nav>
  );
}

function TabletNav({ items, currentPath, logo, footer }) {
  let expanded, setExpanded, systemOpen, setSystemOpen;
  try {
    [expanded, setExpanded] = useState(false);
    [systemOpen, setSystemOpen] = useState(false);
  } catch {
    expanded = false;
    setExpanded = () => {};
    systemOpen = false;
    setSystemOpen = () => {};
  }

  const primaryItems = items.filter((it) => !it.system);

  return (
    <>
      {expanded && (
        <div style="position: fixed; inset: 0; z-index: 29;" onClick={() => setExpanded(false)} />
      )}
      <nav
        class={`sh-nav-rail${expanded ? " sh-nav-rail--expanded" : ""}`}
        aria-label="Primary navigation"
      >
        <button
          class="sh-nav-item sh-nav-item--icon"
          style="flex-shrink: 0; height: 56px; width: 56px;"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
        >
          {expanded ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div style="flex: 1; overflow-y: auto; padding: 4px 0;">
          {expanded ? (
            <>
              {primaryItems.map((item) => {
                const active = currentPath === item.path;
                return (
                  <a
                    key={item.path}
                    href={`#${item.path}`}
                    class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
                    style="padding-left: 14px;"
                    aria-label={item.label}
                  >
                    <item.icon />
                    {item.label}
                  </a>
                );
              })}
              {items.some((it) => it.system) && (
                <>
                  <button
                    class="sh-nav-section-label"
                    onClick={() => setSystemOpen(!systemOpen)}
                    aria-expanded={systemOpen}
                  >
                    <span>System</span>
                    <ChevronIcon down={systemOpen} />
                  </button>
                  {systemOpen &&
                    items
                      .filter((it) => it.system)
                      .map((item) => {
                        const active = currentPath === item.path;
                        return (
                          <a
                            key={item.path}
                            href={`#${item.path}`}
                            class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
                            style="padding-left: 14px;"
                            aria-label={item.label}
                          >
                            <item.icon />
                            {item.label}
                          </a>
                        );
                      })}
                </>
              )}
            </>
          ) : (
            primaryItems.map((item) => {
              const active = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={`#${item.path}`}
                  class={`sh-nav-item sh-nav-item--icon${active ? " sh-nav-item--active" : ""}`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <item.icon />
                </a>
              );
            })
          )}
        </div>

        {footer && (
          <div style="border-top: 1px solid var(--border-subtle); padding: 4px 0; flex-shrink: 0;">
            {footer}
          </div>
        )}
      </nav>
    </>
  );
}

function DesktopNav({ items, currentPath, logo, footer }) {
  let systemOpen, setSystemOpen;
  try {
    [systemOpen, setSystemOpen] = useState(false);
  } catch {
    systemOpen = false;
    setSystemOpen = () => {};
  }

  const primaryItems = items.filter((it) => !it.system);

  return (
    <nav class="sh-nav-sidebar sh-terminal-bg" aria-label="Primary navigation">
      {logo && <div style="padding: 20px;">{logo}</div>}

      <div style="flex: 1; padding: 12px; overflow-y: auto;">
        {primaryItems.map((item) => {
          const active = currentPath === item.path;
          return (
            <a
              key={item.path}
              href={`#${item.path}`}
              class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
              aria-label={item.label}
            >
              <item.icon />
              {item.label}
            </a>
          );
        })}

        {items.some((it) => it.system) && (
          <>
            <button
              class="sh-nav-section-label"
              onClick={() => setSystemOpen(!systemOpen)}
              aria-expanded={systemOpen}
            >
              <span>System</span>
              <ChevronIcon down={systemOpen} />
            </button>
            {systemOpen &&
              items
                .filter((it) => it.system)
                .map((item) => {
                  const active = currentPath === item.path;
                  return (
                    <a
                      key={item.path}
                      href={`#${item.path}`}
                      class={`sh-nav-item${active ? " sh-nav-item--active" : ""}`}
                      aria-label={item.label}
                    >
                      <item.icon />
                      {item.label}
                    </a>
                  );
                })}
          </>
        )}
      </div>

      {footer && (
        <div style="padding: 12px; border-top: 1px solid var(--border-subtle); flex-shrink: 0;">
          {footer}
        </div>
      )}
    </nav>
  );
}

export function ShNav({ items = [], currentPath = "/", logo, footer }) {
  let path, setPath;
  try {
    [path, setPath] = useState(currentPath);
  } catch {
    path = currentPath;
    setPath = () => {};
  }

  try {
    useEffect(() => {
      function onHash() {
        if (typeof window === "undefined") return;
        const hash = window.location.hash || "#/";
        const p = hash.replace(/^#/, "") || "/";
        setPath(p.includes("?") ? p.slice(0, p.indexOf("?")) : p);
      }
      if (typeof window !== "undefined") {
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
      }
    }, []);

    useEffect(() => {
      setPath(currentPath);
    }, [currentPath]);
  } catch {
    // Outside render context — hashchange not registered (tests)
  }

  return (
    <div>
      <div class="sh-nav-phone-wrapper">
        <PhoneNav items={items} currentPath={path} footer={footer} />
      </div>
      <div class="sh-nav-rail-wrapper">
        <TabletNav items={items} currentPath={path} logo={logo} footer={footer} />
      </div>
      <div class="sh-nav-sidebar-wrapper">
        <DesktopNav items={items} currentPath={path} logo={logo} footer={footer} />
      </div>
    </div>
  );
}

export default ShNav;
