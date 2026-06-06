import Groq from "groq-sdk";
import { env } from "../shared/env";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export async function analyzeCode(
  filename: string,
  status: string,
  patch: string
): Promise<string> {
  const prompt = `You are an expert code reviewer. Review the following code change and provide concise, actionable feedback.

File: ${filename}
Status: ${status}

Diff:
${patch}

Focus on:
- Bugs or logic errors
- Security issues
- Performance problems
- Code quality and readability

Be concise. If the change looks good, say so. Don't be pedantic about minor style issues.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1000,
  });

return response.choices[0]?.message?.content ?? "No review generated.";}