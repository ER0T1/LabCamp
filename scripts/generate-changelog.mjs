import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const outputPath = new URL("../src/generated/github-commits.json", import.meta.url);

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
}

function repositoryUrl() {
  try {
    return git(["remote", "get-url", "origin"])
      .replace(/^git@github\.com:/, "https://github.com/")
      .replace(/\.git$/, "");
  } catch {
    return "";
  }
}

function fileStatusByPath(hash) {
  const statuses = new Map();
  const output = git(["show", "--format=", "--name-status", "--find-renames", "--first-parent", hash]);
  for (const line of output.split("\n")) {
    if (!line) continue;
    const [status, ...paths] = line.split("\t");
    const path = paths.at(-1);
    if (path) statuses.set(path, status);
  }
  return statuses;
}

function filesForCommit(hash) {
  const statuses = fileStatusByPath(hash);
  const output = git(["show", "--format=", "--numstat", "--find-renames", "--first-parent", hash]);
  if (!output) return [];
  return output.split("\n").filter(Boolean).map((line) => {
    const [added, deleted, ...pathParts] = line.split("\t");
    const path = pathParts.join("\t");
    return {
      path,
      status: statuses.get(path) ?? "M",
      additions: added === "-" ? null : Number(added),
      deletions: deleted === "-" ? null : Number(deleted),
    };
  });
}

function generate() {
  const hashes = git(["rev-list", "HEAD", "--date-order"]).split("\n").filter(Boolean);
  const commits = hashes.map((hash) => {
    const [fullHash, author, authoredAt, subject, body] = git([
      "show", "-s", "--format=%H%x00%an%x00%aI%x00%s%x00%b", hash,
    ]).split("\0");
    const files = filesForCommit(hash);
    const tags = git(["tag", "--points-at", hash]).split("\n").filter(Boolean);
    return {
      hash: fullHash,
      shortHash: fullHash.slice(0, 7),
      author,
      authoredAt,
      subject,
      body: body.trim(),
      tags,
      additions: files.reduce((sum, file) => sum + (file.additions ?? 0), 0),
      deletions: files.reduce((sum, file) => sum + (file.deletions ?? 0), 0),
      files,
    };
  });
  const result = {
    repositoryUrl: repositoryUrl(),
    generatedAt: commits[0]?.authoredAt ?? "1970-01-01T00:00:00.000Z",
    head: git(["rev-parse", "HEAD"]),
    commits,
  };
  mkdirSync(new URL("../src/generated/", import.meta.url), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`Generated changelog for ${commits.length} commits.\n`);
}

try {
  generate();
} catch (error) {
  process.stderr.write(`Changelog generation skipped: ${error instanceof Error ? error.message : String(error)}\n`);
}
