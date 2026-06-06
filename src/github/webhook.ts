import type { Context } from "hono";
import { getPullRequestFiles } from "./pullRequests";
import { postReviewComment } from "./comments";
import { analyzeCode } from "../ai/analyzer";

export async function handleWebhook(c: Context) {
  const payload = await c.req.json();

  if (payload.action !== "opened" && payload.action !== "synchronize") {
    return c.json({ skipped: true });
  }

  const installationId = payload.installation.id;
  const { number, base } = payload.pull_request;
  const owner = base.repo.owner.login;
  const repo = base.repo.name;

  console.log(`PR #${number} on ${owner}/${repo}`);

  const files = await getPullRequestFiles(owner, repo, number, installationId);

  let fullReview = "";

  for (const file of files) {
    if (!file.patch) continue;
    const review = await analyzeCode(file.filename, file.status, file.patch);
    fullReview += `### ${file.filename}\n${review}\n\n`;
  }

  await postReviewComment(owner, repo, number, fullReview, installationId);

  return c.json({ success: true });
}