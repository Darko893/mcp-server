# Haunt API MCP Server

This is the canonical public MCP package working tree for `@hauntapi/mcp-server` and GitHub `Darko893/mcp-server`. The live Haunt API app/site lives separately in `/root/haunt`. Do not confuse this with `/root/haunt/mcp-server`, which is a legacy/local copy inside the app repo.

Give Claude, Cursor, Windsurf, and other MCP-compatible agents a clean web extraction tool.

Haunt turns permitted public web pages into structured JSON using natural-language prompts. It is built for agent workflows that need product data, competitor pricing, article content, metadata, lead lists, research snippets, or other visible web data without maintaining brittle selectors.

## Quick Start

### One-command agent setup

For the clean CLI path, run:

```bash
npx -y @hauntapi/haunt-cli@latest init
```

If you already have a Haunt API key:

```bash
HAUNT_API_KEY=PASTE_YOUR_KEY_HERE npx -y @hauntapi/haunt-cli@latest init
```

The CLI prints the MCP config for Claude, Cursor, Windsurf, and other MCP-compatible clients. It does not edit config files for you.

### 1. Prove the MCP package is wired in, no key needed

Install the MCP server and call `try_demo_extract` first. It returns the demo, docs, signup, pricing, and free-tier links without using credits.

```text
Use Haunt's try_demo_extract tool and show me the signup and docs links.
```

### 2. Add a free API key for live extraction

Get a free API key: https://hauntapi.com/#signup

Add this to your MCP client config:

```json
{
  "mcpServers": {
    "haunt": {
      "command": "npx",
      "args": ["-y", "@hauntapi/mcp-server"],
      "env": {
        "HAUNT_API_KEY": "your-api-key"
      }
    }
  }
}
```

Then ask your agent:

```text
Use Haunt to extract the product name, price, availability, and review count from https://example.com/product
```


## Capability boundaries

Haunt does **not** promise universal extraction, Cloudflare bypass, CAPTCHA solving, login-wall access, paywall access, or anti-bot circumvention. It works best on permitted public pages and supported rendered pages. When a page is blocked, login-required, CAPTCHA-gated, or too thin to verify, Haunt should return a clear failure signal instead of fabricated data.

## Tools

### `try_demo_extract`

No-key activation check. Returns Haunt's demo endpoint, docs, signup, pricing, MCP info route, and free-tier details. Use this first when a user has installed the MCP server but has not added `HAUNT_API_KEY` yet.

### `extract_url`

General-purpose extraction from permitted public web pages.

Use it for:

- Product names, prices, stock status, reviews
- Competitor pricing pages
- Directories and lead lists
- Job boards
- Research pages
- Supported permitted public pages where you want clean JSON instead of HTML

### `extract_article`

Extract article fields from news, blog, and editorial pages.

Returns title, body text, author, and publish date when available.

### `extract_metadata`

Extract page metadata including title, description, Open Graph tags, Twitter Card tags, canonical URL, and related metadata.

## Why Haunt

- Natural-language prompts instead of fragile CSS selectors
- Supported fetch paths for JavaScript-heavy pages
- Challenge-aware extraction with machine-readable verification signals (`error_code`, `captcha_provider`, `requires_human_verification`)
- Clean JSON output for agents, databases, and workflows
- Free tier for testing

## Pricing

| Plan | Credits | Price |
|------|---------|-------|
| Free | 1,000/mo | £0 |
| Starter | 10,000/mo | £19/mo |
| Pro | 30,000/mo | £49/mo |
| Scale | 80,000/mo | £99/mo |

Credits are not one-to-one requests. Simple public/non-LLM output usually uses 1 credit, normal structured extraction 2, browser-rendered or authenticated extraction 4, and heavy/screenshot extraction 8. Failed, blocked, login/CAPTCHA, provider, and server failures do not burn credits.

Upgrade: https://hauntapi.com/#pricing

## Links

- Website: https://hauntapi.com
- Docs: https://hauntapi.com/docs
- Get API key: https://hauntapi.com/#signup
- GitHub: https://github.com/Darko893/mcp-server
