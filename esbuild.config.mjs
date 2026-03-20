import { build, context } from "esbuild";
import { copyFileSync, mkdirSync } from "fs";

const isWatch = process.argv.includes("--watch");

mkdirSync("dist", { recursive: true });

// Copy CSS (no processing needed)
copyFileSync("css/superhot.css", "dist/superhot.css");
console.log("  dist/superhot.css");

// Shared esbuild options
const shared = {
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: !isWatch,
  sourcemap: isWatch,
};

// JS utilities bundle (barrel via stdin)
const jsConfig = {
  ...shared,
  stdin: {
    contents: [
      // Core effects
      "export { applyFreshness, computeFreshness } from './js/freshness.js';",
      "export { shatterElement } from './js/shatter.js';",
      "export { glitchText } from './js/glitch.js';",
      "export { applyMantra, removeMantra } from './js/mantra.js';",
      // Audio (all SFX — original + Portal + tension drone)
      "export { ShAudio, playSfx, setTensionDrone, stopTensionDrone } from './js/audio.js';",
      // Atmosphere budget
      "export { trackEffect, isOverBudget, activeEffectCount, resetEffects, MAX_EFFECTS } from './js/atmosphere.js';",
      // CRT
      "export { setCrtMode } from './js/crt.js';",
      // Narrator + Facility
      "export { narrate, ShNarrator } from './js/narrator.js';",
      "export { corpus } from './js/narrator-corpus.js';",
      "export { setFacilityState, getFacilityState } from './js/facility.js';",
      // Threshold
      "export { computeThreshold, applyThreshold } from './js/threshold.js';",
      // Heartbeat + Freshness watcher
      "export { heartbeat } from './js/heartbeat.js';",
      "export { watchFreshness } from './js/watchFreshness.js';",
      // Escalation + Orchestration + Recovery
      "export { EscalationTimer } from './js/escalation.js';",
      "export { orchestrateEscalation } from './js/orchestrate.js';",
      "export { recoverySequence } from './js/recovery.js';",
      // Celebration + Action feedback
      "export { celebrationSequence } from './js/celebration.js';",
      "export { confirmAction } from './js/commandFeedback.js';",
      // Boot
      "export { bootSequence } from './js/boot.js';",
      // Hardware detection
      "export { detectCapability, applyCapability } from './js/hardware.js';",
      // Utilities
      "export { createToastManager } from './js/toastManager.js';",
      "export { createShortcutRegistry } from './js/shortcuts.js';",
      "export { setMonitorVariant, loadMonitorVariant } from './js/monitorTheme.js';",
      "export { scrollSpy } from './js/scrollSpy.js';",
      "export { formatTime } from './js/formatTime.js';",
    ].join("\n"),
    resolveDir: ".",
    loader: "js",
  },
  outfile: "dist/superhot.js",
};

// Preact components bundle
const preactConfig = {
  ...shared,
  stdin: {
    contents: [
      "export { ShFrozen } from './preact/ShFrozen.jsx';",
      "export { ShShatter } from './preact/ShShatter.jsx';",
      "export { ShGlitch } from './preact/ShGlitch.jsx';",
      "export { ShMantra } from './preact/ShMantra.jsx';",
      "export { ShThreatPulse } from './preact/ShThreatPulse.jsx';",
      "export { ShSkeleton } from './preact/ShSkeleton.jsx';",
      "export { ShToast } from './preact/ShToast.jsx';",
      "export { ShStatusBadge } from './preact/ShStatusBadge.jsx';",
      "export { ShCommandPalette } from './preact/ShCommandPalette.jsx';",
      "export { ShCrtToggle } from './preact/ShCrtToggle.jsx';",
      "export { ShStatCard } from './preact/ShStatCard.jsx';",
      "export { ShPageBanner } from './preact/ShPageBanner.jsx';",
      "export { ShHeroCard } from './preact/ShHeroCard.jsx';",
      "export { ShCollapsible } from './preact/ShCollapsible.jsx';",
      "export { ShEmptyState } from './preact/ShEmptyState.jsx';",
      "export { ShErrorState } from './preact/ShErrorState.jsx';",
      "export { ShStatsGrid } from './preact/ShStatsGrid.jsx';",
      "export { ShDataTable } from './preact/ShDataTable.jsx';",
      "export { ShNav } from './preact/ShNav.jsx';",
      "export { ShTimeChart } from './preact/ShTimeChart.jsx';",
      "export { ShPipeline } from './preact/ShPipeline.jsx';",
      "export { ShModal } from './preact/ShModal.jsx';",
      "export { ShMatrixRain } from './preact/ShMatrixRain.jsx';",
      "export { ShIncidentHUD } from './preact/ShIncidentHUD.jsx';",
      "export { ShAntline } from './preact/ShAntline.jsx';",
      "export { ShTestChamber } from './preact/ShTestChamber.jsx';",
      "export { ShAnnouncement } from './preact/ShAnnouncement.jsx';",
    ].join("\n"),
    resolveDir: ".",
    loader: "jsx",
  },
  outfile: "dist/superhot.preact.js",
  external: ["preact", "preact/hooks", "preact/jsx-runtime"],
  jsx: "automatic",
  jsxImportSource: "preact",
};

if (isWatch) {
  const [jsCtx, preactCtx] = await Promise.all([context(jsConfig), context(preactConfig)]);
  await Promise.all([jsCtx.watch(), preactCtx.watch()]);
  console.log("Watching for changes...");
} else {
  await Promise.all([build(jsConfig), build(preactConfig)]);
  console.log("  dist/superhot.js");
  console.log("  dist/superhot.preact.js");
  console.log("Build complete.");
}
