import type { Context } from "hono";
import { getPullRequestFiles } from "./pullRequests";

export async function handleWebhook(c: Context) {
  const payload = await c.req.json();

  if (payload.action !== "opened" && payload.action !== "synchronize") {
    return c.json({ skipped: true });
  }

  const { number, base } = payload.pull_request;
  const owner = base.repo.owner.login;
  const repo = base.repo.name;

  const files = await getPullRequestFiles(owner, repo, number);

  console.log(`Changed files (${files.length}):`);
  for (const file of files) {
    console.log(`  [${file.status}] ${file.filename}`);
  }

  return c.json({ success: true, filesReviewed: files.length });
}