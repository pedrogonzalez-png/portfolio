#!/usr/bin/env node
/* global process, setTimeout, fetch, console, URL, document, getComputedStyle */
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
      const authorHeading = page.getByRole("heading", { level: 1, name: "PEDRO GONZALEZ" });
      await authorHeading.waitFor({ state: "visible", timeout: 10000 });
      await page.evaluate(() => document.fonts.ready);
      const nameLayout = await authorHeading.evaluate((heading) => ({
        content: heading.textContent?.trim(),
        clientWidth: heading.clientWidth,
        scrollWidth: heading.scrollWidth,
        width: heading.getBoundingClientRect().width,
      }));
      if (nameLayout.scrollWidth > nameLayout.clientWidth + 5 || nameLayout.width < 220) {
        throw new Error("Creator heading is clipped or too narrow: " + JSON.stringify(nameLayout));
      }
      const about = page.getByRole("region", { name: "Sobre e contato" });
      if (!(await about.innerText()).includes("Pedro Henrique Mariano Gonzalez")) {
        throw new Error("Résumé-backed full author name missing from About");
      }
      console.log(JSON.stringify({ variant: variant.name, author: nameLayout, about: "verified" }));
      // Visual regression for the desktop screenshot: the animated WebGL
      // backdrop must not end with a hard rectangular border, and three
      // translucent screens must not compete for the same foreground.
      const glassVisual = await page.locator(".spine-stage.project-carousel").evaluate(stage => {
        const center = stage.querySelector(".arc-carousel .cinematic-panel.carousel-center");
        const right = stage.querySelector(".arc-carousel .cinematic-panel.carousel-right");
        const atmosphere = stage.querySelector(".spine-world");
        const centerStyle = center && getComputedStyle(center);
        const sideStyle = right && getComputedStyle(right);
        const worldStyle = atmosphere && getComputedStyle(atmosphere);
        return {
          centerBackground: centerStyle?.backgroundImage || "",
          centerOpacity: centerStyle?.opacity || "",
          sideOpacity: Number(sideStyle?.opacity || "1"),
          worldMask: worldStyle?.maskImage || worldStyle?.webkitMaskImage || "",
          worldOpacity: Number(worldStyle?.opacity || "0"),
          webglActive: Boolean(atmosphere),
          glassEnabled: stage.dataset.glass === "true",
        };
      });
      if (!glassVisual.centerBackground.includes("linear-gradient") ||
          glassVisual.centerOpacity !== "1" || glassVisual.sideOpacity > .55) {
        throw new Error("Carousel focus materials not applied: " + JSON.stringify(glassVisual));
      }
      if (glassVisual.webglActive && (glassVisual.worldMask === "none" ||
          !glassVisual.worldMask.includes("radial-gradient") ||
          glassVisual.worldOpacity > .52)) {
        throw new Error("WebGL atmosphere still has a hard rectangular edge: " + JSON.stringify(glassVisual));
      }
      console.log(JSON.stringify({ variant: variant.name, visualCompositing: glassVisual }));
      // Geometry regression: a centered project must be fully readable on a
      // phone, including in reduced-motion mode. A previous global
      // transform:none!important kept the card at left:50% with no centering,
      // leaving only its right half visible.
      if (variant.mobile) {
        const carousel = page.locator(".spine-stage.project-carousel");
        await carousel.waitFor({ state: "visible", timeout: 10000 });
        for (let step = 0; step < 3; step++) {
          if (step) {
            await carousel.press("ArrowRight");
            // Check the actual browser animation, not just a CSS file string.
            if (step === 1) {
              await page.waitForFunction(() =>
                document.defaultView.getComputedStyle(document.querySelector(".cinematic-panel.carousel-center .cinematic-panel-hero"))
                  .animationName.includes("carousel-title-reveal") ||
                document.defaultView.getComputedStyle(document.querySelector(".cinematic-panel.carousel-center .cinematic-panel-hero"))
                  .animationName.includes("carousel-quiet-fade"),
              );
              const motion = await carousel.evaluate(stage => {
                const heading = stage.querySelector(".cinematic-panel.carousel-center .cinematic-panel-hero");
                const trail = stage.querySelector(".carousel-change-trail");
                return {
                  name: heading ? document.defaultView.getComputedStyle(heading).animationName : "none",
                  trail: Boolean(trail),
                  direction: stage.getAttribute("data-carousel-direction"),
                };
              });
              if (!motion.trail || motion.direction !== "next" ||
                  motion.name !== (variant.reducedMotion === "reduce"
                    ? "carousel-quiet-fade" : "carousel-title-reveal")) {
                throw new Error("Card switch animation absent: " + JSON.stringify(motion));
              }
              console.log(JSON.stringify({ variant: variant.name, cardSwitch: motion }));
            }
            const transition = await carousel.evaluate(stage => {
              const entering = stage.querySelector(".cinematic-panel.carousel-entering");
              const leaving = stage.querySelector(".cinematic-panel.carousel-exiting");
              const wrapping = stage.querySelector(".cinematic-panel.carousel-wrapping");
              return {
                entering: entering?.getAttribute("data-project-id"),
                exiting: leaving?.getAttribute("data-project-id"),
                wrapping: wrapping?.getAttribute("data-project-id"),
                animation: entering ? getComputedStyle(entering).animationName : null,
              };
            });
            if (!transition.entering || !transition.exiting || !transition.wrapping) {
              throw new Error("Directional card animation roles missing: " + JSON.stringify(transition));
            }
            if (transition.animation !== "carousel-panel-enter") {
              throw new Error("Moving project card has no entrance animation: " + JSON.stringify(transition));
            }
            if (await page.getByRole("button", { name: /Animar troca de cards|Desativar animação/ }).count()) {
              throw new Error("Obsolete carousel animation toggle is still visible.");
            }
            console.log(JSON.stringify({ variant: variant.name, transition }));
            await page.waitForTimeout(900);
          }
          const geometry = await carousel.evaluate(stage => {
            const panel = stage.querySelector(".cinematic-panel.carousel-center");
            if (!panel) return null;
            const bounds = panel.getBoundingClientRect();
            const frame = stage.getBoundingClientRect();
            return {
              active: panel.getAttribute("data-project-id"),
              left: bounds.left,
              right: bounds.right,
              width: bounds.width,
              frameLeft: frame.left,
              frameRight: frame.right,
              frameWidth: frame.width,
            };
          });
          if (!geometry || geometry.width < 180 ||
              geometry.left < geometry.frameLeft - 3 ||
              geometry.right > geometry.frameRight + 3) {
            throw new Error("Mobile carousel card clipped after navigation: " + JSON.stringify(geometry));
          }
          console.log(JSON.stringify({ variant: variant.name, carousel: geometry.active, geometry: "inside viewport" }));
        }

        // Mobile regression: BOTH neighboring cards must remain level with
        // the carousel centre, on the correct left/right side. In the real
        // Opera screenshot the previous project sat below AND to the right
        // after an active-card tap. Legacy orbit-grid rules caused stacking.
        // Force sticky :hover/:focus-visible on both side cards, with and
        // without reduced motion, then confirm their physical rectangles.
        const cdp = await context.newCDPSession(page);
        try {
          await cdp.send("DOM.enable");
          await cdp.send("CSS.enable");
          for (const side of ["left", "right"]) {
            const root = await cdp.send("DOM.getDocument");
            const selected = await cdp.send("DOM.querySelector", {
              nodeId: root.root.nodeId,
              selector: ".spine-stage.project-carousel .arc-carousel .cinematic-panel.carousel-" + side,
            });
            if (!selected.nodeId) throw new Error("Missing " + side + " neighboring project card");
            for (const pseudo of [[], ["hover"], ["focus-visible"]]) {
              await cdp.send("CSS.forcePseudoState", {
                nodeId: selected.nodeId, forcedPseudoClasses: pseudo,
              });
              const layout = await carousel.evaluate((stage, targetSide) => {
                const item = stage.querySelector(".cinematic-panel.carousel-" + targetSide);
                if (!item) return null;
                const frame = stage.getBoundingClientRect();
                const rect = item.getBoundingClientRect();
                return {
                  project: item.getAttribute("data-project-id"),
                  xDelta: (rect.left + rect.width / 2) - (frame.left + frame.width / 2),
                  yDelta: (rect.top + rect.height / 2) - (frame.top + frame.height / 2),
                  position: getComputedStyle(item).position,
                  transform: getComputedStyle(item).transform,
                };
              }, side);
              if (!layout || layout.position !== "absolute" || Math.abs(layout.yDelta) > 20 ||
                (side === "left" && layout.xDelta > -70) ||
                (side === "right" && layout.xDelta < 70)) {
                throw new Error("Misplaced " + side + " card, pseudo=" + pseudo + ": " + JSON.stringify(layout));
              }
              console.log(JSON.stringify({variant: variant.name, side, pseudo, geometry: "aligned", project: layout.project}));
            }
            await cdp.send("CSS.forcePseudoState", {
              nodeId: selected.nodeId, forcedPseudoClasses: [],
            });
          }
        } finally {
          await cdp.detach();
        }
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
