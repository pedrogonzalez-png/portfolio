#!/usr/bin/env node
/* global console, process, setTimeout, fetch */
/**
 * One-off G1 candidate audit. No changes to the interactive THE CORE.
 * The actual public CC0 GLB is downloaded in the workflow (not fake meshes).
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const host="http://127.0.0.1:4178";
const out="browser-diagnostics/the-core-v2-g1";
const preview=spawn(process.execPath,["node_modules/vite/bin/vite.js",
  "--host","127.0.0.1","--port","4178","--strictPort"],{
    env:{...process.env,CI:"true"},
    stdio:["ignore","pipe","pipe"],
});
preview.stdout.on("data",data=>console.log("VITE "+String(data)));
preview.stderr.on("data",data=>console.error("VITE "+String(data)));
let browser;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try {
  await mkdir(out,{recursive:true});
  let up=false;
  for(let i=0;i<120;i++){
    if(preview.exitCode!==null)throw Error("Vite exited early");
    try {const r=await fetch(host+"/the-core-v2-g1-viewer.html");
      if(r.ok){up=true;break;}} catch {}
    await sleep(250);
  }
  if(!up) throw Error("Vite did not start");
  browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"]});
  const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror",e=>errors.push("PAGEERROR "+e.message));
  page.on("console",msg=>{if(msg.type()==="error")errors.push("CONSOLE "+msg.text());});
  page.on("response",r=>{
    if(r.url().includes("candidate-open-case.glb"))
      console.log("ASSET "+r.status()+" "+r.url());
  });
  await page.goto(host+"/the-core-v2-g1-viewer.html",{waitUntil:"domcontentloaded",timeout:45000});
  await page.waitForFunction(()=>window.__g1Ready===true||Boolean(window.__g1Error),
    null,{timeout:120000});
  const state=await page.evaluate(()=>({info:window.__g1Info,error:window.__g1Error}));
  if(state.error)throw Error("GLB loader error "+state.error);
  if(!state.info||state.info.meshes<4||state.info.triangles<1000)
    throw Error("Unexpected tiny/empty GLB: "+JSON.stringify(state));
  const b=state.info.boundsMeters;
  if(![b.x,b.y,b.z].every(v=>v>0.20&&v<0.85))
    throw Error("Unrealistic geometry bounds: "+JSON.stringify(b));
  const names=["front","side","top","rear"];
  for(const name of names){
    await page.evaluate(view=>window.__setView(view),name);
    await page.waitForTimeout(450);
    await page.screenshot({path:out+"/"+name+".png",animations:"disabled"});
    console.log("RENDERED "+name);
  }
  const audit={timestamp:new Date().toISOString(),asset:"open-mid-tower-pc-case-089c34c8",
    publisher:"Innerscene",license:"CC0 (publisher declaration)",
    dimensionsMeters:b,meshCount:state.info.meshes,triangles:state.info.triangles,
    materialCount:state.info.materialCount,hasSeparateNodeNames:state.info.hasSeparateNodeNames,
    sampleNodes:state.info.nodes,screenshots:names.map(n=>n+".png"),errors,
    notes:[
      "Renders from the downloaded GLB, not AI-generated reference images.",
      "A camera view does not verify radiator 360 mm clearance or pivot separability.",
      "Measurements reflect GLB bounding box including the opened glass side.",
      "Do not integrate this candidate before visual review and fit check.",
    ]};
  await writeFile(out+"/audit.json",JSON.stringify(audit,null,2));
  console.log("AUDIT "+JSON.stringify({meshes:audit.meshCount,triangles:audit.triangles,
    materialCount:audit.materialCount,bounds:audit.dimensionsMeters}));
  if(errors.some(e=>e.startsWith("PAGEERROR")))throw Error(errors.join("; "));
}finally{
  await browser?.close();
  preview.kill("SIGTERM");
}
