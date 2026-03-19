import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

/** Append an element with transitions disabled to bypass @starting-style entry values */
async function appendState(page, state) {
  await page.evaluate((s) => {
    const el = document.createElement("div");
    el.id = "el";
    el.style.transition = "none";
    el.setAttribute("data-sh-state", s);
    document.body.appendChild(el);
    void getComputedStyle(el).opacity; // force recalc
  }, state);
}

test.describe("Freshness state CSS effects", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("fresh state — no filter, full opacity", async ({ page }) => {
    await appendState(page, "fresh");
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("el"));
      return { filter: cs.filter, opacity: cs.opacity };
    });
    expect(styles.filter).toBe("none");
    expect(styles.opacity).toBe("1");
  });

  test("cooling state — saturate filter applied", async ({ page }) => {
    await appendState(page, "cooling");
    const filter = await page.evaluate(
      () => getComputedStyle(document.getElementById("el")).filter,
    );
    expect(filter).toContain("saturate");
  });

  test("frozen state — grayscale + opacity reduced", async ({ page }) => {
    await appendState(page, "frozen");
    // sh-freeze-snap animation (300ms forwards) with animation-composition: replace
    // settles to opacity: 0.6 from the final keyframe
    await page.waitForTimeout(400);
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("el"));
      return { filter: cs.filter, opacity: cs.opacity };
    });
    expect(styles.filter).toContain("grayscale");
    expect(parseFloat(styles.opacity)).toBeLessThan(1);
  });

  test("stale state — full grayscale + opacity < 0.6 + contain layout style", async ({ page }) => {
    await appendState(page, "stale");
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("el"));
      return { filter: cs.filter, opacity: cs.opacity, contain: cs.contain };
    });
    expect(styles.filter).toContain("grayscale");
    expect(parseFloat(styles.opacity)).toBeLessThan(0.6);
    expect(styles.contain).toContain("layout");
    expect(styles.contain).toContain("style");
  });

  test("stale state — STALE watermark via ::after pseudo-element", async ({ page }) => {
    await appendState(page, "stale");
    const content = await page.evaluate(
      () => getComputedStyle(document.getElementById("el"), "::after").content,
    );
    expect(content).toContain("STALE");
  });
});
