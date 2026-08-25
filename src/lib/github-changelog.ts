import { execFile } from "node:child_process";
import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { unstable_cache } from "next/cache";

export const GITHUB_CHANGELOG_CACHE_TAG = "github-changelog";
const exec = promisify(execFile);
const repository = process.env.GITHUB_REPOSITORY?.trim() || "ER0T1/LabCamp";
const repositoryUrl = `https://github.com/${repository}`;
const cacheDirectory = process.env.GITHUB_CACHE_DIR || "/app/storage/git/labcamp.git";
const requestedLimit = Number.parseInt(process.env.GITHUB_CHANGELOG_LIMIT || "50", 10);
const commitLimit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 50, 1), 500);

if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error("INVALID_GITHUB_REPOSITORY");

export type ChangedFile = { path: string; status: string; additions: number | null; deletions: number | null };
export type Commit = {
  hash: string; shortHash: string; author: string; authoredAt: string; subject: string; body: string;
  tags: string[]; additions: number; deletions: number; files: ChangedFile[];
};
export type Changelog = { repositoryUrl: string; generatedAt: string; head: string; commits: Commit[] };

async function git(args: string[], cwd?: string) {
  const result = await exec("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  return result.stdout.trim();
}

async function repositoryExists() {
  try { return await git(["-C", cacheDirectory, "rev-parse", "--is-bare-repository"]) === "true"; }
  catch { return false; }
}

async function ensureRepository() {
  await mkdir(path.dirname(cacheDirectory), { recursive: true });
  if (!(await repositoryExists())) {
    const temporaryDirectory = `${cacheDirectory}.tmp-${process.pid}`;
    await rm(temporaryDirectory, { recursive: true, force: true });
    try {
      await git(["clone", "--mirror", repositoryUrl, temporaryDirectory]);
      await rename(temporaryDirectory, cacheDirectory);
    } catch (error) {
      await rm(temporaryDirectory, { recursive: true, force: true });
      throw error;
    }
  }
  try { await git(["-C", cacheDirectory, "fetch", "--prune", "--tags", "origin"]); }
  catch (error) { if (!(await repositoryExists())) throw error; }
}

async function selectedRef() {
  const configured = process.env.GITHUB_CHANGELOG_REF?.trim();
  if (configured) return configured;
  const symbolic = await git(["-C", cacheDirectory, "symbolic-ref", "refs/remotes/origin/HEAD"]).catch(() => "");
  if (symbolic) return symbolic;
  return git(["-C", cacheDirectory, "rev-parse", "HEAD"]);
}

async function filesForCommit(hash: string) {
  const [statusOutput, statsOutput] = await Promise.all([
    git(["-C", cacheDirectory, "show", "--format=", "--name-status", "--find-renames", "--first-parent", hash]),
    git(["-C", cacheDirectory, "show", "--format=", "--numstat", "--find-renames", "--first-parent", hash]),
  ]);
  const statuses = new Map<string, string>();
  for (const line of statusOutput.split("\n")) {
    if (!line) continue;
    const [status, ...paths] = line.split("\t");
    const filePath = paths.at(-1);
    if (filePath) statuses.set(filePath, status);
  }
  if (!statsOutput) return [];
  return statsOutput.split("\n").filter(Boolean).map((line) => {
    const [added, deleted, ...pathParts] = line.split("\t");
    const filePath = pathParts.join("\t");
    return {
      path: filePath,
      status: statuses.get(filePath) ?? "M",
      additions: added === "-" ? null : Number(added),
      deletions: deleted === "-" ? null : Number(deleted),
    } satisfies ChangedFile;
  });
}

async function loadChangelog(): Promise<Changelog> {
  await ensureRepository();
  const ref = await selectedRef();
  const hashes = (await git(["-C", cacheDirectory, "rev-list", ref, "--date-order", `--max-count=${commitLimit}`])).split("\n").filter(Boolean);
  const commits: Commit[] = [];
  for (const hash of hashes) {
    const metadata = await git(["-C", cacheDirectory, "show", "-s", "--format=%H%x00%an%x00%aI%x00%s%x00%b", hash]);
    const [fullHash, author, authoredAt, subject, body = ""] = metadata.split("\0");
    const [files, tagOutput] = await Promise.all([
      filesForCommit(hash),
      git(["-C", cacheDirectory, "tag", "--points-at", hash]),
    ]);
    commits.push({
      hash: fullHash,
      shortHash: fullHash.slice(0, 7),
      author,
      authoredAt,
      subject,
      body: body.trim(),
      tags: tagOutput.split("\n").filter(Boolean),
      additions: files.reduce((sum, file) => sum + (file.additions ?? 0), 0),
      deletions: files.reduce((sum, file) => sum + (file.deletions ?? 0), 0),
      files,
    });
  }
  return { repositoryUrl, generatedAt: new Date().toISOString(), head: commits[0]?.hash ?? "", commits };
}

export const getGitHubChangelog = unstable_cache(
  loadChangelog,
  ["github-changelog", repository, String(commitLimit)],
  { revalidate: 86_400, tags: [GITHUB_CHANGELOG_CACHE_TAG] },
);
