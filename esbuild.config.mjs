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
      "export { applyFreshness } from './js/freshness.js';",
      "export { shatterElement } from './js/shatter.js';",
      "export { glitchText } from './js/glitch.js';",
      "export { applyMantra, removeMantra } from './js/mantra.js';",
      "export { ShAudio, playSfx } from './js/audio.js';",
      "export { setCrtMode } from './js/crt.js';",
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
      "export { ShErrorState } from './preact/ShErrorState.jsx';",
      "export { ShStatsGrid } from './preact/ShStatsGrid.jsx';",
      "export { ShDataTable } from './preact/ShDataTable.jsx';",
      "export { ShNav } from './preact/ShNav.jsx';",
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
