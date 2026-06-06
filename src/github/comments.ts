import { getInstallationOctokit } from "./octokit";

export async function postReviewComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string,
  installationId: number
) {
  const octokit = await getInstallationOctokit(installationId);

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body,
  });

  console.log(`Comment posted to PR #${pullNumber}`);
}