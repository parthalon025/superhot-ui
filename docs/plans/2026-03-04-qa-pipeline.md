# superhot-ui QA Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply a comprehensive QA pipeline to superhot-ui so downstream consumers get flawless integration — testing all JS modules, all Preact components, the consumer dist interface, CSS token contract, and bundle size.

**Architecture:** Migrate from Node native test runner to Vitest (jsdom), add @testing-library/preact + axe for component tests, add consumer/token contract tests that import from built dist/, migrate husky → simple-git-hooks (consistent with upstream ui-template/expedition33-ui), add size-limit and a single ci.yml. No Playwright — this is a library, not an app.

**Tech Stack:** Vitest 3, @vitejs/plugin-preact, @testing-library/preact, jest-axe, size-limit, simple-git-hooks, lint-staged, ESLint 10, esbuild (unchanged)

---

### Task 1: Set up worktree

> Use the **superpowers:using-git-worktrees** skill. The worktree directory is `.worktrees/`. After the worktree is ready and tests pass baseline (10 tests), come back and start Task 2.

Baseline verification command:

```bash
cd ~/Documents/projects/superhot-ui
npm test
```

Expected: 10 tests pass (freshness only).

---

### Task 2: Migrate husky → simple-git-hooks + strengthen lint-staged

**Files:**

- Modify: `package.json`
- Delete: `.husky/` directory

**Context:** husky currently runs `npx lint-staged` + gitleaks + lessons-db in `.husky/pre-commit`. simple-git-hooks stores the same hook in `package.json`. The key addition: lint-staged needs to run ESLint (`--max-warnings 0`) in addition to Prettier — currently it only runs Prettier.

**Step 1: Install simple-git-hooks, remove husky**

```bash
npm install -D simple-git-hooks
npm uninstall husky
```

**Step 2: Delete .husky directory**

```bash
rm -rf .husky
```

**Step 3: Update `package.json` — scripts, simple-git-hooks, lint-staged**

Find the existing `"scripts"` block in `package.json` and replace/update these keys:

```json
"scripts": {
  "build": "node esbuild.config.mjs",
  "build:css": "cp css/superhot.css dist/superhot.css",
  "test": "vitest run",
  "test:ci": "npm run build && vitest run",
  "dev": "node esbuild.config.mjs --watch",
  "prepare": "simple-git-hooks",
  "lint": "eslint .",
  "size": "npx size-limit"
},
"simple-git-hooks": {
  "pre-commit": "npx lint-staged --allow-empty && (GITLEAKS=$(command -v gitleaks 2>/dev/null); [ -x \"$GITLEAKS\" ] && $GITLEAKS protect --staged --redact --config gitleaks.toml 2>/dev/null || true) && (LESSONS_DB=$(command -v lessons-db 2>/dev/null); [ -x \"$LESSONS_DB\" ] && $LESSONS_DB scan --target . --baseline HEAD 2>/dev/null || true)"
},
"lint-staged": {
  "*.{js,jsx,mjs}": ["eslint --max-warnings 0", "prettier --write"],
  "*.{css,json,md}": "prettier --write"
}
```

**Step 4: Install the hooks**

```bash
npx simple-git-hooks
```

Expected output: `[simple-git-hooks] Successfully set the git hook 'pre-commit'`

**Step 5: Verify hooks installed**

```bash
cat .git/hooks/pre-commit
```

Expected: contains `npx lint-staged --allow-empty`

**Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: migrate husky to simple-git-hooks, add eslint to lint-staged"
```

---

### Task 3: Install Vitest + configure

**Files:**

- Create: `vitest.config.js`
- Modify: `eslint.config.js`
- Modify: `.gitignore`
- Modify: `package.json` (lock file update only)

**Context:** Vitest needs `@vitejs/plugin-preact` to transform `.jsx` files in tests. The environment is `jsdom` (needed for shatter.js and Preact component tests). `globals: true` injects `describe`, `it`, `expect`, etc. without imports. The ESLint config needs to cover `.jsx` test files (currently only covers `.js`).

**Step 1: Install test and size dependencies**

```bash
npm install -D vitest @vitejs/plugin-preact @testing-library/preact jsdom jest-axe size-limit @size-limit/preset-small-lib
```

**Step 2: Create `vitest.config.js`**

```js
import { defineConfig } from "vitest/config";
import preact from "@vitejs/plugin-preact";
import path from "path";

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.{js,jsx}"],
    exclude: ["node_modules/", "dist/"],
    testTimeout: 10000,
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
});
```

**Step 3: Update `eslint.config.js`**

The current config covers `js/**/*.js` and `preact/**/*.js` — missing `.jsx` files and test files. Replace the entire `eslint.config.js`:

```js
import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

