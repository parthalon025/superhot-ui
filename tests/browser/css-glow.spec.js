import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Glow hierarchy", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("sh-glow-ambient applies box-shadow", async ({ page }) => {
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-ambient";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).not.toBe("none");
  });

  test("sh-glow-standard applies larger box-shadow", async ({ page }) => {
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-standard";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).not.toBe("none");
  });

  test("sh-glow-critical applies largest box-shadow", async ({ page }) => {
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-critical";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).not.toBe("none");
  });

  test("sh-glow-none removes box-shadow", async ({ page }) => {
    const shadow = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-glow-none";
      el.style.width = "100px";
      el.style.height = "100px";
      document.body.appendChild(el);
      return getComputedStyle(el).boxShadow;
    });
    expect(shadow).toBe("none");
  });
});
