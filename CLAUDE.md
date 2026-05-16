# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — runs `node server.js`, the Express chat backend (defaults to port 3000; Render sets `PORT=10000`).
- `node ingest.js` — one-shot script that re-crawls the Voltus site and overwrites `business_knowledge.txt`. Run this whenever the source site changes; the server only re-reads the file on restart.
- No test suite is configured (`npm test` is a placeholder that exits 1).

## Required environment

`.env` (gitignored) must define:
- `OPENAI_API_KEY` — used by `server.js` for chat completions.
- `FIRECRAWL_API_KEY` — used by `ingest.js` for the crawl.

## Architecture

Two-process design with a file as the contract between them:

1. **`ingest.js` (offline, manual)** — uses `@mendable/firecrawl-js` to crawl `https://voltus.tr/` (limit 20 pages, markdown format), concatenates each page as `--- SOURCE: <url> ---\n<markdown>`, and writes the result to `business_knowledge.txt`. Note: the `if (crawlResponse.success)` check is currently hardcoded to `if (true)` — the response shape from Firecrawl's `crawl` method should be re-verified before relying on that branch.

2. **`server.js` (runtime)** — loads `business_knowledge.txt` **once at startup** with `fs.readFileSync` into the `businessKnowledge` constant, then injects it into the system prompt of every `/chat` request. Changes to `business_knowledge.txt` are not picked up until the server restarts.

The `/chat` endpoint follows the Deep Chat widget contract:
- Request: `{ messages: [{ text, role }, ...] }` — only the **last** message's `text` is forwarded to OpenAI. There is no multi-turn history sent to the model.
- Response: `{ text: "..." }` — Deep Chat requires this exact shape.
- Model: `gpt-4o-mini`. System prompt instructs Turkish-by-default replies and a "say I don't know + offer human handoff" fallback when context is missing.

`index.html` is served statically from the project root (via `express.static(__dirname)`) and embeds the Deep Chat web component pointed at `/chat`. The frontend and backend are intentionally same-origin in production.

## Deployment

Hosted on Render. The `PORT` env var is supplied by the host; the listen call falls back to 3000 for local dev.
