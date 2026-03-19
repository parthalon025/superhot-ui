/**
 * Failure escalation timer — atmosphere-guide.md Rule 12.
 * 4-stage timeline: component → sidebar → section mantra → layout mantra.
 *
 * @example
 *   const esc = new EscalationTimer({
 *     onEscalate: (level, name) => {
 *       if (name === 'section') applyMantra(sectionEl, 'BACKEND OFFLINE');
 *       if (name === 'layout') applyMantra(layoutEl, 'SYSTEM DEGRADED');
 *     }
 *   });
 *   esc.start();
 *   // on recovery:
 *   esc.reset();
 */

const LEVEL_NAMES = ["component", "sidebar", "section", "layout"];
const DEFAULT_THRESHOLDS = [5000, 10000, 45000, 60000];

export class EscalationTimer {
  /**
   * @param {object} [opts]
   * @param {Function} [opts.onEscalate] - Called with (level, levelName) on each escalation
   * @param {Function} [opts.onReset] - Called when reset to level 0
   * @param {number[]} [opts.thresholds] - ms delays between levels (length 4)
   */
  constructor(opts = {}) {
    this.onEscalate = opts.onEscalate || (() => {});
    this.onReset = opts.onReset || (() => {});
    this.thresholds = opts.thresholds || DEFAULT_THRESHOLDS;
    this.level = 0;
    this._timerId = null;
  }

  get levelName() {
    return LEVEL_NAMES[this.level] || "layout";
  }

  start() {
    this._scheduleNext();
  }

  advance() {
    if (this.level >= LEVEL_NAMES.length - 1) return;
    this.level++;
    this.onEscalate(this.level, this.levelName);
  }

  reset() {
    this.stop();
    this.level = 0;
    this.onReset();
  }

  stop() {
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
  }

  /** Pause escalation at current level. */
  pause() {
    this.stop();
  }

  /** Resume escalation from current level. */
  resume() {
    this._scheduleNext();
  }

  _scheduleNext() {
    if (this.level >= LEVEL_NAMES.length - 1) return;
    const delay = this.thresholds[this.level] || 5000;
    this._timerId = setTimeout(() => {
      this.advance();
      this._scheduleNext();
    }, delay);
  }
}
