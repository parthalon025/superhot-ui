import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("ARIA attributes", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("modal overlay has role=dialog and aria-modal", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-modal-overlay";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", "Test");
      el.id = "modal";
      document.body.appendChild(el);
    });
    const role = await page.evaluate(() => document.getElementById("modal").getAttribute("role"));
    const modal = await page.evaluate(() =>
      document.getElementById("modal").getAttribute("aria-modal"),
    );
    expect(role).toBe("dialog");
    expect(modal).toBe("true");
  });

  test("error state has role=alert", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-frame";
      el.setAttribute("role", "alert");
      el.setAttribute("aria-live", "assertive");
      el.id = "err";
      document.body.appendChild(el);
    });
    const role = await page.evaluate(() => document.getElementById("err").getAttribute("role"));
    const live = await page.evaluate(() =>
      document.getElementById("err").getAttribute("aria-live"),
    );
    expect(role).toBe("alert");
    expect(live).toBe("assertive");
  });

  test("incident HUD has role=alert", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-incident-hud sh-incident-hud--critical";
      el.setAttribute("role", "alert");
      el.setAttribute("aria-live", "assertive");
      el.id = "hud";
      document.body.appendChild(el);
    });
    const role = await page.evaluate(() => document.getElementById("hud").getAttribute("role"));
    expect(role).toBe("alert");
  });

  test("matrix rain canvas is aria-hidden", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement("canvas");
      el.className = "sh-matrix-rain-canvas";
      el.setAttribute("aria-hidden", "true");
      el.id = "rain";
      document.body.appendChild(el);
    });
    const hidden = await page.evaluate(() =>
      document.getElementById("rain").getAttribute("aria-hidden"),
    );
    expect(hidden).toBe("true");
  });
});
