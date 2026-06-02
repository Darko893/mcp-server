# Haunt API MCP Server

> Current package note
>
> Use the current public NPM package `@hauntapi/mcp-server` and canonical repo: https://github.com/Darko893/mcp-server.
> This repository remains public because old MCP directories, including Glama, may still index it.

Haunt turns permitted public web pages into structured JSON for Claude, Cursor, Windsurf, and other MCP-compatible agents.

## Capability boundaries

Haunt does **not** promise universal extraction, Cloudflare bypass, CAPTCHA solving, login-wall access, paywall access, or anti-bot circumvention. It works best on permitted public pages and supported rendered pages. When a page is blocked, login-required, CAPTCHA-gated, or too thin to verify, Haunt should return a clear failure signal instead of fabricated data.

## Quick Start

For new installs, use the current package:

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

Get a free API key at [hauntapi.com](https://hauntapi.com/#signup). Free tier: 100 successful requests/month, no credit card needed.

## Tools

### `extract_url`

Extract structured data from permitted public web pages. Provide a URL and a plain-English prompt describing what you want. Supported JavaScript-rendered pages can work, but blocked, CAPTCHA-gated, login-required, paywalled, or restricted pages should return explicit errors rather than guessed data.

```text
Extract the product name, price, and availability from https://example.com/product
```

### `extract_article`

Extract article fields from news, blog, and editorial pages. Returns title, body text, author, and publish date when available.

```text
Extract the article content from https://example.com/blog/post
```

### `extract_metadata`

Pull metadata from permitted public URLs: title, description, Open Graph tags, Twitter cards, and canonical URL.

```text
Get the Open Graph metadata for https://example.com
```

## Pricing

| Plan | Successful requests | Price |
|------|---------------------|-------|
| Free | 100/mo | £0 |
| Starter | 5,000/mo | £19/mo |
| Pro | 25,000/mo | £49/mo |
| Scale | 75,000/mo | £99/mo |

Upgrade: https://hauntapi.com/#pricing

## Links

- Website: https://hauntapi.com
- API Docs: https://hauntapi.com/docs
- Get API Key: https://hauntapi.com/#signup
- Current repo: https://github.com/Darko893/mcp-server
