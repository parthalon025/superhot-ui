import { useState, useEffect, useRef } from "preact/hooks";

/**
 * ShAnnouncement — Personality-driven narrative banner with typing effect.
 *
 * Signal: system speaks to the user (GLaDOS, Cave Johnson, etc.)
 * Emotional loop: tension, humor, personality
 *
 * @param {object} props
 * @param {string} props.message - Text to display (typed out character by character)
 * @param {'glados'|'cave'|'wheatley'|'turret'|'superhot'} [props.personality='glados']
 * @param {number} [props.typeSpeed=30] - Milliseconds per character
 * @param {boolean} [props.showCursor=true] - Show blinking cursor
 * @param {string} [props.source] - Optional source label (e.g. "ENRICHMENT CENTER")
 * @param {string} [props.class]
 */
export function ShAnnouncement({
  message,
  personality = "glados",
  typeSpeed = 30,
  showCursor = true,
  source,
  class: className,
  ...rest
}) {
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const indexRef = useRef(0);

  // Check reduced motion preference
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!message) return;

    // Reset on new message
    indexRef.current = 0;
    setDisplayed("");
    setTyping(true);

    if (reducedMotion) {
      setDisplayed(message);
      setTyping(false);
      return;
    }

    const id = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= message.length) {
        setDisplayed(message);
        setTyping(false);
        clearInterval(id);
      } else {
        setDisplayed(message.slice(0, indexRef.current));
      }
    }, typeSpeed);

    return () => clearInterval(id);
  }, [message, typeSpeed, reducedMotion]);

  const cls = ["sh-announcement", className].filter(Boolean).join(" ");

  return (
    <div
      class={cls}
      data-sh-personality={personality}
      role="status"
      aria-live="polite"
      aria-label={message}
      {...rest}
    >
      {source && <span class="sh-announcement-source">{source}</span>}
      <span aria-hidden="true">
        {displayed}
        {showCursor && typing && <span class="sh-announcement-cursor" />}
      </span>
    </div>
  );
}
