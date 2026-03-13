# ShCommandPalette

**Signal:** command mode active
**Emotional loop:** plan
**Diegetic metaphor:** piOS terminal command line
**Palette:** cyan border/focus, black overlay, white text

## Props

| Prop          | Type           | Default             | Description                                  |
| ------------- | -------------- | ------------------- | -------------------------------------------- |
| `open`        | boolean        | —                   | Controls visibility (required)               |
| `items`       | Item[]         | []                  | Command list (see Item schema below)         |
| `onSelect`    | function(item) | —                   | Called when item is selected (required)      |
| `onClose`     | function       | —                   | Called on Escape or overlay click (required) |
| `placeholder` | string         | 'Type a command...' | Search input placeholder                     |
| `class`       | string         | —                   | Additional CSS class                         |

### Item Schema

```ts
interface Item {
  id: string;
  label: string; // primary display text
  description?: string; // secondary text (shown below label)
  group?: string; // optional grouping header
  action: () => void; // called when item selected
}
```

## Usage

See `docs/consumer-guide.md` § Command Palette for full wiring example.

```jsx
<ShCommandPalette
  open={paletteOpen}
  items={allCommands}
  onSelect={(item) => {
    item.action();
    closePalette();
  }}
  onClose={closePalette}
  placeholder="Submit job, cancel, navigate..."
/>
```

## Behavior

- **Open:** overlay fades in with `@starting-style`; `glitchText()` fires on the trigger element
- **Search:** client-side filter on `label` + `description`, case-insensitive
- **Keyboard:** `↑↓` navigate highlighted item, `Enter` select, `Escape` close, `Tab` cycles items
- **Close:** Escape or overlay click → `onClose()`. No shatter (palette is ephemeral, not dismissed)
- **Focus:** search input auto-focused on open; focus trap within palette while open

## CSS tokens consumed

- `--z-modal` — overlay z-index
- `--bg-overlay` — backdrop
- `--bg-surface-raised` — palette panel
- `--sh-phosphor`, `--sh-phosphor-glow` — search input border + focus ring
- `--border-default`, `--border-focus`
- `--input-bg`, `--input-text`, `--input-height`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--type-body`, `--type-label`, `--type-small`
- `--space-2`, `--space-3`, `--space-4`

## Gotchas

- ShCommandPalette provides the shell only — items and key binding are the consuming project's responsibility
- `Cmd+K` / `Ctrl+K` binding must be added in the consuming project's app root
- `action` is called by `onSelect` — `onSelect` is responsible for closing the palette after calling `item.action()`
- Items are filtered in order — put highest-frequency commands first in the array
- `description` is searchable — include synonyms and aliases there