/**
 * ESLint config for superhot-ui (vanilla JS browser library + esbuild).
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  js.configs.recommended,
  prettierConfig,
  {
    // JS utilities — browser environment
    files: ["js/**/*.js"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    // Preact components — JSX, browser environment, h/Fragment as JSX factory
    files: ["preact/**/*.{js,jsx}"],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        h: "readonly", // Preact JSX factory (explicit import in source files)
        Fragment: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    // Build scripts and test files — Node environment
    files: ["esbuild.config.mjs", "scripts/**/*.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
    },
  },
  {
    // Test files — Node + jsdom + Vitest globals
    files: ["tests/**/*.{js,jsx}"],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.node,
        ...globals.browser,
        // Vitest globals (injected by globals: true in vitest.config.js)
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    ignores: ["node_modules/", "dist/", "examples/"],
  },
];
```

**Step 4: Update `.gitignore` — add Vitest output**

Add to `.gitignore`:

```
# Vitest
coverage/
```

**Step 5: Verify Vitest runs (no tests yet)**

```bash
npx vitest run
```

Expected: `No test files found` or passes 0 tests. NOT an error about missing config.

**Step 6: Verify ESLint passes**

```bash
npx eslint . --max-warnings 0
```

Expected: no output (clean).

**Step 7: Commit**

```bash
git add vitest.config.js eslint.config.js .gitignore package.json package-lock.json
git commit -m "chore: add Vitest, @testing-library/preact, jest-axe, size-limit; update ESLint for jsx + test files"
```

---

### Task 4: Migrate freshness.test.js to Vitest

**Files:**

- Create: `tests/freshness.test.js` (new location)
- Delete: old `tests/freshness.test.js` (same location — rewrite in place)

**Context:** The existing test uses `node:test` imports (`describe`, `it`, `beforeEach` from `'node:test'`) and `assert from 'node:assert/strict'`. Vitest injects these as globals — no imports needed. `assert.equal(a, b)` becomes `expect(a).toBe(b)`.

**Step 1: Rewrite `tests/freshness.test.js`**

```js
import { applyFreshness } from "../js/freshness.js";

// Minimal DOM element mock (same as before — no jsdom needed for this module)
function mockElement() {
  const attrs = {};
  return {
    setAttribute(name, value) {
      attrs[name] = value;
    },
    getAttribute(name) {
      return attrs[name] ?? null;
    },
    _attrs: attrs,
  };
}

describe("applyFreshness", () => {
  let el;

  beforeEach(() => {
    el = mockElement();
  });

  it("returns fresh for recent timestamp", () => {
    const result = applyFreshness(el, Date.now());
    expect(result).toBe("fresh");
    expect(el._attrs["data-sh-state"]).toBe("fresh");
  });

  it("returns cooling for 10-minute-old timestamp", () => {
    const tenMinAgo = Date.now() - 10 * 60 * 1000;
    expect(applyFreshness(el, tenMinAgo)).toBe("cooling");
  });

  it("returns frozen for 45-minute-old timestamp", () => {
    const fortyFiveMinAgo = Date.now() - 45 * 60 * 1000;
    expect(applyFreshness(el, fortyFiveMinAgo)).toBe("frozen");
  });

  it("returns stale for 2-hour-old timestamp", () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(applyFreshness(el, twoHoursAgo)).toBe("stale");
  });

  it("handles Date object input", () => {
    expect(applyFreshness(el, new Date())).toBe("fresh");
  });

  it("handles custom thresholds", () => {
    const fiveSecAgo = Date.now() - 5000;
    expect(applyFreshness(el, fiveSecAgo, { cooling: 3, frozen: 10, stale: 20 })).toBe("cooling");
  });

  it("returns fresh for null element", () => {
    expect(applyFreshness(null, Date.now())).toBe("fresh");
  });

  it("returns fresh for null timestamp", () => {
    expect(applyFreshness(el, null)).toBe("fresh");
  });

  it("returns fresh for future timestamp", () => {
    expect(applyFreshness(el, Date.now() + 60000)).toBe("fresh");
  });

  it("respects exact boundary at cooling threshold", () => {
    const exactlyCooling = Date.now() - 300 * 1000;
    expect(applyFreshness(el, exactlyCooling)).toBe("cooling");
  });
});
```

**Step 2: Run to verify all 10 pass**

```bash
npx vitest run tests/freshness.test.js
```

Expected: 10 tests pass.

**Step 3: Commit**

```bash
git add tests/freshness.test.js
git commit -m "test: migrate freshness tests to Vitest"
```

---

### Task 5: Add glitch.test.js

**Files:**

- Create: `tests/glitch.test.js`

**Context:** `glitchText(element, opts)` in `js/glitch.js` sets `data-sh-glitch-text`, `data-sh-effect="glitch"`, optional `data-sh-glitch-intensity`, then removes all three after `opts.duration` ms via setTimeout. It returns a Promise. Needs jsdom (real DOM element, but Vitest environment is already jsdom).

**Step 1: Create `tests/glitch.test.js`**

```js
import { glitchText } from "../js/glitch.js";

