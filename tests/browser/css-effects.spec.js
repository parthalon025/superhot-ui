import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

test.describe("Effect CSS — threat-pulse, mantra, shatter, tokens", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("threat-pulse — border applied", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.setAttribute("data-sh-effect", "threat-pulse");
      el.id = "el";
      document.body.appendChild(el);
    });
    const border = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("el"));
      return { borderStyle: cs.borderTopStyle, borderWidth: cs.borderTopWidth };
    });
    expect(border.borderStyle).toBe("solid");
    expect(border.borderWidth).toBe("2px");
  });

  test("mantra — contain layout style applied", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.setAttribute("data-sh-mantra", "SUPERHOT");
      el.id = "el";
      document.body.appendChild(el);
    });
    const contain = await page.evaluate(
      () => getComputedStyle(document.getElementById("el")).contain,
    );
    expect(contain).toContain("layout");
    expect(contain).toContain("style");
  });

  test("mantra — ::before pseudo-element has content with mantra text", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.setAttribute("data-sh-mantra", "SUPERHOT");
      el.id = "el";
      document.body.appendChild(el);
    });
    const content = await page.evaluate(
      () => getComputedStyle(document.getElementById("el"), "::before").content,
    );
    expect(content).toContain("SUPERHOT");
  });

  test("--sh-threat token resolves to non-transparent color", async ({ page }) => {
    const color = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--sh-threat").trim(),
    );
    expect(color.length).toBeGreaterThan(0);
    expect(color).not.toBe("transparent");
  });

  test("--sh-phosphor token is defined (cyan CRT glow)", async ({ page }) => {
    const color = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--sh-phosphor").trim(),
    );
    expect(color.length).toBeGreaterThan(0);
    expect(color).not.toBe("transparent");
  });

  test("--sh-font token is defined (piOS terminal stack)", async ({ page }) => {
    const font = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--sh-font").trim(),
    );
    expect(font).toContain("monospace");
  });

  test("sh-fragment — animation and position set", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "sh-fragment";
      el.id = "el";
      document.body.appendChild(el);
    });
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("el"));
      return {
        position: cs.position,
        pointerEvents: cs.pointerEvents,
        animationName: cs.animationName,
      };
    });
    expect(styles.position).toBe("absolute");
    expect(styles.pointerEvents).toBe("none");
    expect(styles.animationName).toBe("sh-shatter-fragment");
  });
});
