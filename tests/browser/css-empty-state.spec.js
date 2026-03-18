import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Empty state", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("sh-empty-state centers content", async ({ page }) => {
    const styles = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-empty-state";
      el.textContent = "STANDBY";
      document.body.appendChild(el);
      const cs = getComputedStyle(el);
      return {
        display: cs.display,
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
        textTransform: cs.textTransform,
      };
    });
    expect(styles.display).toBe("flex");
    expect(styles.alignItems).toBe("center");
    expect(styles.justifyContent).toBe("center");
    expect(styles.textTransform).toBe("uppercase");
  });

  test("sh-empty-state has minimum height", async ({ page }) => {
    const minH = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-empty-state";
      document.body.appendChild(el);
      return getComputedStyle(el).minHeight;
    });
    expect(parseInt(minH)).toBeGreaterThanOrEqual(200);
  });

  test("sh-empty-state__mantra uses headline sizing", async ({ page }) => {
    const fontSize = await page.evaluate(() => {
      const wrapper = document.createElement("div");
      wrapper.className = "sh-empty-state";
      const mantra = document.createElement("div");
      mantra.className = "sh-empty-state__mantra";
      mantra.textContent = "STANDBY";
      wrapper.appendChild(mantra);
      document.body.appendChild(wrapper);
      return getComputedStyle(mantra).fontSize;
    });
    expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(18);
  });

  test("sh-empty-state__hint uses micro sizing", async ({ page }) => {
    const fontSize = await page.evaluate(() => {
      const wrapper = document.createElement("div");
      wrapper.className = "sh-empty-state";
      const hint = document.createElement("div");
      hint.className = "sh-empty-state__hint";
      hint.textContent = "Ctrl+K";
      wrapper.appendChild(hint);
      document.body.appendChild(wrapper);
      return getComputedStyle(hint).fontSize;
    });
    expect(parseFloat(fontSize)).toBeLessThan(14);
  });
});
