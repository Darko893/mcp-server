# Haunt API MCP Server

Extract clean, structured data from any URL — directly from Claude, Cursor, Windsurf, or any MCP-compatible AI.

## Quick Start

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

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

Get a free API key at [hauntapi.com](https://hauntapi.com) — 100 requests/month, no credit card needed.

## Tools

### `extract_url`
Extract structured data from any web page. Provide a URL and a plain-English prompt describing what you want. Handles JavaScript rendering and Cloudflare bypass automatically.

```
Extract the product name, price, and availability from https://example.com/product
```

### `extract_article`
Extract the main article content from a news article or blog post. Returns title, body text, author, and publish date.

```
Extract the article content from https://example.com/blog/post
```

### `extract_metadata`
Pull metadata from any URL: title, description, Open Graph tags, Twitter cards, canonical URL.

```
Get the Open Graph metadata for https://example.com
```

## Pricing

| Plan | Requests | Price |
|------|----------|-------|
| Free | 100/mo | £0 |
| Starter | 1,000/mo | £19/mo |
| Pro | 5,000/mo | £49/mo |
| Scale | 15,000/mo | £99/mo |

## Links

- Website: https://hauntapi.com
- API Docs: https://hauntapi.com/docs
- Get API Key: https://hauntapi.com/#signup
