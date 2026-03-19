/**
 * ShCrtToggle — CRT display intensity controls.
 *
 * Signal: display intensity setting
 * Diegetic metaphor: CRT monitor hardware controls
 * Stateless: consuming project handles localStorage persistence and CSS application.
 *
 * Two modes:
 *
 * 1. Intensity mode (single knob, recommended):
 *    Pass `intensity` ('off'|'low'|'medium'|'high') and `onIntensityChange`.
 *    Renders four segmented buttons. onChange called with { intensity }.
 *    Internal preset mapping: off→(F,F,F), low→(T,F,F), medium→(T,T,F), high→(T,T,T).
 *
 * 2. Granular mode (three booleans):
 *    Pass `stripe`, `scanline`, `flicker` and `onChange`.
 *    Renders three checkboxes. onChange called with { stripe, scanline, flicker }.
 *
 * @param {object} props
 * @param {string}   [props.intensity]         - 'off'|'low'|'medium'|'high' — enables intensity mode
 * @param {Function} [props.onIntensityChange] - Called with { intensity } in intensity mode
 * @param {boolean}  [props.stripe=false]
 * @param {boolean}  [props.scanline=false]
 * @param {boolean}  [props.flicker=false]
 * @param {Function} [props.onChange]          - Called with { stripe, scanline, flicker } in granular mode
 * @param {string}   [props.class]
 */

const INTENSITY_LEVELS = ["off", "low", "medium", "high"];
const INTENSITY_LABELS = { off: "Off", low: "Low", medium: "Med", high: "High" };

export function ShCrtToggle({
  // Intensity mode
  intensity,
  onIntensityChange,
  // Granular mode
  stripe = false,
  scanline = false,
  flicker = false,
  onChange,
  class: className,
  ...rest
}) {
  // Intensity mode: render segmented button selector
  if (intensity !== undefined) {
    return (
      <div
        class={["sh-crt-toggle", "sh-crt-toggle--intensity", className].filter(Boolean).join(" ")}
        {...rest}
      >
        <span class="sh-crt-toggle-label">CRT Scanlines</span>
        <div class="sh-crt-toggle-segments">
          {INTENSITY_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              class={["sh-crt-segment", intensity === lvl && "sh-crt-segment--active"]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onIntensityChange && onIntensityChange({ intensity: lvl })}
            >
              {INTENSITY_LABELS[lvl]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Granular mode: three independent checkboxes
  function emit(patch) {
    if (onChange) {
      onChange({ stripe, scanline, flicker, ...patch });
    }
  }

  return (
    <div class={["sh-crt-toggle", className].filter(Boolean).join(" ")} {...rest}>
      <label class="sh-crt-toggle-row">
        <input
          type="checkbox"
          checked={stripe}
          onChange={(evt) => emit({ stripe: evt.currentTarget.checked })}
        />
        <span class="sh-crt-toggle-label">Scanline stripes</span>
      </label>

      <label class="sh-crt-toggle-row">
        <input
          type="checkbox"
          checked={scanline}
          onChange={(evt) => emit({ scanline: evt.currentTarget.checked })}
        />
        <span class="sh-crt-toggle-label">Moving scan beam</span>
      </label>

      <div>
        <label class="sh-crt-toggle-row">
          <input
            type="checkbox"
            checked={flicker}
            onChange={(evt) => emit({ flicker: evt.currentTarget.checked })}
          />
          <span class="sh-crt-toggle-label">Phosphor flicker</span>
        </label>
        <span class="sh-crt-toggle-warning">CAUTION: PHOTOSENSITIVITY RISK</span>
      </div>
    </div>
  );
}
