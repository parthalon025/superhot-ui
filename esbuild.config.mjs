import { build, context } from 'esbuild';
import { copyFileSync, mkdirSync } from 'fs';

const isWatch = process.argv.includes('--watch');

mkdirSync('dist', { recursive: true });

// Copy CSS (no processing needed)
copyFileSync('css/superhot.css', 'dist/superhot.css');
console.log('  dist/superhot.css');

// Shared esbuild options
const shared = {
  bundle: true,
  format: 'esm',
  target: 'es2020',
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
    ].join('\n'),
    resolveDir: '.',
    loader: 'js',
  },
  outfile: 'dist/superhot.js',
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
    ].join('\n'),
    resolveDir: '.',
    loader: 'jsx',
  },
  outfile: 'dist/superhot.preact.js',
  external: ['preact', 'preact/hooks'],
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
};

if (isWatch) {
  const [jsCtx, preactCtx] = await Promise.all([
    context(jsConfig),
    context(preactConfig),
  ]);
  await Promise.all([jsCtx.watch(), preactCtx.watch()]);
  console.log('Watching for changes...');
} else {
  await Promise.all([
    build(jsConfig),
    build(preactConfig),
  ]);
  console.log('  dist/superhot.js');
  console.log('  dist/superhot.preact.js');
  console.log('Build complete.');
}
