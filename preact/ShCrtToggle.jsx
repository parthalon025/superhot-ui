/**
 * ShCrtToggle — CRT display intensity controls.
 *
 * Signal: display intensity setting
 * Diegetic metaphor: CRT monitor hardware controls
 * Stateless: consuming project handles localStorage persistence.
 *
 * @param {object} props
 * @param {boolean} [props.stripe=false]
 * @param {boolean} [props.scanline=false]
 * @param {boolean} [props.flicker=false]
 * @param {Function} [props.onChange] - Called with full prefs object {stripe, scanline, flicker}
 * @param {string} [props.class]
 */
export function ShCrtToggle({
  stripe = false,
  scanline = false,
  flicker = false,
  onChange,
  class: className,
  ...rest
}) {
  function emit(patch) {
    if (onChange) {
      onChange({ stripe, scanline, flicker, ...patch });
    }
  }

  return (
    <div
      class={["sh-crt-toggle", className].filter(Boolean).join(" ")}
      {...rest}
    >
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
        <span class="sh-crt-toggle-warning">⚠ photosensitivity risk</span>
      </div>
    </div>
  );
}
