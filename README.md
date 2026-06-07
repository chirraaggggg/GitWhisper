# git-whisper

> Instant AI code reviews on every pull request. GitWhisperer catches bugs, security issues, and performance problems before your code ships.

**[Install on GitHub](https://github.com/apps/git-whisper/installations/new)** · **[Landing Page](https://chirraaggggg.github.io/GitWhisper/)**

---

## What it does

git-whisper is a GitHub App that automatically reviews pull requests the moment they open. It reads the actual diff, sends it to an LLM, and posts a structured code review as a comment — in seconds, with zero configuration.

No new tools to learn. No CLI to run. Just open a PR and get a review.

---

## How it works

```
Pull Request Opened
        ↓
GitHub sends webhook to git-whisper
        ↓
Server responds immediately (fire-and-forget)
        ↓
Fetch changed files via GitHub API
        ↓
Build diff context per file
        ↓
Send to Groq (Llama 3.3 70B)
        ↓
Post structured review as PR comment
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Web framework | Hono |
| GitHub API | Octokit |
| Auth | GitHub App — JWT + installation tokens |
| AI | Groq — Llama 3.3 70B |
| Deployment | Render |
| Landing page | GitHub Pages |

---

## Architecture decisions

**GitHub App over Personal Access Token**
GitHub Apps use JWT authentication exchanged for per-installation tokens. This means the app works for any user who installs it — not just the developer who built it.

**Fire-and-forget async processing**
GitHub requires a webhook response within 10 seconds. Since AI inference + GitHub API calls exceed this, the server responds immediately and processes the review asynchronously in the background.

**Domain-based folder structure**
Code is organized by responsibility (`github/`, `ai/`, `shared/`) rather than technical layers. Each domain owns its API interactions, making the codebase easy to extend.

**Private key as environment variable**
Cloud deployments can't use file paths. The GitHub App private key is stored as an environment variable string, making it compatible with any hosting platform.

---

## Project structure

```
src/
├── ai/
│   └── analyzer.ts        # Groq API calls + prompt generation
├── github/
│   ├── webhook.ts          # Webhook handler + async orchestration
│   ├── pullRequests.ts     # Fetch PR files via Octokit
│   ├── comments.ts         # Post review comments to PRs
│   └── octokit.ts          # GitHub App auth + Octokit factory
├── shared/
│   └── env.ts              # Environment variable validation
└── index.ts                # Server entry point + route registration
```

---

## Local development

**Prerequisites:** Bun, a GitHub App, a Groq API key

**1. Clone the repo**
```bash
git clone https://github.com/chirraaggggg/GitWhisperer.git
cd GitWhisperer
bun install
```

**2. Set up environment variables**
```bash
cp .env.example .env
```

Fill in your `.env`:
```env
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GROQ_API_KEY=your_groq_api_key
```

**3. Start the server**
```bash
bun src/index.ts
```

**4. Expose locally with ngrok**
```bash
ngrok http 3000
```

Set your GitHub App's webhook URL to `https://your-ngrok-url.ngrok-free.app/webhook`.

---

## Roadmap

- [x] Webhook receiver
- [x] PR diff fetching
- [x] AI-powered review generation
- [x] Automated comment posting
- [x] GitHub App authentication
- [x] Production deployment
- [ ] Webhook signature verification
- [ ] Inline PR comments (line-level)
- [ ] Multi-file context awareness
- [ ] Security-focused review mode

---

## Built by

**Chirag Sharma** — [github.com/chirraaggggg](https://github.com/chirraaggggg)
