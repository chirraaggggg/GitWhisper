import { Octokit } from "@octokit/rest";
import { env } from "../shared/env";

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

export async function getPullRequestFiles(
  owner: string,
  repo: string,
  pullNumber: number
) {
  const response = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return response.data;
}