# Haunt API MCP Server

This repository provides connection details and documentation for the Haunt API MCP server, a hosted web extraction service for AI agents.

**This is not self-hosted software.** The MCP server runs at `hauntapi.com` and is accessed remotely. No local installation required.

## Quick Start

1. Get your API key at [hauntapi.com](https://hauntapi.com/#signup) (free tier available)
2. Add the MCP config to your client (see [README.md](./README.md))
3. Use `web_extract` with a permitted public URL and a description of what you want

## Transport Endpoints

- **SSE:** `https://hauntapi.com/sse` (for Claude Desktop)
- **Streamable HTTP:** `https://hauntapi.com/mcp/` (for Cursor, Windsurf, VS Code)

## Directory Listings

This repository exists so MCP directories (Smithery, Glama, mcp.so) can index Haunt API. The actual server and all extraction infrastructure runs on our hosted platform.

For full documentation, visit [hauntapi.com/docs](https://hauntapi.com/docs).
