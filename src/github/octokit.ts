import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { readFileSync } from "fs";
import { env } from "../shared/env";

const privateKey = readFileSync(env.GITHUB_PRIVATE_KEY_PATH, "utf8");

export async function getInstallationOctokit(installationId: number) {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey,
      installationId,
    },
  });

  return octokit;
}