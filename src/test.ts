import { getPullRequestFiles } from "./github/pullRequests";
import { analyzeCode } from "./ai/analyzer";

const files = await getPullRequestFiles("chirraaggggg", "gitwhisperer-test", 1);

for (const file of files) {
  if (!file.patch) continue;

  console.log(`\n--- Review for ${file.filename} ---`);
  const review = await analyzeCode(file.filename, file.status, file.patch);
  console.log(review);
}