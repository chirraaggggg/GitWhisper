import type { Context } from "hono";
import { Webhooks } from "@octokit/webhooks";
import { getPullRequestFiles } from "./pullRequests";
import { postReviewComment } from "./comments";
import { analyzeCode } from "../ai/analyzer";
import { env } from "../shared/env";
import { logger } from "../shared/logger";
import { isRateLimited } from "../shared/ratelimiter";

// Created once when server starts — not on every request
const webhooks = new Webhooks({
  secret: env.GITHUB_WEBHOOK_SECRET,
});

async function processReview(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number
) {
  try {
    // RISKY — GitHub API call, can fail entirely
    const files = await getPullRequestFiles(owner, repo, pullNumber, installationId);

    let fullReview = "";

    for (const file of files) {
      if (!file.patch) continue;

      try {
        // RISKY — Groq API call, can fail per file
        const review = await analyzeCode(file.filename, file.status, file.patch);
        fullReview += `### ${file.filename}\n${review}\n\n`;
      } catch (err) {
        // one file failed — log it, add fallback, keep going
        logger.error(`Failed to analyze ${file.filename}:`, err);
        fullReview += `### ${file.filename}\n> Could not analyze this file.\n\n`;
      }
    }

    if (!fullReview) {
      logger.info(`No reviewable files in PR #${pullNumber}`);
      return;
    }

    // RISKY — GitHub API call, can fail
    await postReviewComment(owner, repo, pullNumber, fullReview, installationId);
    logger.info(`Review posted for PR #${pullNumber}`);

  } catch (err) {
    // entire operation failed — log and give up
    logger.error(`Failed to process PR #${pullNumber}:`, err);
  }
}

export async function handleWebhook(c: Context) {
  // Step 1 — read raw body as text (needed for signature verification)
  const body = await c.req.text();

  // Step 2 — get the signature GitHub sent
  const signature = c.req.header("x-hub-signature-256");

  // Step 3 — reject if signature is missing
  if (!signature) {
    logger.warn("Missing signature — request rejected");
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Step 4 — verify signature matches
  const isValid = await webhooks.verify(body, signature);
  if (!isValid) {
    logger.warn("Invalid signature — request rejected");
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Step 5 — safe to parse now
  const payload = JSON.parse(body);

  if (payload.action !== "opened" && payload.action !== "synchronize") {
    logger.info(`Skipping PR #${payload.pull_request.number}`);
    return c.json({ skipped: true });
  }

  const installationId = payload.installation.id;
  const { number, base } = payload.pull_request;
  const owner = base.repo.owner.login;
  const repo = base.repo.name;

  logger.info(`PR #${number} on ${owner}/${repo}`);

  // Fire and forget — respond immediately

  const rateLimitKey = `${owner}/${repo}`;
if (isRateLimited(rateLimitKey, 60000)) {
  logger.warn(`Rate limited: ${rateLimitKey}`);
  return c.json({ skipped: true, reason: "rate limited" });
}

processReview(installationId, owner, repo, number);

  return c.json({ success: true });
}