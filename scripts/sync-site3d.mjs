#!/usr/bin/env node
/**
 * Isolated, pinned build of the REAL site-3D repository.
 * No files are changed in its original repository.
 *
 * Run after cloning the portfolio:
 *   npm run sync:site3d
 *   npm run dev
 *
 * For production deployment:
 *   npm run sync:site3d && npm run build
 */
import { mkdtemp, mkdir, rm, cp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { URL, fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import process from "node:process";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEST = join(ROOT, "public", "site-3d");
const REPO = "https://github.com/pedrogonzalez-png/site-3D.git";
const REVISION = "25db8b7898d1365901aad236837e3a9bd8edf64f";

const run = (cmd, args, cwd) => execFileSync(cmd, args, {
  cwd, stdio: "inherit", shell: false, env: { ...process.env, CI: "true" },
});

const temp = await mkdtemp(join(tmpdir(), "portfolio-site3d-"));
const sourceRepo = join(temp, "site-3D");

try {
  await mkdir(sourceRepo);
  process.stdout.write("Buscando versão fixada do site-3D…\n");
  run("git", ["init", "-q"], sourceRepo);
  run("git", ["remote", "add", "origin", REPO], sourceRepo);
  run("git", ["fetch", "-q", "--depth", "1", "origin", REVISION], sourceRepo);
  run("git", ["checkout", "-q", "--detach", "FETCH_HEAD"], sourceRepo);

  process.stdout.write("Compilando o projeto original com Vite…\n");
  run("npm", ["ci", "--no-audit", "--no-fund"], sourceRepo);
  run("npm", ["run", "build", "--", "--base=/site-3d/"], sourceRepo);

  const dist = join(sourceRepo, "dist");
  const html = await readFile(join(dist, "index.html"), "utf8");
  if (!html.includes("/site-3d/assets/")) {
    throw new Error("A compilação não respeitou a base /site-3d/.");
  }

  // Do not delete the previous build unless the new build succeeded.
  await rm(DEST, { recursive: true, force: true });
  await mkdir(DEST, { recursive: true });
  await cp(dist, DEST, { recursive: true });
  await writeFile(join(DEST, "ready.json"), JSON.stringify({
    build: "site-3d",
    revision: REVISION,
    base: "/site-3d/",
  }, null, 2) + "\n");
  process.stdout.write("site-3D disponível em public/site-3d/. Abra seu card no portfólio.\n");
} catch (error) {
  process.stderr.write("Falha ao preparar site-3D: " + String(error) + "\n");
  process.exitCode = 1;
} finally {
  await rm(temp, { recursive: true, force: true });
}
