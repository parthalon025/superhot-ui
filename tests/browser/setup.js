import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssDir = resolve(__dirname, "../../css");
const tokensCss = readFileSync(resolve(cssDir, "tokens.css"), "utf8");
const semanticCss = readFileSync(resolve(cssDir, "semantic.css"), "utf8");
const distCss = readFileSync(resolve(__dirname, "../../dist/superhot.css"), "utf8");

// Extract @import paths from dist CSS (relative to css/) and read each file
const importRegex = /@import\s+["']([^"']+)["'][^;]*;/g;
const componentStyles = [];
let m;
while ((m = importRegex.exec(distCss)) !== null) {
  const importPath = m[1];
  // Skip tokens.css and semantic.css — already loaded separately
  if (importPath === "./tokens.css" || importPath === "./semantic.css") continue;
  try {
    componentStyles.push(readFileSync(resolve(cssDir, importPath), "utf8"));
  } catch {
    // Component file not found — skip silently
  }
}

const effectsCss = distCss.replace(/@import\s+["'][^"']+["'][^;]*;\s*/g, "");

export async function setup(page) {
  const componentTags = componentStyles.map((css) => `    <style>${css}</style>`).join("\n");
  await page.setContent(`<!DOCTYPE html>
<html>
  <head>
    <style>${tokensCss}</style>
    <style>${semanticCss}</style>
    <style>${effectsCss}</style>
${componentTags}
  </head>
  <body></body>
</html>`);
}
