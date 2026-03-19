# Recipe: Responsive Navigation

Set up `ShNav` across all three breakpoints with hash-based routing, page banner integration, and full layout scaffolding. Copy-paste, define your routes, ship.

---

## What you get

- Phone: fixed bottom tab bar with More sheet for overflow
- Tablet: collapsible icon rail (56px collapsed, 240px expanded)
- Desktop: fixed left sidebar (240px)
- Hash-based routing with signal for `currentPath`
- Logo and footer slots
- `ShPageBanner` title updates on route change
- CSS breakpoint details and content offset classes

---

## 1. Install + init

```bash
npm install file:../superhot-ui
node node_modules/superhot-ui/scripts/setup.js
```

In your main CSS file:

```css
@import "superhot-ui/css";
```

---

## 2. Imports

```js
import { ShNav, ShPageBanner } from "superhot-ui/preact";
import { signal } from "@preact/signals";
```

---

## 3. Navigation items

Each item needs `path`, `label`, and `icon` (a Preact component). Items with `system: true` go in the System section on tablet/desktop and the More sheet on phone.

Phone shows the first 4 non-system items as bottom tabs. Everything else goes in the More sheet automatically.

```js
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M3 12l9-9 9 9M5 12v7a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-7"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
      />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="4" y="4" width="16" height="4" rx="1" fill="currentColor" />
      <rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="4" y="16" width="16" height="4" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function ModelsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function LogsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M4 6h16M4 10h12M4 14h14M4 18h10"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" />
      <path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" stroke-width="2" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" />
    </svg>
  );
}

const NAV_ITEMS = [
  { path: "/home", label: "Home", icon: HomeIcon },
  { path: "/queue", label: "Queue", icon: QueueIcon },
  { path: "/models", label: "Models", icon: ModelsIcon },
  { path: "/logs", label: "Logs", icon: LogsIcon },
  { path: "/settings", label: "Settings", icon: SettingsIcon, system: true },
  { path: "/about", label: "About", icon: AboutIcon, system: true },
];
```

Phone bottom tabs show: Home, Queue, Models, Logs (first 4 non-system). Settings and About appear in the More sheet.

---

## 4. Hash-based routing

`ShNav` uses hash routing. Links render as `href="#/path"`. The component listens for `hashchange` events internally and updates the active item.

Set up a signal for the current path and sync it with the URL hash:

```js
function getHashPath() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/home";
}

const currentPath = signal(getHashPath());

// Sync signal when hash changes (e.g., browser back/forward)
window.addEventListener("hashchange", () => {
  currentPath.value = getHashPath();
});

// Set initial hash if none
if (!window.location.hash) {
  window.location.hash = "#/home";
}
```

---

## 5. Page banner integration

`ShPageBanner` renders a pixel-art header. Update `namespace` and `page` based on the current route.

```js
function getPageTitle(path) {
  const TITLES = {
    "/home": "HOME",
    "/queue": "QUEUE",
    "/models": "MODELS",
    "/logs": "LOGS",
    "/settings": "SETTINGS",
    "/about": "ABOUT",
  };
  return TITLES[path] ?? "HOME";
}
```

The pixel font supports uppercase A-Z and space only. Numbers and punctuation are silently dropped.

---

## 6. Route content

Map paths to page components:

```jsx
function PageContent({ path }) {
  switch (path) {
    case "/home":
      return <HomePage />;
    case "/queue":
      return <QueuePage />;
    case "/models":
      return <ModelsPage />;
    case "/logs":
      return <LogsPage />;
    case "/settings":
      return <SettingsPage />;
    case "/about":
      return <AboutPage />;
    default:
      return <HomePage />;
  }
}
```

---

## 7. Full layout

```jsx
function App() {
  const path = currentPath.value;

  return (
    <div>
      {/* ShNav renders all 3 breakpoint modes simultaneously.
          CSS hides the inactive ones. */}
      <ShNav
        currentPath={path}
        logo={<span style="font-weight:600">piOS</span>}
        footer={<span class="sh-label sh-opacity-secondary">v1.0.0</span>}
        items={NAV_ITEMS}
      />

      {/* Main content -- offset classes push content right of sidebar/rail
          and above phone bottom tabs */}
      <main class="sh-nav-content-desktop sh-nav-content-tablet sh-nav-content-phone">
        <ShPageBanner namespace="piOS" page={getPageTitle(path)} />

        <div style="padding: 16px">
          <PageContent path={path} />
        </div>
      </main>
    </div>
  );
}
```

