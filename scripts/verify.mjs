import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { startPreview } from "./preview.mjs";

const require = createRequire(import.meta.url);
const axe = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const output = resolve(process.env.REVIEW_DIR || "review");
await mkdir(output, { recursive: true });
const pages = ["index", "about", "vision", "grants", "contact"];
const report = { date: new Date().toISOString(), checks: [], failures: [] };
report.sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
report.branch = execFileSync("git", ["branch", "--show-current"], {
  encoding: "utf8",
}).trim();
const preview = await startPreview();
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
  args: process.env.CHROMIUM_NO_SANDBOX === "1" ? ["--no-sandbox"] : [],
});

async function check(name, action) {
  try {
    const result = await action();
    report.checks.push({ name, result: result || "passed" });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.failures.push({ name, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    for (const slug of pages) {
      await check(`${slug}: layout and links at ${width}px`, async () => {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
        });
        try {
          const errors = [];
          page.on("pageerror", (error) => errors.push(error.message));
          page.on("console", (message) => {
            if (message.type() === "error") errors.push(message.text());
          });
          page.on("response", (response) => {
            if (response.status() >= 400)
              errors.push(`${response.status()} ${response.url()}`);
          });
          const unexpected = [];
          page.on("request", (request) => {
            if (!request.url().startsWith(preview.url))
              unexpected.push(request.url());
          });
          const response = await page.goto(`${preview.url}/${slug}.html`);
          assert.equal(response.status(), 200);
          // Load all images so off-screen failures cannot hide behind lazy loading.
          await page.evaluate(async () => {
            await Promise.all(
              [...document.images].map(async (image) => {
                image.loading = "eager";
                await image.decode();
              }),
            );
          });
          assert.equal(
            await page.locator("h1").count(),
            1,
            "One page heading required",
          );
          assert.equal(await page.locator("main").count(), 1);
          assert.equal(
            await page.locator(".site-nav [aria-current='page']").count(),
            1,
          );
          const dimensions = await page.evaluate(() => ({
            viewport: innerWidth,
            content: document.documentElement.scrollWidth,
            brokenImages: [...document.images].filter(
              (image) => !image.naturalWidth,
            ).length,
          }));
          assert.ok(
            dimensions.content <= dimensions.viewport,
            JSON.stringify(dimensions),
          );
          assert.equal(dimensions.brokenImages, 0);
          const links = await page
            .locator("a[href]")
            .evaluateAll((links) => links.map((link) => link.href));
          for (const href of new Set(links)) {
            const url = new URL(href);
            if (url.origin !== preview.url) continue;
            const linked = await page.request.get(url.href);
            assert.equal(linked.status(), 200, `Broken link: ${url.href}`);
            if (url.hash) {
              const markup = await linked.text();
              assert.ok(
                markup.includes(
                  `id="${decodeURIComponent(url.hash.slice(1))}"`,
                ),
                `Missing anchor: ${url.href}`,
              );
            }
          }
          if (width === 390 || width === 1440) {
            await page.addScriptTag({ content: axe });
            const audit = await page.evaluate(async () => {
              const result = await window.axe.run(document, {
                runOnly: {
                  type: "tag",
                  values: [
                    "wcag2a",
                    "wcag2aa",
                    "wcag21a",
                    "wcag21aa",
                    "wcag22aa",
                    "best-practice",
                  ],
                },
              });
              return {
                violations: result.violations.map((item) => ({
                  id: item.id,
                  impact: item.impact,
                  nodes: item.nodes.map((node) => ({
                    target: node.target,
                    summary: node.failureSummary,
                  })),
                })),
                incomplete: result.incomplete.map((item) => item.id),
              };
            });
            await writeFile(
              resolve(output, `${slug}-${width}-axe.json`),
              JSON.stringify(audit, null, 2),
            );
            assert.deepEqual(
              audit.violations,
              [],
              `Accessibility: ${JSON.stringify(audit.violations)}`,
            );
            await page.screenshot({
              path: resolve(
                output,
                `${slug}-${width === 390 ? "mobile" : "desktop"}.png`,
              ),
              fullPage: true,
            });
          }
          assert.deepEqual(unexpected, [], "No external runtime requests");
          assert.deepEqual(errors, [], "Browser errors");
          return dimensions;
        } finally {
          await page.close();
        }
      });
    }
  }

  await check("Mobile menu, keyboard, Escape, and navigation", async () => {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    try {
      await page.goto(preview.url);
      await page.keyboard.press("Tab");
      assert.equal(
        await page.locator(":focus").textContent(),
        "Skip to content",
      );
      await page.keyboard.press("Enter");
      assert.equal(await page.locator(":focus").getAttribute("id"), "main");
      const menu = page.locator(".menu-toggle");
      await menu.focus();
      await page.keyboard.press("Enter");
      assert.equal(await menu.getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Tab");
      assert.equal(await page.locator(":focus").textContent(), "Home");
      await page.screenshot({ path: resolve(output, "mobile-menu-open.png") });
      await page.keyboard.press("Escape");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      assert.equal(
        await page.locator(":focus").getAttribute("aria-controls"),
        "site-navigation",
      );
      await menu.click();
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Our vision" })
        .click();
      await page.waitForURL("**/vision.html");
      assert.match(await page.locator("h1").textContent(), /grow together/);
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
    } finally {
      await page.close();
    }
  });

  await check("Mobile menu accessibility when expanded", async () => {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    try {
      await page.goto(preview.url);
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(async () =>
        (await window.axe.run()).violations.map((item) => item.id),
      );
      assert.deepEqual(violations, []);
    } finally {
      await page.close();
    }
  });

  await check("No-JavaScript navigation on all five pages", async () => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 800 },
    });
    try {
      const page = await context.newPage();
      for (const slug of pages) {
        await page.goto(`${preview.url}/${slug}.html`);
        assert.equal(await page.locator(".site-nav").isVisible(), true);
        assert.equal(await page.locator(".menu-toggle").isVisible(), false);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
      }
    } finally {
      await context.close();
    }
  });

  await check("200% zoom equivalent reflow and reduced motion", async () => {
    // A 1440px desktop viewport at 200% zoom has 720 CSS pixels available.
    const context = await browser.newContext({
      viewport: { width: 720, height: 450 },
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      for (const slug of pages) {
        await page.goto(`${preview.url}/${slug}.html`);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        assert.equal(
          await page.evaluate(
            () => getComputedStyle(document.documentElement).scrollBehavior,
          ),
          "auto",
        );
      }
    } finally {
      await context.close();
    }
  });

  await check("Contact honesty and energy/funding content", async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${preview.url}/contact.html`);
      assert.equal(
        await page.locator("form,input,textarea,button[type='submit']").count(),
        0,
      );
      assert.match(
        await page.locator("main").innerText(),
        /No message can be submitted here/,
      );
      assert.equal(
        await page
          .getByRole("link", { name: "View the project on GitHub" })
          .getAttribute("href"),
        "https://github.com/Tehcland/tehcland.github.io",
      );
      for (const slug of pages) {
        await page.goto(`${preview.url}/${slug}.html`);
        assert.doesNotMatch(
          await page.locator("body").innerText(),
          /battery[\s-]?free|generates electricity|nonprofit prototype|we work with local government|actively applying/i,
        );
      }
      await page.goto(`${preview.url}/vision.html`);
      assert.match(
        await page.locator("#energy").innerText(),
        /battery storage are compatible/,
      );
      assert.match(await page.locator("#energy").innerText(), /exploratory/);
      await page.goto(`${preview.url}/grants.html`);
      assert.match(
        await page.locator("main").innerText(),
        /does not confirm any grant awards/,
      );
    } finally {
      await page.close();
    }
  });
} finally {
  await browser.close();
  await preview.close();
  await writeFile(
    resolve(output, "test-results.json"),
    JSON.stringify(report, null, 2),
  );
}
console.log(
  `${report.checks.length} checks passed; ${report.failures.length} failed.`,
);
if (report.failures.length) process.exitCode = 1;
