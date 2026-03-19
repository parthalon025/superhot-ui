# Recipe: Data Table with State

Build a data table backed by a polling API with sorting, search, status badges in cells, freshness wrapping, sort persistence, and toast feedback on row actions. Copy-paste, wire your endpoint, ship.

---

## What you get

- `ShDataTable` with column definitions and row data
- Status badges inside table cells
- Search filtering (case-insensitive, all columns)
- Empty state ("NO RESULTS")
- `ShFrozen` wrapper for data freshness
- Sort column + direction persisted to localStorage
- `ShToast` for row action feedback
- Full polling hook

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
import { ShDataTable, ShFrozen, ShStatusBadge, ShToast } from "superhot-ui/preact";

import { signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
```

---

## 3. Column definitions

Each column needs `key` (maps to row object property), `label` (header text), and optional `sortable`.

```js
const COLUMNS = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "NAME", sortable: true },
  { key: "status", label: "STATUS" },
  { key: "duration", label: "DURATION", sortable: true },
  { key: "model", label: "MODEL", sortable: true },
];
```

---

## 4. Polling hook

Fetch rows from your API on an interval. Store the timestamp so `ShFrozen` can track freshness.

```js
const rows = signal([]);
const lastUpdated = signal(Date.now());

async function fetchRows() {
  try {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    rows.value = data.jobs;
    lastUpdated.value = Date.now();
  } catch (err) {
    console.error("FETCH FAILED:", err);
  }
}

function usePolling(intervalMs = 10_000) {
  useEffect(() => {
    fetchRows();
    const id = setInterval(fetchRows, intervalMs);
    return () => clearInterval(id);
  }, []);
}
```

---

## 5. Status badges in cells

`ShDataTable` renders raw cell values as text. To render a `ShStatusBadge` inside a cell, map the status string to a badge before passing rows.

The approach: transform your row data so the `status` field contains JSX instead of a plain string.

```js
function mapStatusBadge(status) {
  const STATUS_MAP = {
    complete: { status: "healthy", label: "complete" },
    running: { status: "active", label: "running" },
    failed: { status: "error", label: "failed" },
    queued: { status: "waiting", label: "queued" },
    warning: { status: "warning", label: "warning" },
  };

  const cfg = STATUS_MAP[status] ?? { status: "waiting", label: status };
  return <ShStatusBadge status={cfg.status} label={cfg.label} />;
}

