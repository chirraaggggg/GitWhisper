import "dotenv/config";

export const env = {
  GITHUB_APP_ID: process.env.GITHUB_APP_ID!,
  GITHUB_PRIVATE_KEY_PATH: process.env.GITHUB_PRIVATE_KEY_PATH!,
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET!,
  GROQ_API_KEY: process.env.GROQ_API_KEY!,
};