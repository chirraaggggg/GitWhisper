import { getPullRequestFiles } from "./github/pullRequests";
import { analyzeCode } from "./ai/analyzer";
import { postReviewComment } from "./github/comments";

const owner = "chirraaggggg";
const repo = "gitwhisperer-test";
const pullNumber = 1;

const files = await getPullRequestFiles(owner, repo, pullNumber);

let fullReview = "";

for (const file of files) {
  if (!file.patch) continue;
  const review = await analyzeCode(file.filename, file.status, file.patch);
  fullReview += `### ${file.filename}\n${review}\n\n`;
}

await postReviewComment(owner, repo, pullNumber, fullReview);