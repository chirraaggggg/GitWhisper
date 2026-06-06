import { getInstallationOctokit } from "./octokit";

export async function getPullRequestFiles(
  owner: string,
  repo: string,
  pullNumber: number,
  installationId: number
) {
  const octokit = await getInstallationOctokit(installationId);

  const response = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return response.data;
}