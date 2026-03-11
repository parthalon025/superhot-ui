import { test, expect } from "@playwright/test";
import { setup } from "./setup.js";

// Verifies that importing superhot-ui (via css/superhot.css) provides
// all semantic tokens downstream consumers depend on.
test.describe("Semantic token completeness", () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  async function token(page, name) {
    return page.evaluate(
      (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
      name,
    );
  }

  test("--bg-base resolves to near-black", async ({ page }) => {
    const val = await token(page, "--bg-base");
    expect(val).not.toBe("");
    expect(val).toContain("oklch");
  });

  test("--color-primary resolves (threat red)", async ({ page }) => {
    const val = await token(page, "--color-primary");
    expect(val).not.toBe("");
    expect(val).toContain("oklch");
  });

  test("--font-mono resolves (non-empty)", async ({ page }) => {
    const val = await token(page, "--font-mono");
    expect(val).not.toBe("");
  });

  test("--radius resolves to 0", async ({ page }) => {
    const val = await token(page, "--radius");
    expect(val.trim()).toBe("0");
  });

  test("--status-error resolves (non-empty)", async ({ page }) => {
    const val = await token(page, "--status-error");
    expect(val).not.toBe("");
  });

  test("--status-healthy resolves (non-empty)", async ({ page }) => {
    const val = await token(page, "--status-healthy");
    expect(val).not.toBe("");
  });

  test("--card-shadow resolves (non-empty)", async ({ page }) => {
    const val = await token(page, "--card-shadow");
    expect(val).not.toBe("");
  });

  test("--text-primary resolves (non-empty, oklch)", async ({ page }) => {
    const val = await token(page, "--text-primary");
    expect(val).not.toBe("");
    expect(val).toContain("oklch");
  });
});
