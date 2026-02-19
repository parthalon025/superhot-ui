/**
 * Shatter an element into triangular fragments that drift and fade.
 *
 * @param {Element} element - DOM element to shatter
 * @param {object} [opts]
 * @param {number} [opts.fragments=5] - Number of fragments
 * @param {Function} [opts.onComplete] - Called after animation completes
 * @returns {Function} Cancel function — removes fragments immediately
 */
export function shatterElement(element, opts = {}) {
  const { fragments: count = 5, onComplete } = opts;

  if (!element || !element.parentNode) {
    onComplete?.();
    return () => {};
  }

  const rect = element.getBoundingClientRect();
  const parent = element.parentNode;
  const parentRect = parent.getBoundingClientRect();

  const offsetX = rect.left - parentRect.left;
  const offsetY = rect.top - parentRect.top;

  const parentPos = getComputedStyle(parent).position;
  if (parentPos === 'static') {
    parent.style.position = 'relative';
  }

  element.style.visibility = 'hidden';

  const fragmentEls = [];
  const duration = getComputedStyle(element).getPropertyValue('--sh-shatter-duration')?.trim() || '600ms';
  const durationMs = parseFloat(duration) * (duration.endsWith('s') && !duration.endsWith('ms') ? 1000 : 1);

  const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  for (let i = 0; i < count; i++) {
    const frag = document.createElement('div');
    frag.className = 'sh-fragment';

    const points = Array.from({ length: 3 }, () =>
      `${Math.random() * 100}% ${Math.random() * 100}%`
    ).join(', ');
    frag.style.clipPath = `polygon(${points})`;

    frag.style.left = `${offsetX}px`;
    frag.style.top = `${offsetY}px`;
    frag.style.width = `${rect.width}px`;
    frag.style.height = `${rect.height}px`;

    const angle = (i / count) * 360 + (Math.random() * 60 - 30);
    const dist = 20 + Math.random() * 40;
    const dx = Math.cos(angle * Math.PI / 180) * dist;
    const dy = Math.sin(angle * Math.PI / 180) * dist;
    const rot = (Math.random() - 0.5) * 30;

    frag.style.setProperty('--sh-frag-x', `${dx}px`);
    frag.style.setProperty('--sh-frag-y', `${dy}px`);
    frag.style.setProperty('--sh-frag-r', `${rot}deg`);

    if (reducedMotion) {
      frag.style.animation = 'none';
      frag.style.opacity = '0';
    }

    parent.appendChild(frag);
    fragmentEls.push(frag);
  }

  const effectiveDuration = reducedMotion ? 0 : durationMs;
  const timer = setTimeout(() => {
    cleanup();
    onComplete?.();
  }, effectiveDuration + 50);

  function cleanup() {
    clearTimeout(timer);
    fragmentEls.forEach(f => f.remove());
    element.remove();
  }

  return cleanup;
}
