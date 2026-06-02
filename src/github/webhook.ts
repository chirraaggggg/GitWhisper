import type { Context } from "hono";
import { getPullRequestFiles } from "./pullRequests";
import { analyzeCode } from "../ai/analyzer";

export async function handleWebhook(c: Context) {
  const payload = await c.req.json();

  if (payload.action !== "opened" && payload.action !== "synchronize") {
    return c.json({ skipped: true });
  }

  const { number, base } = payload.pull_request;
  const owner = base.repo.owner.login;
  const repo = base.repo.name;

  console.log(`PR #${number} on ${owner}/${repo}`);

  const files = await getPullRequestFiles(owner, repo, number);

  for (const file of files) {
    if (!file.patch) continue; // skip files with no diff

    console.log(`\nReviewing ${file.filename}...`);
    const review = await analyzeCode(file.filename, file.status, file.patch);
    console.log(review);
  }

  return c.json({ success: true });
}