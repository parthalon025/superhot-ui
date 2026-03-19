/**
 * Boot sequence — progressive typewriter text reveal.
 * Signal: "system is initializing"
 *
 * @param {Element} container - Parent element to render boot lines into
 * @param {string[]} lines - Array of text lines to reveal
 * @param {object} [opts]
 * @param {number} [opts.charSpeed=30] - ms per character
 * @param {number} [opts.lineDelay=200] - ms between lines
 * @param {Function} [opts.onComplete] - Called after last line finishes
 * @returns {() => void} Cleanup function (cancels pending timers)
 */
export function bootSequence(container, lines, opts = {}) {
  const { charSpeed = 30, lineDelay = 200, onComplete } = opts;
  const timers = [];

  // Clear container safely (no innerHTML)
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  lines.forEach((text, i) => {
    const lineEl = document.createElement("span");
    lineEl.className = "sh-boot-line";
    lineEl.textContent = text;
    container.appendChild(lineEl);

    const delay = i * (lineDelay + text.length * charSpeed);
    const duration = text.length * charSpeed;

    const timerId = setTimeout(() => {
      lineEl.style.setProperty("--sh-boot-chars", String(text.length));
      lineEl.style.setProperty("--sh-boot-char-duration", `${duration}ms`);
      lineEl.classList.add("sh-boot-line--visible");

      const completeId = setTimeout(() => {
        lineEl.classList.remove("sh-boot-line--visible");
        lineEl.classList.add("sh-boot-line--complete");

        if (i === lines.length - 1) {
          lineEl.classList.add("sh-cursor-active");
          onComplete?.();
        }
      }, duration);
      timers.push(completeId);
    }, delay);
    timers.push(timerId);
  });

  if (lines.length === 0) {
    onComplete?.();
  }

  return () => {
    timers.forEach(clearTimeout);
  };
}
