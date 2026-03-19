/**
 * Recovery sequence choreography — atmosphere-guide.md Rule 37.
 * 5-step recovery: glitch burst → border transition → pulse stop → toast → calm.
 *
 * @param {object} opts
 * @param {Function} opts.glitchFn - Step 1: fire glitch burst on recovering element
 * @param {Function} opts.onBorderTransition - Step 2: transition border threat→phosphor
 * @param {Function} opts.onPulseStop - Step 3: stop threat pulse
 * @param {Function} opts.onToast - Step 4: show RESTORED toast
 * @param {object} [opts.delays]
 * @param {number} [opts.delays.afterGlitch=200] - ms after glitch before border
 * @param {number} [opts.delays.afterBorder=300] - ms after border before pulse stop
 * @param {number} [opts.delays.afterPulse=200] - ms after pulse stop before toast
 * @returns {Promise<void>}
 */
export async function recoverySequence(opts) {
  const { glitchFn, onBorderTransition, onPulseStop, onToast, delays = {} } = opts;
  const { afterGlitch = 200, afterBorder = 300, afterPulse = 200 } = delays;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  glitchFn();
  await wait(afterGlitch);

  onBorderTransition();
  await wait(afterBorder);

  onPulseStop();
  await wait(afterPulse);

  onToast();
}
