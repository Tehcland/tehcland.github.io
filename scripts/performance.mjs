import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { startPreview } from "./preview.mjs";

const output = resolve(process.env.REVIEW_DIR || "review");
await mkdir(output, { recursive: true });
const profile = await mkdtemp(resolve(output, ".chrome-"));
const preview = await startPreview();
const chrome = await launch({
  ...(process.env.CHROMIUM_PATH
    ? { chromePath: process.env.CHROMIUM_PATH }
    : {}),
  chromeFlags: [
    "--headless",
    "--disable-dev-shm-usage",
    ...(process.env.CHROMIUM_NO_SANDBOX === "1" ? ["--no-sandbox"] : []),
  ],
  userDataDir: profile,
});
const summary = [];
try {
  for (const slug of ["index", "about", "vision", "grants", "contact"]) {
    const result = await lighthouse(`${preview.url}/${slug}.html`, {
      port: chrome.port,
      logLevel: "error",
      output: ["html", "json"],
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });
    await writeFile(
      resolve(output, `${slug}-lighthouse.html`),
      result.report[0],
    );
    await writeFile(
      resolve(output, `${slug}-lighthouse.json`),
      result.report[1],
    );
    const audits = result.lhr.audits;
    const row = {
      page: slug,
      scores: Object.fromEntries(
        Object.entries(result.lhr.categories).map(([key, value]) => [
          key,
          Math.round(value.score * 100),
        ]),
      ),
      lcpMs: Math.round(audits["largest-contentful-paint"].numericValue),
      cls: audits["cumulative-layout-shift"].numericValue,
      transferredBytes: audits["total-byte-weight"].numericValue,
    };
    summary.push(row);
    console.log(JSON.stringify(row));
    assert.ok(row.scores.performance >= 90, `${slug}: performance below 90`);
    assert.equal(
      row.scores.accessibility,
      100,
      `${slug}: accessibility below 100`,
    );
    assert.ok(row.cls <= 0.1, `${slug}: layout shifts exceed 0.1`);
  }
} finally {
  await chrome.kill();
  await rm(profile, { recursive: true, force: true });
  await preview.close();
  await writeFile(
    resolve(output, "performance-summary.json"),
    JSON.stringify(
      {
        date: new Date().toISOString(),
        profile: "Lighthouse default mobile simulated throttling, local HTTP",
        pages: summary,
      },
      null,
      2,
    ),
  );
}
