# ShDataTable

**Signal:** structured data with interactive discovery
**Emotional loop:** investigation (search, sort, scan)
**Diegetic metaphor:** terminal query results
**Palette:** `--accent` active sort, `--text-tertiary` headers, `--text-secondary` cells

## Props

| Prop         | Type                           | Default | Description                                 |
| ------------ | ------------------------------ | ------- | ------------------------------------------- |
| `columns`    | Array<{key, label, sortable?}> | `[]`    | Column definitions                          |
| `rows`       | Array<Object>                  | `[]`    | Row data objects (keyed by `column.key`)    |
| `searchable` | boolean                        | `true`  | Show search input above table               |
| `label`      | string                         | --      | Frame header label (passed to `data-label`) |

### Column object shape

| Field      | Type    | Required | Description                         |
| ---------- | ------- | -------- | ----------------------------------- |
| `key`      | string  | yes      | Row object property to display      |
| `label`    | string  | yes      | Column header text                  |
| `sortable` | boolean | no       | Enable click-to-sort on this column |

## Usage

```jsx
import { ShDataTable } from 'superhot-ui/preact';

<ShDataTable
  label="QUEUE HISTORY"
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'model', label: 'MODEL', sortable: true },
    { key: 'status', label: 'STATUS' },
    { key: 'duration', label: 'DURATION', sortable: true },
  ]}
  rows={[
    { id: 1, model: 'qwen3.5:9b', status: 'complete', duration: '4.2s' },
    { id: 2, model: 'llama3:8b', status: 'running', duration: '—' },
  ]}
/>

// No search bar
<ShDataTable searchable={false} columns={cols} rows={rows} />
```

## CSS classes consumed

- `.sh-frame` -- outer container (inherited frame border + label system)
- `.sh-data-table` -- table wrapper (`width: 100%`)
- `.sh-data-table-search` -- search input styling
  - `--bg-inset`, `--border-primary`, `--radius`, `--font-mono`, `--type-label`
  - Focus: `--accent` border, `--accent-glow` box-shadow
- `.sh-data-table table` -- `--font-mono`, `--type-label`, `border-collapse`
- `.sh-data-table th` -- `--text-tertiary`, `--border-subtle`, uppercase
  - `[data-sortable="true"]` -- pointer cursor, hover `--text-primary`
  - `[data-sort-active="true"]` -- `--accent` text + border
- `.sh-data-table td` -- `--text-secondary`, `--border-subtle`, `text-overflow: ellipsis`, `max-width: 200px`
- `.sh-data-table tr:hover td` -- `--table-row-hover-bg`
- `.sh-data-table-empty` -- "NO RESULTS" centered placeholder

## Sorting behavior

Click a sortable column header to sort ascending. Click again to toggle descending. Sort indicator: `\u25B2` (ascending) / `\u25BC` (descending) appended to header text. Sorting uses `String.localeCompare` with `{ numeric: true }`.

## Search behavior

Case-insensitive substring match across all column values. Filters rows in real-time as the user types. Empty results show "NO RESULTS" placeholder row spanning all columns.

## Accessibility

- Search input has `aria-label="Search table"`
- Sortable headers set `aria-sort="ascending"` or `"descending"` when active
- Each `<td>` has a `title` attribute with the cell value for truncated content
- Empty state uses a full-width `<td colspan>` -- announced as a single cell

## Responsive

At `max-width: 639px`, cell padding reduces from `6px 10px` to `4px 8px`. Table has `overflow-x: auto` for horizontal scrolling on narrow screens.

## Related components

- `ShStatsGrid` -- for summary metrics (non-tabular)
- `ShStatusBadge` -- render inside table cells for status columns
- `ShHeroCard` -- pair as a KPI header above the table
