import { Octokit } from "@octokit/rest";
import { env } from "../shared/env";

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

export async function postReviewComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
) {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body,
  });

  console.log(`Comment posted to PR #${pullNumber}`);
}