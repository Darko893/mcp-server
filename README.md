# Haunt API MCP Server

Extract clean, structured data from any URL — directly from Claude, Cursor, or any MCP-compatible AI.

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
Extract clean data from any URL. Handles JavaScript rendering and Cloudflare bypass automatically.

```
Extract the article content from https://example.com/blog/post
```

### `extract_batch`
Extract from multiple URLs at once (up to 10).

```
Extract the title and price from these product pages: [url1, url2, url3]
```

### `extract_metadata`
Pull metadata: title, description, Open Graph tags, Twitter cards, canonical URL.

```
Get the Open Graph metadata for https://example.com
```

## Pricing
- Free: 100 requests/month
- Pro: $0.01/request (pay only for what you use)

## Links
- API Docs: https://hauntapi.com/docs
- Get API Key: https://hauntapi.com
- GitHub: https://github.com/hauntapi/mcp-server
