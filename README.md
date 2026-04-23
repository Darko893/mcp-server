# Haunt API MCP Server

Give Claude, Cursor, Windsurf, and other MCP-compatible agents a clean web extraction tool.

Haunt turns messy public web pages into structured JSON using natural-language prompts. It is built for agent workflows that need product data, competitor pricing, article content, metadata, lead lists, research snippets, or any other web data without maintaining brittle selectors.

## Quick Start

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

## Tools

### `extract_url`

General-purpose extraction from any web page.

Use it for:

- Product names, prices, stock status, reviews
- Competitor pricing pages
- Directories and lead lists
- Job boards
- Research pages
- Any page where you want clean JSON instead of HTML

### `extract_article`

Extract article fields from news, blog, and editorial pages.

Returns title, body text, author, and publish date when available.

### `extract_metadata`

Extract page metadata including title, description, Open Graph tags, Twitter Card tags, canonical URL, and related metadata.

## Why Haunt

- Natural-language prompts instead of fragile CSS selectors
- Browser rendering for JavaScript-heavy pages
- Cloudflare/anti-bot handling via the Haunt API backend
- Clean JSON output for agents, databases, and workflows
- Free tier for testing

## Pricing

| Plan | Requests | Price |
|------|----------|-------|
| Free | 100/mo | £0 |
| Starter | 1,000/mo | £19/mo |
| Pro | 5,000/mo | £49/mo |
| Scale | 15,000/mo | £99/mo |

Upgrade: https://hauntapi.com/#pricing

## Links

- Website: https://hauntapi.com
- Docs: https://hauntapi.com/docs
- Get API key: https://hauntapi.com/#signup
- GitHub: https://github.com/Darko893/mcp-server
