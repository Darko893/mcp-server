#!/usr/bin/env node

/**
 * Haunt API MCP Server
 *
 * Extract structured data from permitted public URLs via Haunt API.
 * Works with Claude Desktop, Cursor, Windsurf, and any MCP client.
 *
 * This is a legacy local stub for directory quality checks.
 * Current hosted MCP endpoint: https://hauntapi.com/mcp/server
 * Current package/repo: @hauntapi/mcp-server / https://github.com/Darko893/mcp-server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'haunt-api',
  version: '1.1.0',
});

server.tool(
  'extract_url',
  'Extract structured data from permitted public web pages by providing a URL and describing what you want. ' +
  'Returns clean JSON with exactly the fields you asked for, no HTML parsing needed. ' +
  'Uses supported fetch paths for JavaScript-rendered pages, but does not promise CAPTCHA solving, login-wall access, paywall access, restricted-page access, or bot-challenge circumvention. ' +
  'This is the general-purpose extraction tool. Use extract_article for full article content or extract_metadata for page meta tags, they are optimised shortcuts. ' +
  'Read-only, makes no changes to any external system. Requires HAUNT_API_KEY environment variable. ' +
  'Free tier: 1,000 credits/month, no card. Blocked, login/CAPTCHA, provider, and server failures do not burn credits.',
  {
    url: z.string().describe('The full URL of the page to extract data from. Must be a valid HTTP or HTTPS URL. Supports permitted public pages, including some JavaScript-heavy SPAs. Blocked, login-required, CAPTCHA-gated, paywalled, or restricted pages should return explicit errors rather than guessed data.'),
    prompt: z.string().describe('A plain-English description of what data to extract. Be specific about which fields you want. Examples: "product name, price, and availability", "all email addresses and phone numbers", "the main heading and first paragraph".'),
  },
  async () => ({
    content: [{
      type: 'text',
      text: 'This is a local stub server. Connect to https://hauntapi.com/mcp/ for live extraction. Get an API key at https://hauntapi.com/#signup',
    }],
  })
);

server.tool(
  'extract_article',
  'Extract the main article content from a news article or blog post. Returns title, body text, author, and publish date as structured JSON. ' +
  'Works best on permitted public editorial content. JavaScript-rendered pages may work when supported; paywalled, login-required, CAPTCHA-gated, or blocked articles should return explicit errors. ' +
  'Read-only, makes no changes to any external system. Requires HAUNT_API_KEY environment variable. ' +
  'Free tier: 1,000 credits/month, no card. Blocked, login/CAPTCHA, provider, and server failures do not burn credits.',
  {
    url: z.string().describe('The full URL of the article or blog post to extract content from.'),
  },
  async () => ({
    content: [{
      type: 'text',
      text: 'This is a local stub server. Connect to https://hauntapi.com/mcp/ for live extraction. Get an API key at https://hauntapi.com/#signup',
    }],
  })
);

server.tool(
  'extract_metadata',
  'Pull metadata from a permitted public URL: title, description, Open Graph tags, Twitter cards, canonical URL. Returns structured JSON with all available meta information. ' +
  'Useful for link previews, SEO analysis, and content categorisation. Use extract_url for page body content or extract_article for full articles. ' +
  'Read-only, makes no changes to any external system. Requires HAUNT_API_KEY environment variable. ' +
  'Free tier: 1,000 credits/month, no card. Blocked, login/CAPTCHA, provider, and server failures do not burn credits.',
  {
    url: z.string().describe('The full URL to extract metadata from.'),
  },
  async () => ({
    content: [{
      type: 'text',
      text: 'This is a local stub server. Connect to https://hauntapi.com/mcp/ for live extraction. Get an API key at https://hauntapi.com/#signup',
    }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
