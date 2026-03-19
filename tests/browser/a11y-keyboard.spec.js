import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Keyboard accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test(":focus-visible has non-transparent outline", async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.createElement("button");
      btn.textContent = "Test";
      btn.id = "btn";
      document.body.appendChild(btn);
    });
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.getElementById("btn");
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, width: cs.outlineWidth };
    });
    expect(outline.style).toBe("solid");
    expect(outline.width).toBe("2px");
  });

  test("::selection styles are defined", async ({ page }) => {
    const hasSelection = await page.evaluate(() => {
      const sheets = [...document.styleSheets];
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes("::selection")) return true;
          }
        } catch (e) {
          /* cross-origin */
        }
      }
      return false;
    });
    expect(hasSelection).toBe(true);
  });
});
