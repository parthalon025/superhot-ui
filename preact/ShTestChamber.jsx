import { useEffect, useRef } from "preact/hooks";
import { playSfx } from "../js/audio.js";

const VALID_DIRECTIONS = ["bottom", "left", "right"];

/**
 * ShTestChamber — Panel assembly container.
 *
 * Children with class "sh-panel" animate in with staggered slide.
 * Like Portal's test chamber panels assembling around the player.
 *
 * Signal: content assembly, layout materialization
 * Emotional loop: anticipation → reveal
 *
 * @param {object} props
 * @param {number} [props.chamber] - Optional chamber number badge
 * @param {'bottom'|'left'|'right'} [props.direction='bottom'] - Panel slide direction
 * @param {boolean} [props.compromised=false] - Compromised state (panels shift apart)
 * @param {string} [props.class]
 * @param {import('preact').ComponentChildren} props.children
 */
export function ShTestChamber({
  chamber,
  direction = "bottom",
  compromised = false,
  class: className,
  children,
  ...rest
}) {
  // Validate direction against allowlist (security)
  const safeDirection = VALID_DIRECTIONS.includes(direction) ? direction : "bottom";

  const dirClass = safeDirection !== "bottom" ? `sh-test-chamber--from-${safeDirection}` : "";
  const compClass = compromised ? "sh-test-chamber--compromised" : "";
  const cls = ["sh-test-chamber", dirClass, compClass, className].filter(Boolean).join(" ");

  // Play panel-slide SFX on mount (once)
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      playSfx("panel-slide");
    }
  }, []);

  return (
    <div class={cls} {...rest}>
      {chamber != null && (
        <span class="sh-test-chamber-number">CHAMBER {String(chamber).padStart(2, "0")}</span>
      )}
      {children}
    </div>
  );
}
