# haunt-cli

One-command Haunt setup for agents and MCP clients.

```bash
npx -y @hauntapi/cli@latest init
```

With a key:

```bash
HAUNT_API_KEY=PASTE_YOUR_KEY_HERE npx -y @hauntapi/cli@latest init
```

Or:

```bash
npx -y @hauntapi/cli@latest init --key PASTE_YOUR_KEY_HERE
```

The command prints a copy-paste MCP config for Claude, Cursor, Windsurf, and other MCP-compatible clients. It does not edit local config files for you.

## JSON output

```bash
npx -y @hauntapi/cli@latest init --format json
```

## What it installs

The generated config uses the public MCP server package:

```bash
npx -y @hauntapi/mcp-server
```

Use the `try_demo_extract` MCP tool first. It works without spending credits. Real extraction needs a Haunt API key from https://hauntapi.com/#signup.

## Boundaries

Haunt extracts structured data from permitted public web pages and supported rendered pages. It does not promise CAPTCHA solving, login-wall bypass, paywall access, or anti-bot circumvention.
