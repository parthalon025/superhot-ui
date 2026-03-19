# ShModal

**Signal:** world is paused, system demands input
**Emotional loop:** breach -> decision (interrupt for confirmation)
**Diegetic metaphor:** system interrupt dialog in piOS voice
**Palette:** `--sh-threat` (confirm action), `--sh-phosphor` (hover accents)

## Props

| Prop           | Type     | Default     | Description                                                  |
| -------------- | -------- | ----------- | ------------------------------------------------------------ |
| `open`         | boolean  | --          | Controls visibility (required)                               |
| `title`        | string   | --          | Dialog heading, uppercase imperative (required)              |
| `body`         | string   | --          | Optional body text                                           |
| `confirmLabel` | string   | `"CONFIRM"` | Confirm button text                                          |
| `cancelLabel`  | string   | `"CANCEL"`  | Cancel button text                                           |
| `onConfirm`    | Function | --          | Callback when confirm is clicked (required)                  |
| `onCancel`     | Function | --          | Callback when cancel is clicked or Escape pressed (required) |

## Usage

```jsx
import { ShModal } from 'superhot-ui/preact';

<ShModal
  open={showConfirm}
  title="CONFIRM: PURGE DLQ"
  body="This will permanently delete 47 failed messages."
  onConfirm={() => purge()}
  onCancel={() => setShowConfirm(false)}
/>

<ShModal
  open={showReset}
  title="RESET PIPELINE"
  confirmLabel="RESET"
  cancelLabel="ABORT"
  onConfirm={handleReset}
  onCancel={handleAbort}
/>
```

## CSS tokens/classes consumed

- `.sh-modal-overlay` -- full-screen overlay (`position: fixed`, `inset: 0`)
- `.sh-modal` -- dialog box container
- `.sh-modal-title` -- heading element
- `.sh-modal-body` -- body text element
- `.sh-modal-actions` -- button container (flex, right-aligned)
- `.sh-modal-action` -- base button style
- `.sh-modal-action--confirm` -- confirm button variant (threat-colored)
- `--bg-overlay` -- overlay background color
- `--z-modal` -- overlay z-index
- `--bg-surface` -- dialog background
- `--border-accent` -- dialog border
- `--radius` -- dialog and button border-radius
- `--space-6` -- dialog padding
- `--space-4` -- title margin, button gap, button horizontal padding
- `--space-2` -- button vertical padding
- `--shadow-lg` -- dialog box-shadow
- `--font-mono` -- all text
- `--type-title` -- title font size
- `--type-body` -- body font size
- `--type-label` -- button font size
- `--tracking-wide` -- title and button letter spacing
- `--text-primary` -- dialog and button text color
- `--text-secondary` -- body text color
- `--border-primary` -- default button border
- `--sh-phosphor` -- button hover border and text color
- `--sh-threat` -- confirm button border and text color
- `--sh-bright` -- confirm button hover text color (on threat background)

### Animations

- `sh-modal-fade-in` -- 150ms ease-out fade on overlay appearance

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the overlay
- `aria-label` set to the `title` prop value
- **Focus trap**: confirm button receives focus on open via `useEffect` + `ref.focus()`
- **Escape key**: closes the modal via `onCancel` (global `keydown` listener, cleaned up on close)
- **Overlay click**: clicking outside the dialog (on the overlay) triggers `onCancel`
- `prefers-reduced-motion: reduce` disables the fade-in animation
- `forced-colors: active` adjusts borders to `CanvasText`/`ButtonText` for high-contrast mode

## Gotchas

- Button labels are wrapped in square brackets (`[CONFIRM]`, `[CANCEL]`) -- account for this in layout
- When `open` is `false`, the component returns `null` -- no DOM element is rendered
- The title should follow piOS voice convention: uppercase imperative (e.g. "CONFIRM: PURGE DLQ")
- Focus is sent to the confirm button on open -- make sure `onConfirm` handles accidental Enter key

## Related components

- **ShErrorState** -- for non-blocking error display (no overlay)
- **ShToast** -- for transient notifications that don't require user action
- **ShCommandPalette** -- for command input overlays (different interaction model)