describe("glitchText", () => {
  let el;

  beforeEach(() => {
    el = document.createElement("div");
    el.textContent = "TIME";
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('sets data-sh-effect="glitch" on the element', async () => {
    const promise = glitchText(el, { duration: 10 });
    expect(el.getAttribute("data-sh-effect")).toBe("glitch");
    await promise;
  });

  it("sets data-sh-glitch-text to element textContent", async () => {
    const promise = glitchText(el, { duration: 10 });
    expect(el.getAttribute("data-sh-glitch-text")).toBe("TIME");
    await promise;
  });

  it("removes attributes after duration resolves", async () => {
    await glitchText(el, { duration: 10 });
    expect(el.getAttribute("data-sh-effect")).toBeNull();
    expect(el.getAttribute("data-sh-glitch-text")).toBeNull();
  });

  it("sets data-sh-glitch-intensity for non-medium intensity", async () => {
    const promise = glitchText(el, { duration: 10, intensity: "high" });
    expect(el.getAttribute("data-sh-glitch-intensity")).toBe("high");
    await promise;
  });

  it("does not set data-sh-glitch-intensity for medium intensity", async () => {
    const promise = glitchText(el, { duration: 10, intensity: "medium" });
    expect(el.getAttribute("data-sh-glitch-intensity")).toBeNull();
    await promise;
  });

  it("returns a Promise that resolves", async () => {
    const result = glitchText(el, { duration: 10 });
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });

  it("returns resolved Promise immediately for null element", async () => {
    await expect(glitchText(null)).resolves.toBeUndefined();
  });

  it("removes intensity attribute after resolving", async () => {
    await glitchText(el, { duration: 10, intensity: "low" });
    expect(el.getAttribute("data-sh-glitch-intensity")).toBeNull();
  });
});
```

**Step 2: Run to verify**

```bash
npx vitest run tests/glitch.test.js
```

Expected: 8 tests pass.

**Step 3: Run full suite**

```bash
npm test
```

Expected: 18 tests pass (10 freshness + 8 glitch).

**Step 4: Commit**

```bash
git add tests/glitch.test.js
git commit -m "test: add glitch.test.js"
```

---

### Task 6: Add mantra.test.js

**Files:**

- Create: `tests/mantra.test.js`

**Context:** `applyMantra(element, text)` sets `data-sh-mantra` attribute. `removeMantra(element)` removes it. Both guard against null element/text.

**Step 1: Create `tests/mantra.test.js`**

```js
import { applyMantra, removeMantra } from "../js/mantra.js";

describe("applyMantra", () => {
  let el;

  beforeEach(() => {
    el = document.createElement("div");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("sets data-sh-mantra attribute with given text", () => {
    applyMantra(el, "OFFLINE");
    expect(el.getAttribute("data-sh-mantra")).toBe("OFFLINE");
  });

  it("does nothing when element is null", () => {
    expect(() => applyMantra(null, "TEXT")).not.toThrow();
  });

  it("does nothing when text is empty string", () => {
    applyMantra(el, "");
    expect(el.getAttribute("data-sh-mantra")).toBeNull();
  });

  it("does nothing when text is null", () => {
    applyMantra(el, null);
    expect(el.getAttribute("data-sh-mantra")).toBeNull();
  });

  it("overwrites existing mantra text", () => {
    applyMantra(el, "FIRST");
    applyMantra(el, "SECOND");
    expect(el.getAttribute("data-sh-mantra")).toBe("SECOND");
  });
});

describe("removeMantra", () => {
  let el;

  beforeEach(() => {
    el = document.createElement("div");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("removes data-sh-mantra attribute", () => {
    el.setAttribute("data-sh-mantra", "OFFLINE");
    removeMantra(el);
    expect(el.getAttribute("data-sh-mantra")).toBeNull();
  });

  it("does nothing when element is null", () => {
    expect(() => removeMantra(null)).not.toThrow();
  });

  it("does nothing when attribute not present", () => {
    expect(() => removeMantra(el)).not.toThrow();
  });
});
```

**Step 2: Run to verify**

```bash
npx vitest run tests/mantra.test.js
```

Expected: 8 tests pass.

**Step 3: Commit**

```bash
git add tests/mantra.test.js
git commit -m "test: add mantra.test.js"
```

---

### Task 7: Add shatter.test.js

**Files:**

- Create: `tests/shatter.test.js`

**Context:** `shatterElement(element, opts)` in `js/shatter.js`:

- Requires element AND element.parentNode — returns early if missing
- Calls `element.getBoundingClientRect()` and `parent.getBoundingClientRect()` — returns zeros in jsdom (that's fine)
- Creates N `.sh-fragment` divs as children of `element.parentNode`
- Hides the original element (`style.visibility = 'hidden'`)
- Removes fragments + element after `durationMs + 50` ms
- Returns a cancel function that immediately removes fragments + element
- Calls `opts.onComplete` after cleanup

Key: `getComputedStyle(element).getPropertyValue('--sh-shatter-duration')` returns empty string in jsdom → falls back to `'600ms'` (600ms duration). Use fake timers to avoid waiting 650ms in every test.

**Step 1: Create `tests/shatter.test.js`**

```js
import { shatterElement } from "../js/shatter.js";

describe("shatterElement", () => {
  let parent, el;

  beforeEach(() => {
    vi.useFakeTimers();
    parent = document.createElement("div");
    el = document.createElement("div");
    parent.appendChild(el);
    document.body.appendChild(parent);
  });

  afterEach(() => {
    vi.useRealTimers();
    parent.remove();
  });

  it("returns a cancel function", () => {
    const cancel = shatterElement(el);
    expect(typeof cancel).toBe("function");
    cancel();
  });

  it("hides the original element", () => {
    shatterElement(el);
    expect(el.style.visibility).toBe("hidden");
  });

  it("creates the specified number of fragments (default 5)", () => {
    shatterElement(el);
    const fragments = parent.querySelectorAll(".sh-fragment");
    expect(fragments.length).toBe(5);
  });

  it("creates the specified number of fragments from opts.fragments", () => {
    shatterElement(el, { fragments: 3 });
    const fragments = parent.querySelectorAll(".sh-fragment");
    expect(fragments.length).toBe(3);
  });

  it("removes fragments and element after timeout", () => {
    shatterElement(el);
    expect(parent.querySelectorAll(".sh-fragment").length).toBe(5);
    vi.advanceTimersByTime(700); // 600ms + 50ms buffer
    expect(parent.querySelectorAll(".sh-fragment").length).toBe(0);
    expect(parent.contains(el)).toBe(false);
  });

  it("calls onComplete after cleanup", () => {
    const onComplete = vi.fn();
    shatterElement(el, { onComplete });
    vi.advanceTimersByTime(700);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("cancel function removes fragments immediately", () => {
    const cancel = shatterElement(el);
    expect(parent.querySelectorAll(".sh-fragment").length).toBe(5);
    cancel();
    expect(parent.querySelectorAll(".sh-fragment").length).toBe(0);
  });

  it("returns no-op for element without parentNode", () => {
    const orphan = document.createElement("div");
    const onComplete = vi.fn();
    const cancel = shatterElement(orphan, { onComplete });
    expect(typeof cancel).toBe("function");
    expect(onComplete).toHaveBeenCalledOnce(); // called immediately
    expect(() => cancel()).not.toThrow();
  });

  it("sets parent position to relative when static", () => {
    // jsdom computed position defaults to '' (not 'static'), so this
    // tests that the function doesn't crash — real browsers get 'static'
    expect(() => shatterElement(el)).not.toThrow();
  });
});
```

**Step 2: Run to verify**

```bash
npx vitest run tests/shatter.test.js
```

Expected: 9 tests pass.

**Step 3: Run full suite**

```bash
npm test
```

Expected: 35 tests pass.

**Step 4: Commit**

```bash
git add tests/shatter.test.js
git commit -m "test: add shatter.test.js with fake timers"
```

---

### Task 8: Add ShGlitch.test.jsx + ShMantra.test.jsx

**Files:**

- Create: `tests/ShGlitch.test.jsx`
- Create: `tests/ShMantra.test.jsx`

**Context:** `ShGlitch` and `ShMantra` are pure prop-to-attribute components with no side effects (no useEffect, no timers). `@testing-library/preact`'s `render` mounts into jsdom; `screen` queries the rendered output. These are the simplest Preact component tests.

Note: `@vitejs/plugin-preact` handles JSX transformation automatically — no `import { h }` needed in test files that use JSX syntax.

**Step 1: Create `tests/ShGlitch.test.jsx`**

```jsx
import { render, screen } from "@testing-library/preact";
import { axe, toHaveNoViolations } from "jest-axe";
import { ShGlitch } from "../preact/ShGlitch.jsx";

expect.extend(toHaveNoViolations);

describe("ShGlitch", () => {
  it("renders a div with children", () => {
    render(<ShGlitch>Hello</ShGlitch>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it('sets data-sh-effect="glitch" when active', () => {
    const { container } = render(<ShGlitch active>Text</ShGlitch>);
    expect(container.firstChild.getAttribute("data-sh-effect")).toBe("glitch");
  });

  it("does not set data-sh-effect when not active", () => {
    const { container } = render(<ShGlitch>Text</ShGlitch>);
    expect(container.firstChild.getAttribute("data-sh-effect")).toBeNull();
  });

  it("sets data-sh-glitch-intensity for non-medium intensity", () => {
    const { container } = render(
      <ShGlitch active intensity="high">
        Text
      </ShGlitch>,
    );
    expect(container.firstChild.getAttribute("data-sh-glitch-intensity")).toBe("high");
  });

  it("does not set data-sh-glitch-intensity for medium intensity", () => {
    const { container } = render(
      <ShGlitch active intensity="medium">
        Text
      </ShGlitch>,
    );
    expect(container.firstChild.getAttribute("data-sh-glitch-intensity")).toBeNull();
  });

  it("passes additional props to the div", () => {
    const { container } = render(<ShGlitch aria-label="glitching">Text</ShGlitch>);
    expect(container.firstChild.getAttribute("aria-label")).toBe("glitching");
  });

  it("has no axe violations when inactive", async () => {
    const { container } = render(<ShGlitch>Normal text</ShGlitch>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when active with aria-label", async () => {
    const { container } = render(
      <ShGlitch active aria-label="Glitching data">
        Data
      </ShGlitch>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Step 2: Create `tests/ShMantra.test.jsx`**

```jsx
import { render, screen } from "@testing-library/preact";
import { axe, toHaveNoViolations } from "jest-axe";
import { ShMantra } from "../preact/ShMantra.jsx";

expect.extend(toHaveNoViolations);

describe("ShMantra", () => {
  it("renders a div with children", () => {
    render(<ShMantra>Content</ShMantra>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("sets data-sh-mantra when active and text provided", () => {
    const { container } = render(
      <ShMantra active text="OFFLINE">
        Content
      </ShMantra>,
    );
    expect(container.firstChild.getAttribute("data-sh-mantra")).toBe("OFFLINE");
  });

  it("does not set data-sh-mantra when not active", () => {
    const { container } = render(<ShMantra text="OFFLINE">Content</ShMantra>);
    expect(container.firstChild.getAttribute("data-sh-mantra")).toBeNull();
  });

  it("does not set data-sh-mantra when active but no text", () => {
    const { container } = render(<ShMantra active>Content</ShMantra>);
    expect(container.firstChild.getAttribute("data-sh-mantra")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ShMantra active text="ERROR">
        Dashboard
      </ShMantra>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Step 3: Run to verify**

```bash
npx vitest run tests/ShGlitch.test.jsx tests/ShMantra.test.jsx
```

Expected: 13 tests pass (8 + 5).

**Step 4: Run full suite**

```bash
npm test
```

Expected: 48 tests pass.

**Step 5: Commit**

```bash
git add tests/ShGlitch.test.jsx tests/ShMantra.test.jsx
git commit -m "test: add ShGlitch and ShMantra component tests"
```

---

### Task 9: Add ShFrozen.test.jsx

**Files:**

- Create: `tests/ShFrozen.test.jsx`

**Context:** `ShFrozen` calls `applyFreshness` on mount via `useEffect` and sets a 30-second interval. Tests need fake timers to control the interval without waiting. After render, `ref.current` must be non-null for `applyFreshness` to fire — @testing-library/preact's `render` mounts into jsdom so refs work.

Key: `applyFreshness` is called with a real DOM element (jsdom), but it just calls `setAttribute` — no browser-specific DOM needed.

**Step 1: Create `tests/ShFrozen.test.jsx`**

```jsx
import { render } from "@testing-library/preact";
import { axe, toHaveNoViolations } from "jest-axe";
import { ShFrozen } from "../preact/ShFrozen.jsx";

expect.extend(toHaveNoViolations);

describe("ShFrozen", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a div with children", () => {
    const { container } = render(<ShFrozen>Content</ShFrozen>);
    expect(container.firstChild.tagName).toBe("DIV");
    expect(container.firstChild.textContent).toBe("Content");
  });

  it('applies data-sh-state="fresh" for current timestamp', async () => {
    const { container } = render(<ShFrozen timestamp={Date.now()}>Data</ShFrozen>);
    // useEffect runs asynchronously — wait for it
    await vi.waitFor(() => {
      expect(container.firstChild.getAttribute("data-sh-state")).toBe("fresh");
    });
  });

  it('applies data-sh-state="stale" for old timestamp', async () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const { container } = render(<ShFrozen timestamp={twoHoursAgo}>Data</ShFrozen>);
    await vi.waitFor(() => {
      expect(container.firstChild.getAttribute("data-sh-state")).toBe("stale");
    });
  });

  it("does not set data-sh-state when no timestamp provided", async () => {
    const { container } = render(<ShFrozen>No timestamp</ShFrozen>);
    // Give effect time to run (it guards against !timestamp so it should not set)
    await new Promise((r) => setTimeout(r, 10));
    expect(container.firstChild.getAttribute("data-sh-state")).toBeNull();
  });

  it("refreshes state every 30 seconds via interval", async () => {
    vi.useFakeTimers();
    const { container } = render(<ShFrozen timestamp={Date.now()}>Data</ShFrozen>);
    await vi.waitFor(() => {
      expect(container.firstChild.getAttribute("data-sh-state")).toBe("fresh");
    });
    // Advance 30s — interval fires again (timestamp is still recent → still fresh)
    vi.advanceTimersByTime(30000);
    expect(container.firstChild.getAttribute("data-sh-state")).toBe("fresh");
  });

  it("passes class and additional props to the div", () => {
    const { container } = render(
      <ShFrozen class="widget" aria-label="temperature">
        Data
      </ShFrozen>,
    );
    expect(container.firstChild.getAttribute("class")).toBe("widget");
    expect(container.firstChild.getAttribute("aria-label")).toBe("temperature");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ShFrozen timestamp={Date.now()} aria-label="Last updated">
        Data
      </ShFrozen>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Step 2: Run to verify**

```bash
npx vitest run tests/ShFrozen.test.jsx
```

Expected: 7 tests pass.

**Step 3: Run full suite**

```bash
npm test
```

Expected: 55 tests pass.

**Step 4: Commit**

```bash
git add tests/ShFrozen.test.jsx
git commit -m "test: add ShFrozen component tests with timer mocking"
```

---

### Task 10: Add ShShatter.test.jsx + ShThreatPulse.test.jsx

**Files:**

- Create: `tests/ShShatter.test.jsx`
- Create: `tests/ShThreatPulse.test.jsx`

**Context:**

- `ShShatter` renders a div with `data-sh-dismiss` and an `onClick` that calls `shatterElement`. Click triggers the actual shatter animation — use fake timers to fast-forward.
- `ShThreatPulse` sets `data-sh-effect="threat-pulse"` when `active`. When `active && !persistent`, a useEffect removes the attribute after `--sh-threat-pulse-duration` × 2 + 100ms. The CSS property isn't set in jsdom, so `getComputedStyle` returns empty → `parseFloat('')` → NaN → falls back to default 1.5s → timer fires at 3100ms.

**Step 1: Create `tests/ShShatter.test.jsx`**

```jsx
import { render, fireEvent } from "@testing-library/preact";
import { axe, toHaveNoViolations } from "jest-axe";
import { ShShatter } from "../preact/ShShatter.jsx";

expect.extend(toHaveNoViolations);

describe("ShShatter", () => {
  afterEach(() => vi.useRealTimers());

  it("renders a div with children", () => {
    const { container } = render(<ShShatter>Dismiss</ShShatter>);
    expect(container.firstChild.textContent).toBe("Dismiss");
  });

  it("has data-sh-dismiss attribute", () => {
    const { container } = render(<ShShatter>Content</ShShatter>);
    expect(container.firstChild.hasAttribute("data-sh-dismiss")).toBe(true);
  });

  it("calls onDismiss after click + animation", async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { container } = render(<ShShatter onDismiss={onDismiss}>Card</ShShatter>);
    fireEvent.click(container.firstChild);
    vi.advanceTimersByTime(700);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("passes class and additional props to the div", () => {
    const { container } = render(
      <ShShatter class="card" aria-label="Dismiss card">
        Content
      </ShShatter>,
    );
    expect(container.firstChild.getAttribute("class")).toBe("card");
    expect(container.firstChild.getAttribute("aria-label")).toBe("Dismiss card");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ShShatter aria-label="Dismiss this item">Item</ShShatter>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Step 2: Create `tests/ShThreatPulse.test.jsx`**

```jsx
import { render } from "@testing-library/preact";
import { axe, toHaveNoViolations } from "jest-axe";
import { ShThreatPulse } from "../preact/ShThreatPulse.jsx";

expect.extend(toHaveNoViolations);

describe("ShThreatPulse", () => {
  afterEach(() => vi.useRealTimers());

  it("renders a div with children", () => {
    const { container } = render(<ShThreatPulse>Alert</ShThreatPulse>);
    expect(container.firstChild.textContent).toBe("Alert");
  });

  it('sets data-sh-effect="threat-pulse" when active', () => {
    const { container } = render(<ShThreatPulse active>Alert</ShThreatPulse>);
    expect(container.firstChild.getAttribute("data-sh-effect")).toBe("threat-pulse");
  });

  it("does not set data-sh-effect when not active", () => {
    const { container } = render(<ShThreatPulse>Alert</ShThreatPulse>);
    expect(container.firstChild.getAttribute("data-sh-effect")).toBeNull();
  });

  it("auto-removes data-sh-effect after animation when not persistent", async () => {
    vi.useFakeTimers();
    const { container } = render(<ShThreatPulse active>Alert</ShThreatPulse>);
    expect(container.firstChild.getAttribute("data-sh-effect")).toBe("threat-pulse");
    // Default duration 1.5s × 2 + 100ms = 3100ms (CSS property empty in jsdom)
    vi.advanceTimersByTime(3200);
    expect(container.firstChild.getAttribute("data-sh-effect")).toBeNull();
  });

  it("keeps data-sh-effect when persistent=true", async () => {
    vi.useFakeTimers();
    const { container } = render(
      <ShThreatPulse active persistent>
        Alert
      </ShThreatPulse>,
    );
    vi.advanceTimersByTime(5000);
    expect(container.firstChild.getAttribute("data-sh-effect")).toBe("threat-pulse");
  });

  it("passes class and additional props to the div", () => {
    const { container } = render(
      <ShThreatPulse class="alert" aria-label="Threat detected">
        !
      </ShThreatPulse>,
    );
    expect(container.firstChild.getAttribute("class")).toBe("alert");
    expect(container.firstChild.getAttribute("aria-label")).toBe("Threat detected");
  });

  it("has no axe violations when active", async () => {
    const { container } = render(
      <ShThreatPulse active aria-label="Threat alert">
        !
      </ShThreatPulse>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Step 3: Run to verify**

```bash
npx vitest run tests/ShShatter.test.jsx tests/ShThreatPulse.test.jsx
```

Expected: 12 tests pass (5 + 7).

**Step 4: Run full suite**

```bash
npm test
```

Expected: 67 tests pass.

**Step 5: Commit**

```bash
git add tests/ShShatter.test.jsx tests/ShThreatPulse.test.jsx
git commit -m "test: add ShShatter and ShThreatPulse component tests"
```

---

### Task 11: Add css-tokens.test.js

**Files:**

- Create: `tests/css-tokens.test.js`

**Context:** Reads `dist/superhot.css` and asserts all `--sh-*` token names are present. Protects against silent renames breaking downstream consumers. Requires a prior build — uses `describe.skipIf` to skip gracefully when dist doesn't exist (e.g., first local clone before build). CI always builds before running tests via `npm run test:ci`.

**Step 1: Create `tests/css-tokens.test.js`**

```js
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distCssPath = resolve(__dirname, "../dist/superhot.css");
const distExists = existsSync(distCssPath);

// These are the --sh-* tokens that downstream consumers depend on by name.
// If you rename a token, update this list AND coordinate with all consumers.
const REQUIRED_TOKENS = [
  "--sh-threat",
  "--sh-threat-glow",
  "--sh-frozen",
  "--sh-glass",
  "--sh-void",
  "--sh-shatter-duration",
  "--sh-glitch-duration",
  "--sh-threat-pulse-duration",
  "--sh-frost-shimmer-duration",
  "--sh-state-transition",
];

describe.skipIf(!distExists)("CSS token contract (requires npm run build first)", () => {
  let css;

  beforeAll(() => {
    css = readFileSync(distCssPath, "utf8");
  });

  for (const token of REQUIRED_TOKENS) {
    it(`dist/superhot.css contains ${token}`, () => {
      expect(css).toContain(token);
    });
  }
});
```

**Step 2: Build dist, then run the test**

```bash
npm run build
npx vitest run tests/css-tokens.test.js
```

Expected: 10 tests pass (one per token).

**Step 3: Verify skip behavior without dist**

```bash
rm -rf dist
npx vitest run tests/css-tokens.test.js
```

Expected: test suite skipped (0 failures). Rebuild dist:

```bash
npm run build
```

**Step 4: Commit**

```bash
git add tests/css-tokens.test.js
git commit -m "test: add CSS token contract test — guards against silent token renames"
```

---

### Task 12: Add consumer.test.js

**Files:**

- Create: `tests/consumer.test.js`

**Context:** Imports from the compiled `dist/` outputs — exactly what downstream consumers get when they do `import { applyFreshness } from 'superhot-ui'`. Catches build-time failures (wrong export name, missing entry, bundler config errors) that source-import tests completely miss. Uses `describe.skipIf` when dist doesn't exist.

`dist/superhot.preact.js` has `preact` and `preact/hooks` as external deps — these are in devDependencies so they resolve in the test environment.

**Step 1: Create `tests/consumer.test.js`**

```js
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distExists = existsSync(resolve(__dirname, "../dist/superhot.js"));

describe.skipIf(!distExists)("dist consumer integration (requires npm run build first)", () => {
  it("exports all JS utilities from dist/superhot.js", async () => {
    const mod = await import("../dist/superhot.js");
    expect(typeof mod.applyFreshness).toBe("function");
    expect(typeof mod.shatterElement).toBe("function");
    expect(typeof mod.glitchText).toBe("function");
    expect(typeof mod.applyMantra).toBe("function");
    expect(typeof mod.removeMantra).toBe("function");
  });

  it("exports all Preact components from dist/superhot.preact.js", async () => {
    const mod = await import("../dist/superhot.preact.js");
    expect(typeof mod.ShFrozen).toBe("function");
    expect(typeof mod.ShGlitch).toBe("function");
    expect(typeof mod.ShMantra).toBe("function");
    expect(typeof mod.ShShatter).toBe("function");
    expect(typeof mod.ShThreatPulse).toBe("function");
  });

  it("dist/superhot.js exports are callable (smoke test)", async () => {
    const { applyFreshness } = await import("../dist/superhot.js");
    // applyFreshness with null element returns 'fresh'
    expect(applyFreshness(null, Date.now())).toBe("fresh");
  });

  it("all 4 package.json export targets exist as files", () => {
    const root = resolve(__dirname, "..");
    const exports = [
      "dist/superhot.css",
      "css/tokens.css",
      "dist/superhot.js",
      "dist/superhot.preact.js",
    ];
    for (const target of exports) {
      expect(existsSync(resolve(root, target)), `${target} must exist`).toBe(true);
    }
  });
});
```

**Step 2: Run with dist present**

```bash
npx vitest run tests/consumer.test.js
```

Expected: 4 tests pass.

**Step 3: Run full suite**

```bash
npm test
```

Expected: 81 tests pass (67 + 10 token + 4 consumer).

**Step 4: Commit**

```bash
git add tests/consumer.test.js
git commit -m "test: add consumer integration test — verifies dist exports match package.json"
```

---

### Task 13: Add bundle size enforcement

**Files:**

- Create: `.size-limit.json`

**Context:** size-limit measures the gzipped size of each dist output — what consumers actually download. Preact is external in the Preact bundle, so only the component wrapper code is measured. Run `npx size-limit` after `npm run build` to see actual sizes; the limits below are set at ~2× current expected size (generous headroom without being meaningless).

**Step 1: Check actual current sizes**

```bash
npm run build
npx size-limit
```

Read the output and note actual sizes. If any exceeds the limits below, adjust the limit to actual + 50%.

**Step 2: Create `.size-limit.json`**

```json
[
  {
    "name": "CSS",
    "path": "dist/superhot.css",
    "limit": "10 kB"
  },
  {
    "name": "JS utilities",
    "path": "dist/superhot.js",
    "limit": "5 kB",
    "ignore": []
  },
  {
    "name": "Preact components",
    "path": "dist/superhot.preact.js",
    "limit": "8 kB",
    "ignore": ["preact", "preact/hooks"]
  }
]
```

**Step 3: Verify size-limit passes**

```bash
npx size-limit
```

Expected: all three entries show sizes below their limits (green output). If any fails, increase the limit to actual + 50% and note the actual size in a comment.

**Step 4: Commit**

```bash
git add .size-limit.json
git commit -m "chore: add size-limit for all three dist outputs"
```

---

### Task 14: Add CI workflow

**Files:**

- Create: `.github/workflows/ci.yml`

**Context:** A single fast CI workflow — no Playwright, no server startup. Steps: install → lint → build → test (consumer + token tests run because build precedes test) → verify export integrity → size-limit. The `npm run test:ci` script defined in Task 2 already runs `npm run build && vitest run` — but in CI we want build as a separate step for clearer failure attribution. So in CI we use `npm run build` then `npm test` (plain vitest run).

**Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Lint, Test, Build, Size
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npx eslint . --max-warnings 0

      - name: Build
        run: npm run build

      - name: Test (includes consumer + CSS token tests)
        run: npm test

      - name: Verify export integrity
        run: |
          node -e "
          import { existsSync } from 'fs'
          const targets = [
            'dist/superhot.css',
            'css/tokens.css',
            'dist/superhot.js',
            'dist/superhot.preact.js',
          ]
          let failed = false
          for (const t of targets) {
            if (!existsSync(t)) {
              console.error('MISSING:', t)
              failed = true
            }
          }
          if (failed) process.exit(1)
          console.log('All export targets present.')
          " --input-type=module

      - name: Bundle size
        run: npx size-limit
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add ci.yml — lint, build, test, export integrity, size-limit"
```

---

### Task 15: Update docs + final quality gate

**Files:**

- Modify: `CLAUDE.md` (update test command)
- Modify: `~/ui-template/docs/qa-reuse-guide.md` (add superhot-ui library patterns)

**Step 1: Update `CLAUDE.md` test command**

Find the line in `CLAUDE.md`:

```
- `npm test` — Run unit tests (node --test)
- `node --test tests/freshness.test.js` — Single test file
```

Replace with:

```
- `npm test` — Run all tests (Vitest, jsdom environment)
- `npm run build && npm test` — Build dist then run all tests including consumer + CSS token contract tests
- `npx vitest run tests/freshness.test.js` — Single test file
```

**Step 2: Update `~/ui-template/docs/qa-reuse-guide.md`**

Add a new section at the end of the file:

````markdown
## Library-Specific Patterns (superhot-ui)

These patterns apply to pure library repos (no Next.js, no running server).

### 1. No visual regression Playwright

Libraries don't have a running server. Skip Playwright entirely. Use jsdom + @testing-library/preact for component behavior. CSS animation testing via screenshot is brittle without GPU compositing.

### 2. Consumer dist integration tests

Test what consumers actually import — the compiled `dist/` output, not source:

```js
describe.skipIf(!existsSync("dist/superhot.js"))("consumer integration", () => {
  it("exports utilities from dist", async () => {
    const mod = await import("../dist/superhot.js");
    expect(typeof mod.applyFreshness).toBe("function");
  });
});
```
````

`describe.skipIf` skips gracefully locally (no prior build); CI always builds before running tests.

### 3. CSS token contract test

Protect token names that downstream consumers reference by name:

```js
const REQUIRED_TOKENS = ['--sh-threat', '--sh-frozen', ...]
for (const token of REQUIRED_TOKENS) {
  it(`contains ${token}`, () => expect(css).toContain(token))
}
```

Add a comment: "If you rename a token, update this list AND coordinate with all consumers."

### 4. CI order: lint → build → test → size

Build must precede test so consumer + token tests have dist to import. Use `npm run build` as a separate CI step (not embedded in the test script) for clear failure attribution.

### 5. @vitejs/plugin-preact for JSX in Vitest

For Preact component tests in Vitest, use `@vitejs/plugin-preact` — not `@vitejs/plugin-react`. Source files can use explicit `import { h } from 'preact'` (classic factory); test files can use JSX directly via the automatic runtime the plugin provides. Both coexist in Preact 10.

### 6. ShThreatPulse timer: 3100ms default in jsdom

`getComputedStyle` returns empty string for CSS custom properties in jsdom. `ShThreatPulse` falls back to 1.5s default → timer fires at 3100ms. Use `vi.advanceTimersByTime(3200)` in tests.

### 7. Export map: size-limit ignores externals

For Preact bundle with `external: ['preact', 'preact/hooks']`, add `"ignore": ["preact", "preact/hooks"]` to the size-limit entry — otherwise size-limit tries to include preact in the measurement and overreports.

### 8. Port table (library repos have no server)

superhot-ui has no development server. The port table in this guide (7685/7686/7687) does not apply to library repos.

````

**Step 3: Run full quality gate**

```bash
cd ~/Documents/projects/superhot-ui
npm run build
npm test
npx eslint . --max-warnings 0
npx size-limit
````

Expected:

- All tests pass (count should match your running total)
- ESLint: no output (clean)
- size-limit: all three entries below limits

**Step 4: Commit superhot-ui docs change**

```bash
cd ~/Documents/projects/superhot-ui
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md test commands for Vitest"
```

**Step 5: Commit ui-template qa-reuse-guide update**

```bash
cd ~/ui-template
git add docs/qa-reuse-guide.md
git commit -m "docs: add library-specific QA patterns from superhot-ui"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-03-04-qa-pipeline.md`. Three execution options:

**1. Subagent-Driven (this session)** — I dispatch fresh subagent per task with two-stage review, fast iteration, you watch progress

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with human review checkpoints

**3. Headless (walk away)** — Run in background. Best for 5+ batch plans.

Which approach?
