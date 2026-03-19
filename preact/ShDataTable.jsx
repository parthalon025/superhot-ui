/**
 * ShDataTable — searchable, sortable data table.
 */
import { useState } from "preact/hooks";

export function ShDataTable({ columns = [], rows = [], searchable = true, label }) {
  let query, setQuery, sortKey, setSortKey, sortDir, setSortDir;
  try {
    [query, setQuery] = useState("");
    [sortKey, setSortKey] = useState(null);
    [sortDir, setSortDir] = useState("asc");
  } catch {
    query = "";
    setQuery = () => {};
    sortKey = null;
    setSortKey = () => {};
    sortDir = "asc";
    setSortDir = () => {};
  }

  // Inline filtering (no useMemo — not safe outside render context)
  let filtered = rows;
  if (query && query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter((row) =>
      columns.some((col) =>
        String(row[col.key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }
  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div class="sh-frame sh-data-table" data-label={label || undefined}>
      {searchable && (
        <input
          type="search"
          class="sh-data-table-search"
          placeholder="SEARCH..."
          value={query}
          onInput={(e) => setQuery(e.target.value)}
          aria-label="Search table"
        />
      )}
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  data-sortable={col.sortable ? "true" : "false"}
                  data-sort-active={sortKey === col.key ? "true" : "false"}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === "asc" ? " [ASC]" : " [DESC]") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colspan={columns.length} class="sh-data-table-empty">
                  NO RESULTS
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} title={String(row[col.key] ?? "")}>
                      {row[col.key] ?? "\u2014"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default ShDataTable;
