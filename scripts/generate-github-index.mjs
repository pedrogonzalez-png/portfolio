#!/usr/bin/env node
/* global URL, process, fetch, AbortSignal, console */
/**
 * Build-time public GitHub tree index. No credentials are written to disk.
 * Exactly the manually allowlisted public repositories are fetched.
 * Failure is soft: the live readonly adapter remains operational.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";

const approved = JSON.parse(await readFile(new URL("../src/data/approved-repos.json", import.meta.url), "utf8"));
const permitted = ["abismo", "site-3d", "hyprland-themes"];
if (Object.keys(approved).sort().join(",") !== [...permitted].sort().join(",") ||
    !Object.values(approved).every((name) => /^pedrogonzalez-png\/[A-Za-z0-9_.-]+$/.test(name))) {
  throw new Error("Invalid manual allowlist; refusing index generation");
}

const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-approved-repo-index" };
if (process.env.GITHUB_TOKEN) headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;

async function github(endpoint) {
  const response = await fetch("https://api.github.com" + endpoint, {
    headers, signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("GitHub HTTP " + response.status);
  return response.json();
}

const repos = [];
for (const [repoId, repoFullName] of Object.entries(approved)) {
  try {
    const metadata = await github("/repos/" + repoFullName);
    const branch = metadata.default_branch;
    if (typeof branch !== "string" || !/^[A-Za-z0-9._/-]{1,130}$/.test(branch) ||
        branch.includes("..") || branch.startsWith("/")) throw new Error("Invalid default branch");
    const tree = await github("/repos/" + repoFullName + "/git/trees/" + encodeURIComponent(branch) + "?recursive=1");
    if (!Array.isArray(tree.tree) || !/^[a-f0-9]{40}$/.test(tree.sha)) throw new Error("Invalid Git tree");
    const entries = tree.tree.slice(0, 4000).filter((entry) =>
      (entry.type === "blob" || entry.type === "tree") &&
      typeof entry.path === "string" && !entry.path.startsWith("/") &&
      entry.path.split("/").every((part) => part && part !== "." && part !== "..") &&
      /^[a-f0-9]{40}$/.test(entry.sha)
    ).map((entry) => ({ path: entry.path, type: entry.type, sha: entry.sha,
      ...(Number.isSafeInteger(entry.size) ? { size: entry.size } : {}) }));
    repos.push({ repoId, repoFullName, branch, treeSha: tree.sha,
      truncated: Boolean(tree.truncated) || tree.tree.length > 4000, entries });
    console.log("Indexed", repoId, entries.length, "entries from", branch);
  } catch (error) {
    console.warn("No index for", repoId, "— live API fallback:", error.message);
  }
}
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await writeFile(new URL("../public/github-index.json", import.meta.url),
  JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), repos }) + "\n");
console.log("Index ready:", repos.length, "of", permitted.length, "repositories; zero source-file contents stored.");
