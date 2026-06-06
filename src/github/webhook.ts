import type { Context } from "hono";
import { getPullRequestFiles } from "./pullRequests";
import { postReviewComment } from "./comments";
import { analyzeCode } from "../ai/analyzer";

async function processReview(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const files = await getPullRequestFiles(owner, repo, pullNumber, installationId);

  let fullReview = "";
  for (const file of files) {
    if (!file.patch) continue;
    const review = await analyzeCode(file.filename, file.status, file.patch);
    fullReview += `### ${file.filename}\n${review}\n\n`;
  }

  await postReviewComment(owner, repo, pullNumber, fullReview, installationId);
  console.log(`Review posted for PR #${pullNumber}`);
}

export async function handleWebhook(c: Context) {
  const payload = await c.req.json();

  if (payload.action !== "opened" && payload.action !== "synchronize") {
    return c.json({ skipped: true });
  }

  const installationId = payload.installation.id;
  const { number, base } = payload.pull_request;
  const owner = base.repo.owner.login;
  const repo = base.repo.name;

  // Fire and forget — don't await
  processReview(installationId, owner, repo, number);

  return c.json({ success: true });
}