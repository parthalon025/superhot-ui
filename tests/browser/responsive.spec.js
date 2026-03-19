import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Responsive breakpoints", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("T1 animations disabled at phone width (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-t1-scan-sweep";
      el.id = "el";
      document.body.appendChild(el);
    });
    const anim = await page.evaluate(
      () => getComputedStyle(document.getElementById("el")).animationName,
    );
    expect(anim).toBe("none");
  });

  test("T1 animations active at desktop width (1280px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-t1-scan-sweep";
      el.id = "el";
      document.body.appendChild(el);
    });
    const anim = await page.evaluate(
      () => getComputedStyle(document.getElementById("el")).animationName,
    );
    expect(anim).not.toBe("none");
  });

  test("glitch reduced to color-only at tablet width (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.setAttribute("data-sh-effect", "glitch");
      el.id = "el";
      document.body.appendChild(el);
    });
    const anim = await page.evaluate(
      () => getComputedStyle(document.getElementById("el")).animationName,
    );
    expect(anim).toBe("none");
  });

  test("CRT stripe visible at desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-crt";
      el.id = "crt";
      el.style.cssText = "width:200px;height:200px";
      document.body.appendChild(el);
    });
    const display = await page.evaluate(
      () => getComputedStyle(document.getElementById("crt"), "::before").display,
    );
    expect(display).not.toBe("none");
  });
});