---

## 8. CSS breakpoints

`ShNav` uses three CSS breakpoint wrappers. All three DOM trees render on every page load -- CSS visibility handles which one shows.

| Breakpoint        | Wrapper class             | Mode    | Layout                                          |
| ----------------- | ------------------------- | ------- | ----------------------------------------------- |
| `< 640px`         | `.sh-nav-phone-wrapper`   | Phone   | Fixed bottom tab bar, max 4 items + More        |
| `640px -- 1023px` | `.sh-nav-rail-wrapper`    | Tablet  | Left icon rail, 56px collapsed / 240px expanded |
| `>= 1024px`       | `.sh-nav-sidebar-wrapper` | Desktop | Fixed left sidebar, 240px                       |

The exact breakpoint values: **639px** is the last phone pixel, **1023px** is the last tablet pixel.

### Content offset classes

Apply all three to your `<main>` element. Each one is scoped to its own media query, so they do not conflict:

| Class                     | Effect                 | Active at         |
| ------------------------- | ---------------------- | ----------------- |
| `.sh-nav-content-phone`   | `padding-bottom: 72px` | `< 640px`         |
| `.sh-nav-content-tablet`  | `padding-left: 56px`   | `640px -- 1023px` |
| `.sh-nav-content-desktop` | `padding-left: 240px`  | `>= 1024px`       |

---

## 9. Phone behavior details

- First 4 non-system items render as bottom tab icons
- System items + overflow items go in a More bottom sheet
- Active tab gets a `--accent` top border
- More button shows `aria-expanded` state
- Bottom bar respects `env(safe-area-inset-bottom)` for notched phones
- Minimum touch target: 48x48px per tab

The More sheet is a bottom drawer with a semi-transparent backdrop. It lists overflow items and system items in a scrollable panel (max 60vh).

---

## 10. Tablet behavior details

- **Collapsed:** icon-only rail at 56px wide. Each item shows as a centered icon with a `title` tooltip.
- **Expanded:** full 240px panel with labels. System items appear under a collapsible "System" section header.
- Hamburger button toggles expansion. Click the backdrop overlay to collapse.
- Transition between collapsed and expanded is animated via CSS.

---

## 11. Desktop behavior details

- Fixed 240px sidebar, always visible.
- Items show icon + label.
- System items are under a "System" section header.
- `.sh-terminal-bg` class is applied -- the sidebar gets the terminal background treatment.
- Active item gets `--accent` left border + `--bg-surface-raised`.

---

## 12. Logo and footer slots

Both slots render in tablet (expanded) and desktop modes. On phone, they are hidden.

```jsx
<ShNav
  logo={
    <div style="padding: 12px">
      <span style="font-weight: 600; font-size: 18px">piOS</span>
      <span class="sh-label sh-opacity-secondary" style="display: block">
        monitoring
      </span>
    </div>
  }
  footer={
    <div style="padding: 8px 12px">
      <span class="sh-label sh-opacity-secondary">v1.0.0</span>
    </div>
  }
  items={NAV_ITEMS}
  currentPath={currentPath.value}
/>
```

The footer slot is a good place for `ShCrtToggle`, version text, or a user avatar.

---

## 13. Accessibility

- All three nav modes use `<nav aria-label="Primary navigation">`
- Every link has `aria-label={item.label}`
- System section toggle has `aria-expanded`
- Phone More button: `aria-label="More navigation options"` + `aria-expanded`
- Close buttons: `aria-label="Close"`
- Decorative SVGs use `aria-hidden="true"`
- Keyboard navigation works across all modes

---

## Recap

| Concern        | How                                                            |
| -------------- | -------------------------------------------------------------- |
| Items array    | `{ path, label, icon, system? }` -- icon is a Preact component |
| Routing        | Hash-based, signal for `currentPath`, `hashchange` listener    |
| Phone          | Bottom tabs (4 primary + More sheet), `< 640px`                |
| Tablet         | Collapsible icon rail (56px / 240px), `640px -- 1023px`        |
| Desktop        | Fixed sidebar (240px), `>= 1024px`                             |
| Logo/footer    | JSX slots, visible on tablet (expanded) + desktop              |
| Page banner    | `ShPageBanner` with `namespace` + `page` from route lookup     |
| Content offset | Apply all 3 `.sh-nav-content-*` classes to `<main>`            |
| Breakpoints    | 639px (phone max), 1023px (tablet max)                         |
