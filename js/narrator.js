/**
 * narrate — personality-driven phrase selection for UI text.
 *
 * Returns a context-appropriate phrase from the narrator corpus,
 * avoiding repeats and supporting template interpolation.
 *
 * Usage:
 *   import { narrate, ShNarrator } from 'superhot-ui';
 *   ShNarrator.personality = 'glados';
 *   const msg = narrate('error');             // random GLaDOS error phrase
 *   const msg = narrate('error', { errorCount: 5 }); // with context
 *
 * @module narrator
 */

import { corpus } from "./narrator-corpus.js";

/**
 * Narrator configuration. Set personality before calling narrate().
 * @type {{ personality: import('./narrator-corpus.js').Personality }}
 */
export const ShNarrator = { personality: "glados" };

/** @type {Map<string, number>} Track last-used index per personality+category */
const _history = new Map();

/**
 * Get a personality-driven phrase for a UI context.
 *
 * @param {import('./narrator-corpus.js').Category} category
 * @param {object} [context={}] - Template variables (errorCount, label, value, action, remaining, etc.)
 * @returns {string} A phrase string, or empty string if category not found.
 */
export function narrate(category, context = {}) {
  const phrases = corpus[ShNarrator.personality]?.[category];
  if (!phrases || phrases.length === 0) return "";

  const key = `${ShNarrator.personality}:${category}`;
  const lastIndex = _history.get(key) ?? -1;

  // Pick a random index, avoiding the last-used one
  let index;
  if (phrases.length === 1) {
    index = 0;
  } else {
    do {
      index = Math.floor(Math.random() * phrases.length);
    } while (index === lastIndex);
  }

  _history.set(key, index);

  const phrase = phrases[index];
  return typeof phrase === "function" ? phrase(context) : phrase;
}
