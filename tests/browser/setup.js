import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensCss = readFileSync(resolve(__dirname, "../../css/tokens.css"), "utf8");
const semanticCss = readFileSync(resolve(__dirname, "../../css/semantic.css"), "utf8");
const effectsCss = readFileSync(resolve(__dirname, "../../dist/superhot.css"), "utf8").replace(
  /@import\s+["'][^"']+["'];?\s*/g,
  "",
);

export async function setup(page) {
  await page.setContent(`<!DOCTYPE html>
<html>
  <head>
    <style>${tokensCss}</style>
    <style>${semanticCss}</style>
    <style>${effectsCss}</style>
  </head>
  <body></body>
</html>`);
}
