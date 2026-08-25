"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GITHUB_CHANGELOG_CACHE_TAG } from "@/lib/github-changelog";

export async function refreshGitHubChangelog() {
  const session = await auth();
  if (!session?.user || session.user.role === "MEMBER") throw new Error("FORBIDDEN");
  updateTag(GITHUB_CHANGELOG_CACHE_TAG);
  redirect("/admin/update-logs?updated=1");
}
