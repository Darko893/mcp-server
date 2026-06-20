# haunt-cli

One-command Haunt setup for agents and MCP clients.

```bash
npx -y --package @hauntapi/cli@latest haunt-cli init
```

With a key:

```bash
HAUNT_API_KEY=PASTE_YOUR_KEY_HERE npx -y --package @hauntapi/cli@latest haunt-cli init
```

Or:

```bash
npx -y --package @hauntapi/cli@latest haunt-cli init --key PASTE_YOUR_KEY_HERE
```

The command prints a copy-paste MCP config for Claude, Cursor, Windsurf, and other MCP-compatible clients. It does not edit local config files for you.

## JSON output

```bash
npx -y --package @hauntapi/cli@latest haunt-cli init --format json
```

## What it installs

The generated config uses the public MCP server package:

```bash
npx -y @hauntapi/mcp-server
```

Use the `try_demo_extract` MCP tool first. It works without spending credits and shows the sample JSON/trace shape. Real extraction needs a Haunt API key from https://hauntapi.com/#signup. After adding `HAUNT_API_KEY`, use `extract` / `extract_url` for structured JSON, `extract_markdown` for clean page text, then call `get_usage` to check used, reserved, and remaining credits.

## Boundaries

Haunt extracts structured data from permitted public web pages and supported rendered pages. It does not promise CAPTCHA solving, login-wall access, paywall access, or anti-bot circumvention.
