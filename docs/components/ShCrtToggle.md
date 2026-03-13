# ShCrtToggle

**Signal:** display intensity (CRT mode setting)
**Emotional loop:** n/a (settings control)
**Diegetic metaphor:** CRT monitor hardware controls

## Props

| Prop       | Type                                  | Default | Description                                   |
| ---------- | ------------------------------------- | ------- | --------------------------------------------- |
| `stripe`   | boolean                               | false   | Enable scanline stripes (`--sh-crt-stripe`)   |
| `scanline` | boolean                               | false   | Enable moving scan beam (`--sh-crt-scanline`) |
| `flicker`  | boolean                               | false   | Enable phosphor flicker (`--sh-crt-flicker`)  |
| `onChange` | function({stripe, scanline, flicker}) | —       | Called when any toggle changes                |
| `class`    | string                                | —       | Additional CSS class                          |

## Usage

```jsx
import { ShCrtToggle } from "superhot-ui/preact";
import { setCrtMode } from "superhot-ui";

<ShCrtToggle
  stripe={crtPrefs.stripe}
  scanline={crtPrefs.scanline}
  flicker={crtPrefs.flicker}
  onChange={(prefs) => {
    setCrtMode(prefs);
    localStorage.setItem("crt-prefs", JSON.stringify(prefs));
  }}
/>;
```

## JS Utility (crt.js)

```js
import { setCrtMode } from "superhot-ui";

setCrtMode({ stripe: true, scanline: false, flicker: false });
// Writes --sh-crt-stripe: block/none to document.documentElement.style
```

## CRT Effect Performance Guide

| Effect   | Visual           | Performance                     | A11y Risk                           |
| -------- | ---------------- | ------------------------------- | ----------------------------------- |
| Stripe   | Scanline grid    | Minimal (CSS background)        | None                                |
| Scanline | Moving beam      | Moderate (continuous animation) | None                                |
| Flicker  | Phosphor flicker | Low                             | HIGH — can trigger photosensitivity |

## Recommended Default

`stripe: true, scanline: false, flicker: false` — full SUPERHOT aesthetic, zero performance/a11y cost.

## Gotchas

- ShCrtToggle is stateless — consuming project manages preference persistence (localStorage)
- Flicker option must include an accessibility warning label in the UI
- `onChange` receives the full new state object, not just the changed key — replace the entire prefs object
- `setCrtMode` writes inline styles to `document.documentElement` — these override any CSS file values