function enrichRows(rawRows) {
  return rawRows.map((row) => ({
    ...row,
    status: mapStatusBadge(row.status),
  }));
}
```

---

## 6. Sort persistence

Save the active sort column and direction to localStorage. Restore on load.

```js
function loadSortPrefs() {
  try {
    const saved = localStorage.getItem("table-sort");
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return null;
}

function saveSortPrefs(key, direction) {
  localStorage.setItem("table-sort", JSON.stringify({ key, direction }));
}
```

`ShDataTable` handles sorting internally. To persist it, you have two options:

**Option A -- Controlled sort (recommended for persistence):** Pre-sort rows before passing them to `ShDataTable`, and store the sort state yourself.

```js
const sortKey = signal(loadSortPrefs()?.key ?? "id");
const sortDir = signal(loadSortPrefs()?.direction ?? "asc");

function sortRows(rowData) {
  const key = sortKey.value;
  const dir = sortDir.value;
  return [...rowData].sort((a, b) => {
    const cmp = String(a[key]).localeCompare(String(b[key]), undefined, {
      numeric: true,
    });
    return dir === "asc" ? cmp : -cmp;
  });
}
```

**Option B -- Let ShDataTable sort internally.** Sorting resets on re-render since `ShDataTable` is stateless from the parent's perspective. For most dashboards, Option A gives a better experience.

---

## 7. Toast feedback on row actions

Wire toast notifications for row-level actions (retry, cancel, acknowledge).

```js
const toasts = signal([]);

function addToast(type, message, duration = 3000) {
  const id = Date.now();
  toasts.value = [...toasts.value, { id, type, message, duration }];
}

async function retryJob(jobId) {
  try {
    await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" });
    addToast("info", `[JOB ${jobId}] RETRY QUEUED`);
    fetchRows();
  } catch (_) {
    addToast("error", `[JOB ${jobId}] RETRY FAILED`);
  }
}

async function cancelJob(jobId) {
  try {
    await fetch(`/api/jobs/${jobId}/cancel`, { method: "POST" });
    addToast("info", `[JOB ${jobId}] CANCELLED`);
    fetchRows();
  } catch (_) {
    addToast("error", `[JOB ${jobId}] CANCEL FAILED`);
  }
}
```

---

## 8. Full component

```jsx
function JobTable() {
  usePolling(10_000);

  const displayRows = enrichRows(sortRows(rows.value));

  return (
    <div>
      {/* Freshness wrapper -- visually degrades when data is stale */}
      <ShFrozen timestamp={lastUpdated}>
        <ShDataTable label="JOB HISTORY" columns={COLUMNS} rows={displayRows} searchable />
      </ShFrozen>

      {/* Toast stack */}
      {toasts.value.map((toast) => (
        <ShToast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onDismiss={() => (toasts.value = toasts.value.filter((t) => t.id !== toast.id))}
        />
      ))}
    </div>
  );
}
```

---

## 9. Adding row actions

To add clickable actions per row (retry, cancel), include an `actions` column that renders buttons:

```js
const COLUMNS_WITH_ACTIONS = [...COLUMNS, { key: "actions", label: "" }];

function enrichRowsWithActions(rawRows) {
  return rawRows.map((row) => ({
    ...row,
    status: mapStatusBadge(row.status),
    actions:
      row.status === "failed" ? (
        <button class="sh-clickable sh-label" onClick={() => retryJob(row.id)}>
          RETRY
        </button>
      ) : row.status === "running" ? (
        <button class="sh-clickable sh-label" onClick={() => cancelJob(row.id)}>
          CANCEL
        </button>
      ) : null,
  }));
}
```

Swap `enrichRows` for `enrichRowsWithActions` in the component, and use `COLUMNS_WITH_ACTIONS` instead of `COLUMNS`.

---

## 10. Empty state

`ShDataTable` handles this automatically. When search filtering produces zero matching rows, it renders a "NO RESULTS" placeholder spanning all columns. No extra code needed.

If you want to customize the empty state when there are no rows at all (before any search), check the signal:

```jsx
{
  rows.value.length === 0 ? (
    <div class="sh-frame" data-label="JOB HISTORY" style="padding: 24px; text-align: center">
      <span class="sh-label sh-opacity-secondary">NO DATA -- WAITING FOR FIRST POLL</span>
    </div>
  ) : (
    <ShFrozen timestamp={lastUpdated}>
      <ShDataTable label="JOB HISTORY" columns={COLUMNS} rows={displayRows} searchable />
    </ShFrozen>
  );
}
```

---

## API shape assumed

The examples assume `/api/jobs` returns:

```json
{
  "jobs": [
    {
      "id": 1,
      "name": "embedding-batch-42",
      "status": "complete",
      "duration": "4.2s",
      "model": "qwen3.5:9b"
    },
    {
      "id": 2,
      "name": "summarize-report",
      "status": "running",
      "duration": "--",
      "model": "llama3:8b"
    },
    {
      "id": 3,
      "name": "classify-intent",
      "status": "failed",
      "duration": "12.1s",
      "model": "qwen2.5-coder:14b"
    }
  ]
}
```

Adapt `COLUMNS` keys to match your data shape. The `status` field is the only one with special rendering (badge mapping). Everything else renders as text.

---

## Recap

| Concern            | How                                                               |
| ------------------ | ----------------------------------------------------------------- |
| Column definitions | `{ key, label, sortable }` array                                  |
| Row data           | Signal updated by polling                                         |
| Status in cells    | `mapStatusBadge()` transforms string to `ShStatusBadge` JSX       |
| Search             | `searchable` prop (built-in, case-insensitive, all columns)       |
| Empty state        | Automatic "NO RESULTS" on search; custom pre-data check if needed |
| Freshness          | `ShFrozen` wrapping the table, `timestamp` signal from poll       |
| Sort persistence   | Pre-sort rows + localStorage for key/direction                    |
| Row actions        | Extra column with button JSX, wired to API + toast                |
| Toast feedback     | `ShToast` stack driven by signal array                            |
