#!/usr/bin/env node
/**
 * Builds the actual Abismo game in an isolated temporary checkout and places
 * its static production bundle at /abismo/ on the portfolio's own origin.
 *
 * Run once after cloning the portfolio:
 *   npm run sync:abismo
 *   npm run dev
 *
 * Never edits the original jogo-site repository. The pinned commit prevents
 * unintended changes in the embedded game when upstream main changes.
 */
import { mkdtemp, mkdir, rm, cp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { URL, fileURLToPath } from "node:url";
import process from "node:process";
import { execFileSync } from "node:child_process";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEST = join(ROOT, "public", "abismo");
const REPO = "https://github.com/pedrogonzalez-png/jogo-site.git";
const REVISION = "c6f7d13b340a6a8a57f8d6e2d883f93711dae8a7";

const run = (cmd, args, cwd) => {
  execFileSync(cmd, args, {
    cwd, stdio: "inherit", shell: false,
    env: { ...process.env, CI: "true" },
  });
};

const scratch = await mkdtemp(join(tmpdir(), "portfolio-abismo-"));
const game = join(scratch, "jogo-site");
try {
  await mkdir(game);
  process.stdout.write("Buscando a versão fixada do Abismo…\n");
  run("git", ["init", "-q"], game);
  run("git", ["remote", "add", "origin", REPO], game);
  run("git", ["fetch", "-q", "--depth", "1", "origin", REVISION], game);
  run("git", ["checkout", "-q", "--detach", "FETCH_HEAD"], game);

  process.stdout.write("Instalando dependências e compilando o jogo…\n");
  run("npm", ["ci", "--no-audit", "--no-fund"], game);
  run("npm", ["run", "build", "--", "--base=/abismo/"], game);

  const source = join(game, "dist");
  const html = await readFile(join(source, "index.html"), "utf8");
  if (!html.includes("/abismo/assets/")) {
    throw new Error("O build não usa /abismo/ como base. Nenhum arquivo foi instalado.");
  }

  // Only replace public output after the entire upstream build has succeeded.
  await rm(DEST, { recursive: true, force: true });
  await mkdir(DEST, { recursive: true });
  await cp(source, DEST, { recursive: true });
  const entry = join(DEST, "index.html");
  const built = await readFile(entry, "utf8");
  await writeFile(entry, built.replaceAll('href="/favicon.svg"', 'href="/abismo/favicon.svg"'));
  await writeFile(join(DEST, "ready.json"), JSON.stringify({
    build: "abismo",
    revision: REVISION,
    base: "/abismo/",
  }, null, 2) + "\n");
  process.stdout.write("Abismo instalado em public/abismo/. Abra o card do jogo no portfólio.\n");
} catch (error) {
  process.stderr.write("Não foi possível sincronizar o Abismo: " + String(error) + "\n");
  process.exitCode = 1;
} finally {
  await rm(scratch, { recursive: true, force: true });
}
