# Haunt API MCP Server

> Legacy directory listing note
>
> This repository is kept public because older MCP directories, including Glama, may still index it.
> For new installs, use the current public NPM package `@hauntapi/mcp-server`, the one-command CLI, or the hosted MCP endpoint.
>
> Canonical repo: https://github.com/Darko893/mcp-server

Haunt gives Claude, Cursor, Windsurf, and other MCP-compatible agents a clean web extraction tool: public URL → structured JSON or markdown instead of raw HTML.

## Current setup

### One-command agent setup

```bash
npx -y --package @hauntapi/cli@latest haunt-cli init
```

If you already have a Haunt API key:

```bash
HAUNT_API_KEY=PASTE_YOUR_KEY_HERE npx -y --package @hauntapi/cli@latest haunt-cli init
```

### Hosted MCP endpoint

```text
https://hauntapi.com/mcp/server
```

Transport: streamable HTTP JSON-RPC.

### Local MCP package

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

## Free tier

Get a free API key at [hauntapi.com](https://hauntapi.com/#signup).

Free tier: **1,000 credits/month, no credit card needed.**

Credits are not one-to-one requests. Simple public/non-LLM output usually uses 1 credit, normal structured extraction 2, browser-rendered extraction 4, and heavier extraction 8. Failed, blocked, login/CAPTCHA, provider, and server failures do not burn credits.

## Capability boundaries

Haunt does **not** promise universal extraction, CAPTCHA solving, login-wall access, paywall access, restricted-page access, or bot-challenge circumvention.

It works best on permitted public pages and supported rendered pages. When a page is blocked, login-required, CAPTCHA-gated, paywalled, restricted, or too thin to verify, Haunt returns a clear failure signal instead of fabricated data.

## Tools

### `try_demo_extract`

No-key activation check. Use this first to verify the MCP connection and see Haunt's demo/docs/signup links without using credits.

### `extract`

Extract structured data from a permitted public web page. Provide a URL and a plain-English prompt describing the fields you want.

Example prompt:

```text
Extract the product name, price, availability, and review count from https://example.com/product
```

The current package may also expose helper aliases such as `extract_url`, `extract_article`, and `extract_metadata` for client compatibility.

## Pricing

| Plan | Credits | Price |
|------|---------|-------|
| Free | 1,000/mo | £0 |
| Starter | 10,000/mo | £19/mo |
| Pro | 30,000/mo | £49/mo |
| Scale | 80,000/mo | £99/mo |

Upgrade: https://hauntapi.com/#pricing

## Links

- Website: https://hauntapi.com
- Docs: https://hauntapi.com/docs
- Agent setup: https://hauntapi.com/agents
- Hosted MCP info: https://hauntapi.com/mcp/server
- Get API key: https://hauntapi.com/#signup
- Current repo: https://github.com/Darko893/mcp-server
- Current NPM package: https://www.npmjs.com/package/@hauntapi/mcp-server
