# ShErrorState

**Signal:** operation failed, system offers recovery
**Emotional loop:** breach -> recovery (acknowledge failure, offer retry)
**Diegetic metaphor:** terminal error dump with optional retry command
**Palette:** `--status-error` for the error indicator

## Props

| Prop      | Type     | Default   | Description                                         |
| --------- | -------- | --------- | --------------------------------------------------- |
| `title`   | string   | `"Error"` | Error heading text                                  |
| `message` | string   | --        | Descriptive error message                           |
| `onRetry` | Function | --        | Callback for retry button; button hidden if omitted |

## Usage

```jsx
import { ShErrorState } from 'superhot-ui/preact';

<ShErrorState title="CONNECTION LOST" message="Failed to reach the API server." onRetry={() => refetch()} />

<ShErrorState message="Unknown error occurred." />

<ShErrorState title="TIMEOUT" message="Request exceeded 30s limit." />
```

## CSS tokens/classes consumed

- `.sh-frame` -- outer container (inherits frame styling: `--bg-surface`, `--radius`, `--card-shadow`)
- `--status-error` -- error indicator color (the X glyph)
- `--font-mono` -- monospace typography for title, message, and button
- `--type-label` -- font size for message and retry button
- `--text-secondary` -- message and button text color
- `--bg-surface-raised` -- retry button background
- `--border-subtle` -- retry button border
- `--radius` -- retry button border-radius

## Accessibility

- Container has `role="alert"` -- announces error to screen readers immediately
- `aria-live="assertive"` -- ensures the error is announced even if the component mounts after page load
- Retry button is a native `<button>` with `type="button"` -- keyboard-accessible

## Gotchas

- All styles are inline (not class-based) except the outer `.sh-frame` -- overriding requires `!important` or wrapper styles
- The error icon is a literal Unicode character (`✕`), not an SVG -- renders consistently across fonts

## Related components

- **ShToast** -- for transient error notifications (auto-dismiss)
- **ShStatusBadge** -- for inline error indicators alongside other content
- **ShCollapsible** -- wrap an error state inside a collapsible for optional detail expansion
