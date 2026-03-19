import { useState, useEffect, useRef } from "preact/hooks";
import { glitchText } from "../js/glitch.js";

/**
 * ShCommandPalette — terminal command line / piOS input mode.
 *
 * Signal: command mode active
 * Emotional loop: plan
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {Array<{id: string, label: string, description?: string, action?: Function}>} [props.items=[]]
 * @param {Function} [props.onSelect] - Called with the selected item object
 * @param {Function} [props.onClose]
 * @param {string} [props.placeholder='Type a command...']
 * @param {string} [props.class]
 */
export function ShCommandPalette({
  open,
  items = [],
  onSelect,
  onClose,
  placeholder = "Type a command...",
  class: className,
  ...rest
}) {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  // Filter items by query
  const filtered = items.filter((item) => {
    const haystack = `${item.label} ${item.description ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  // Reset query and index when palette opens; trigger glitch on overlay
  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlightedIndex(0);
      // Auto-focus input after render
      requestAnimationFrame(() => {
        if (inputRef.current) inputRef.current.focus();
        if (overlayRef.current)
          glitchText(overlayRef.current, { duration: 100, intensity: "medium" });
      });
    }
  }, [open]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(evt) {
      switch (evt.key) {
        case "ArrowDown":
          evt.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          evt.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          evt.preventDefault();
          if (filtered[highlightedIndex] && onSelect) {
            onSelect(filtered[highlightedIndex]);
          }
          break;
        case "Escape":
          evt.preventDefault();
          if (onClose) onClose();
          break;
        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, highlightedIndex, onSelect, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      class={["sh-command-palette-overlay", className].filter(Boolean).join(" ")}
      onClick={(evt) => {
        // Click outside panel closes palette
        if (evt.target === overlayRef.current && onClose) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      {...rest}
    >
      <div class="sh-command-palette-panel">
        <input
          ref={inputRef}
          class="sh-command-palette-input"
          type="text"
          value={query}
          onInput={(evt) => setQuery(evt.currentTarget.value)}
          placeholder={placeholder}
          aria-label="Search commands"
          aria-controls="sh-command-palette-list"
          aria-activedescendant={
            filtered[highlightedIndex] ? `sh-cp-item-${filtered[highlightedIndex].id}` : undefined
          }
          autocomplete="off"
          spellcheck={false}
        />
        {filtered.length === 0 ? (
          <div class="sh-command-palette-empty">NO MATCH</div>
        ) : (
          <ul id="sh-command-palette-list" class="sh-command-palette-list" role="listbox">
            {filtered.map((item, idx) => (
              <li
                key={item.id}
                id={`sh-cp-item-${item.id}`}
                class={[
                  "sh-command-palette-item",
                  idx === highlightedIndex ? "sh-command-palette-item--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="option"
                aria-selected={idx === highlightedIndex}
                onClick={() => {
                  if (onSelect) onSelect(item);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <span class="sh-command-palette-item-label">{item.label}</span>
                {item.description && (
                  <span class="sh-command-palette-item-desc">{item.description}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
