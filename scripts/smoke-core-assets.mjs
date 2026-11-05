#!/usr/bin/env node
/* global process, setTimeout, fetch, URL, console */
/** Focused Chromium regression: the three CC0 GLBs really load at runtime. */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const origin = "http://127.0.0.1:4175";
const preview = spawn("node", ["node_modules/vite/bin/vite.js","preview","--host","127.0.0.1","--port","4175","--strictPort"],{
  stdio: ["ignore","pipe","pipe"], env:{...process.env, CI:"true"},
});
preview.stderr.on("data", data => process.stderr.write(data));
let browser;
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
try {
  for (let i = 0; i < 80; i++) {
    if (preview.exitCode !== null) throw new Error("Vite preview exited");
    try {
      const res = await fetch(origin);
      if (res.ok) break;
    } catch {/* continue */}
    if (i === 79) throw new Error("Vite preview never started");
    await sleep(250);
  }
  browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  const errors = [];
  const responses = {};
  page.on("pageerror", e => errors.push("PAGEERROR "+e.message));
  page.on("console", m => {if(m.type()==="error") errors.push("CONSOLE "+m.text());});
  page.on("requestfailed", req => {
    if(req.url().includes(".glb")) errors.push("ASSETFAILED "+req.url()+" "+req.failure()?.errorText);
  });
  page.on("response", response => {
    if(response.url().includes("/assets/the-core/") && response.url().includes(".glb"))
      responses[new URL(response.url()).pathname] = response.status();
  });

  await page.goto(origin,{waitUntil:"domcontentloaded",timeout:30000});
  await page.getByRole("region",{name:"Saberes — THE CORE"})
    .getByRole("button",{name:/Explorar THE CORE/}).click();
  const stage = page.getByRole("dialog",{name:"THE CORE — Laboratório interativo"})
    .locator(".core-scene");
  await stage.waitFor({state:"attached",timeout:15000});
  await mkdir("browser-diagnostics",{recursive:true});
  const started=Date.now();
  const keys=["data-gpu-model","data-case-model","data-board-model","data-psu-model"];
  let result={};
  for(let i=0;i<90;i++){
    result=await stage.evaluate((el,keys)=>Object.fromEntries(keys.map(k=>[k,el.getAttribute(k)])),keys);
    if(i%8===0) console.log("MODEL_STATES "+JSON.stringify({ms:Date.now()-started,...result}));
    if(keys.every(k=>result[k]==="glb"))break;
    if(keys.some(k=>result[k]==="fallback"))break;
    await sleep(500);
  }
  await page.screenshot({path:"browser-diagnostics/the-core-cc0-glbs.png"});
  console.log("FINAL "+JSON.stringify({result,responses,errors}));
  if(!keys.every(k=>result[k]==="glb"))
    throw new Error("Three self-hosted CC0 GLBs did not load: "+JSON.stringify({result,responses,errors}));
  if(errors.some(e=>e.startsWith("PAGEERROR ")||e.startsWith("ASSETFAILED ")))
    throw new Error("GLB test had runtime errors: "+errors.join("; "));

  // The initial didactic build uses DDR4, so its geometry intentionally stays
  // procedural. Verify the detailed DDR5 asset only with an AM5+DDR5 build.
  await page.evaluate(() => localStorage.setItem("portfolio.the-core.prototype.v1",JSON.stringify({
    build:{cpu:"r5-7600",motherboard:"b650",memory:"ddr5",gpu:"rx7600",psu:"gx700"},
    gap:12,
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.getByRole("region",{name:"Saberes — THE CORE"})
    .getByRole("button",{name:/Explorar THE CORE/}).click();
  const ramStage=page.getByRole("dialog",{name:"THE CORE — Laboratório interativo"})
    .locator(".core-scene");
  await ramStage.locator("canvas").waitFor({state:"attached",timeout:15000});
  await page.waitForFunction(() => document.querySelector(".core-scene")?.getAttribute("data-ram-model")==="glb",null,{timeout:45000});
  const ramState=await ramStage.getAttribute("data-ram-model");
  await page.screenshot({path:"browser-diagnostics/the-core-ddr5-cc0.png"});
  console.log("DDR5 "+JSON.stringify({ramState}));
  if(ramState!=="glb") throw new Error("Self-hosted DDR5 GLB did not load");
  if(errors.some(e=>e.startsWith("PAGEERROR ")||e.startsWith("ASSETFAILED ")))
    throw new Error("GLB test had runtime errors: "+errors.join("; "));
} finally {
  await browser?.close();
  preview.kill("SIGTERM");
}
