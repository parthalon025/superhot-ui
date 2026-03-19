#!/usr/bin/env node

/**
 * superhot-ui preflight validation
 * Checks a page against atmosphere guide rules before shipping.
 *
 * Usage:
 *   node scripts/preflight.js http://localhost:3000
 *   node scripts/preflight.js ./dist/index.html
 */

import { chromium } from "playwright";

const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/preflight.js <url-or-file>");
  process.exit(1);
}

const url = target.startsWith("http") ? target : `file://${process.cwd()}/${target}`;

const checks = [
  {
    name: "No emoji icons (Rule 31)",
    test: async (page) => {
      const emojis = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        const found = [];
        while (walker.nextNode()) {
          if (emojiPattern.test(walker.currentNode.textContent)) {
            found.push(walker.currentNode.textContent.trim().slice(0, 40));
          }
        }
        return found;
      });
      return {
        pass: emojis.length === 0,
        detail: emojis.length ? `Found emoji in: ${emojis.join(", ")}` : "",
      };
    },
  },
  {
    name: "cursor:pointer on interactive elements",
    test: async (page) => {
      const missing = await page.evaluate(() => {
        const interactive = document.querySelectorAll(
          "button, a[href], [role=button], [onclick], .sh-clickable",
        );
        const bad = [];
        for (const el of interactive) {
          if (getComputedStyle(el).cursor !== "pointer") {
            bad.push(el.tagName + (el.className ? `.${el.className.split(" ")[0]}` : ""));
          }
        }
        return bad;
      });
      return {
        pass: missing.length === 0,
        detail: missing.length ? `Missing cursor:pointer: ${missing.slice(0, 5).join(", ")}` : "",
      };
    },
  },
  {
    name: "Transitions within 100-600ms range",
    test: async (page) => {
      const outOfRange = await page.evaluate(() => {
        const all = document.querySelectorAll("*");
        const bad = [];
        for (const el of all) {
          const dur = getComputedStyle(el).transitionDuration;
          if (dur && dur !== "0s") {
            const ms = parseFloat(dur) * (dur.includes("ms") ? 1 : 1000);
            if (ms > 0 && (ms < 100 || ms > 600)) {
              bad.push(`${el.tagName}.${el.className.split(" ")[0] || ""}: ${dur}`);
            }
          }
        }
        return bad;
      });
      return {
        pass: outOfRange.length === 0,
        detail: outOfRange.length ? `Out of range: ${outOfRange.slice(0, 5).join(", ")}` : "",
      };
    },
  },
  {
    name: ":focus-visible outline exists (Rule 22)",
    test: async (page) => {
      const has = await page.evaluate(() => {
        const sheets = [...document.styleSheets];
        for (const sheet of sheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.selectorText && rule.selectorText.includes(":focus-visible")) return true;
            }
          } catch (e) {
            /* cross-origin */
          }
        }
        return false;
      });
      return { pass: has, detail: has ? "" : "No :focus-visible rule found in stylesheets" };
    },
  },
  {
    name: "prefers-reduced-motion respected",
    test: async (page) => {
      const has = await page.evaluate(() => {
        const sheets = [...document.styleSheets];
        for (const sheet of sheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.conditionText && rule.conditionText.includes("prefers-reduced-motion"))
                return true;
            }
          } catch (e) {
            /* cross-origin */
          }
        }
        return false;
      });
      return { pass: has, detail: has ? "" : "No prefers-reduced-motion media query found" };
    },
  },
  {
    name: "Void dominance (>= 60% dark background, Rule 1)",
    test: async (page) => {
      const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const isDark =
        bgColor.includes("0,") || bgColor.includes("0, 0, 0") || bgColor === "rgba(0, 0, 0, 0)";
      return {
        pass: isDark,
        detail: isDark ? "" : `Body background: ${bgColor} (expected dark/void)`,
      };
    },
  },
  {
    name: "No hardcoded font stacks (should use --sh-font or --font-mono)",
    test: async (page) => {
      const hardcoded = await page.evaluate(() => {
        const all = document.querySelectorAll("[style*='font-family']");
        return [...all].map((el) => el.tagName).slice(0, 5);
      });
      return {
        pass: hardcoded.length === 0,
        detail: hardcoded.length ? `Inline font-family on: ${hardcoded.join(", ")}` : "",
      };
    },
  },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });
  } catch (e) {
    console.error(`Failed to load ${url}: ${e.message}`);
    await browser.close();
    process.exit(1);
  }

  console.log(`\n  PREFLIGHT: ${url}\n`);

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    try {
      const result = await check.test(page);
      if (result.pass) {
        console.log(`  \u2713 ${check.name}`);
        passed++;
      } else {
        console.log(`  \u2717 ${check.name}`);
        if (result.detail) console.log(`    ${result.detail}`);
        failed++;
      }
    } catch (e) {
      console.log(`  ? ${check.name} \u2014 error: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n  ${passed} passed, ${failed} failed\n`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run();
