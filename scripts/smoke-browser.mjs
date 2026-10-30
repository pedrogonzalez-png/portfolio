#!/usr/bin/env node
/* global process, setTimeout, fetch, console, URL, document */
/**
 * Test actual production Vite assets running in Chromium.
 * A successful tsc, npm run build or jsdom unit test does NOT prove that
 * React hydrated or that the page is visible in a real browser.
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const ORIGIN = process.env.SMOKE_TARGET_URL || "http://127.0.0.1:4173";
const REMOTE = Boolean(process.env.SMOKE_TARGET_URL);
const preview = REMOTE ? null : spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, CI: "true" },
});
preview?.stdout.on("data", data => process.stdout.write(String(data)));
preview?.stderr.on("data", data => process.stderr.write(String(data)));

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitForServer() {
  for (let i = 0; i < 80; i++) {
    if (preview?.exitCode !== null) throw new Error("Vite preview exited before serving.");
    try {
      const response = await fetch(ORIGIN);
      if (response.ok) return;
    } catch { /* Not ready yet */ }
    await delay(250);
  }
  throw new Error("Vite preview did not start within 20s.");
}

await mkdir("browser-diagnostics", { recursive: true });
let browser;
let failed = false;
try {
  if (!REMOTE) await waitForServer();
  console.log("Testing deployment:", ORIGIN);
  browser = await chromium.launch({ headless: true });
  for (const variant of [
    { name: "desktop", viewport: { width: 1440, height: 900 }, mobile: false, reducedMotion: "no-preference" },
    { name: "mobile", viewport: { width: 390, height: 844 }, mobile: true, reducedMotion: "no-preference" },
    { name: "mobile-reduced-motion", viewport: { width: 390, height: 844 }, mobile: true, reducedMotion: "reduce" },
    { name: "desktop-reduced-motion", viewport: { width: 1440, height: 900 }, mobile: false, reducedMotion: "reduce" },
  ]) {
    const context = await browser.newContext({
      viewport: variant.viewport,
      hasTouch: variant.mobile,
      isMobile: variant.mobile,
      deviceScaleFactor: variant.mobile ? 2 : 1,
      reducedMotion: variant.reducedMotion,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push("PAGEERROR: " + error.stack));
    page.on("console", msg => {
      if (msg.type() === "error") errors.push("CONSOLE: " + msg.text());
    });
    page.on("response", response => {
      if (response.status() >= 400 && /\.(m?js|css)(\?|$)/.test(response.url())) {
        errors.push("ASSET " + response.status() + ": " + response.url());
      }
    });
    let root = "";
    try {
      const response = await page.goto(ORIGIN, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.locator("#root .site-header").waitFor({ state: "visible", timeout: 15000 });
      const headerBounds = await page.locator("#root .site-header").boundingBox();
      if (!headerBounds || headerBounds.width < 80 || headerBounds.height < 25) {
        throw new Error("Portfolio menu is mounted but has zero layout size: " + JSON.stringify(headerBounds));
      }
      await page.getByRole("heading", { name: /Um universo de/i }).waitFor({ state: "attached", timeout: 10000 });
      root = (await page.locator("#root").innerText()).slice(0, 1000);
      if (!root.includes("PORTFÓLIO") || !root.includes("Abismo")) {
        throw new Error("React mounted but page content missing: " + root);
      }
      // Preserve browser diagnostics for nonfatal errors as well.
      console.log(JSON.stringify({ variant: variant.name, http: response?.status(), mounted: true, errors }));
      if (errors.some(text => text.startsWith("PAGEERROR:") || text.startsWith("ASSET "))) {
        throw new Error("JavaScript/asset errors in production bundle.");
      }
      // Ensure that a visitor on a mobile browser with a blank screen can
      // inspect the actual runtime without opening developer tools.
      const diagnosticUrl = new URL(ORIGIN);
      diagnosticUrl.searchParams.set("diagnostico", "1");
      await page.goto(diagnosticUrl.toString(), { waitUntil: "domcontentloaded" });
      await page.locator("#portfolio-diagnostico").waitFor({ state: "visible", timeout: 10000 });
      await page.locator("#root .site-header").waitFor({ state: "visible", timeout: 10000 });
      await page.waitForFunction(
        () => document.querySelector("#portfolio-diagnostico")?.textContent?.includes("Menu: encontrado"),
        null,
        { timeout: 5000 },
      );
    } catch (error) {
      failed = true;
      console.error(JSON.stringify({
        variant: variant.name,
        error: String(error),
        root,
        title: await page.title().catch(() => ""),
        pageUrl: page.url(),
        errors,
      }, null, 2));
      await page.screenshot({ path: `browser-diagnostics/${variant.name}-failed.png`, fullPage: true }).catch(() => {});
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  preview?.kill("SIGTERM");
}
if (failed) process.exitCode = 1;
