import { EscalationTimer } from "./escalation.js";
import { applyMantra, removeMantra } from "./mantra.js";
import { playSfx, setTensionDrone, stopTensionDrone } from "./audio.js";

/**
 * Orchestrate escalation across multiple dashboard surfaces.
 * Coordinates EscalationTimer with visual effects on component, sidebar, section, and layout levels.
 *
 * @param {object} config
 * @param {object} config.surfaces — DOM elements for each escalation level
 * @param {Element[]} [config.surfaces.component] — Level 1: threat-pulse these
 * @param {Element[]} [config.surfaces.sidebar] — Level 2: pulse sidebar indicators
 * @param {Element} [config.surfaces.section] — Level 3: mantra on section
 * @param {Element} [config.surfaces.layout] — Level 4: mantra on layout root
 * @param {string} [config.sectionMantra="DEGRADED"] — Mantra text for level 3
 * @param {string} [config.layoutMantra="SYSTEM CRITICAL"] — Mantra text for level 4
 * @param {boolean} [config.sounds=true] — Play SFX at transitions
 * @param {boolean} [config.dimOthers=false] — Dim non-critical elements at level 2+
 * @param {Element} [config.dimContainer] — Container whose children get dimmed
 * @param {number[]} [config.thresholds] — Custom escalation timing
 * @returns {{ start(): void, stop(): void, reset(): void, timer: EscalationTimer }}
 */
export function orchestrateEscalation(config) {
  const {
    surfaces = {},
    sectionMantra = "DEGRADED",
    layoutMantra = "SYSTEM CRITICAL",
    sounds = true,
    dimOthers = false,
    dimContainer,
    thresholds,
  } = config;

  const timer = new EscalationTimer({
    thresholds,
    onEscalate: (level, name) => {
      if (sounds) {
        setTensionDrone(level);
        playSfx(level >= 3 ? "error" : "warning");
      }

      // Level 1: threat-pulse on affected components
      if (level >= 1 && surfaces.component) {
        for (const el of surfaces.component) {
          el.setAttribute("data-sh-effect", "threat-pulse");
        }
      }

      // Level 2: pulse sidebar + dim others
      if (level >= 2 && surfaces.sidebar) {
        for (const el of surfaces.sidebar) {
          el.setAttribute("data-sh-effect", "threat-pulse");
        }
        if (dimOthers && dimContainer) {
          for (const child of dimContainer.children) {
            if (!surfaces.component?.includes(child)) {
              child.style.opacity = "0.3";
              child.style.transition = "opacity 1s ease";
            }
          }
        }
      }

      // Level 3: mantra on section
      if (level >= 3 && surfaces.section) {
        applyMantra(surfaces.section, sectionMantra);
        surfaces.section.setAttribute("data-sh-escalation", String(level));
      }

      // Level 4: mantra on layout
      if (level >= 4 && surfaces.layout) {
        applyMantra(surfaces.layout, layoutMantra);
        surfaces.layout.setAttribute("data-sh-escalation", "4");
      }
    },
    onReset: () => {
      // Stop tension drone
      if (sounds) stopTensionDrone();
      // Clear all effects
      if (surfaces.component) {
        for (const el of surfaces.component) {
          el.removeAttribute("data-sh-effect");
        }
      }
      if (surfaces.sidebar) {
        for (const el of surfaces.sidebar) {
          el.removeAttribute("data-sh-effect");
        }
      }
      if (surfaces.section) {
        removeMantra(surfaces.section);
        surfaces.section.removeAttribute("data-sh-escalation");
      }
      if (surfaces.layout) {
        removeMantra(surfaces.layout);
        surfaces.layout.removeAttribute("data-sh-escalation");
      }
      if (dimOthers && dimContainer) {
        for (const child of dimContainer.children) {
          child.style.opacity = "";
          child.style.transition = "";
        }
      }
      if (sounds) playSfx("recovery");
    },
  });

  return {
    start: () => timer.start(),
    stop: () => timer.stop(),
    reset: () => timer.reset(),
    timer,
  };
}
