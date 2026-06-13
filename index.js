#!/usr/bin/env node

/**
 * Haunt API MCP Server
 * 
 * Extract clean structured data from permitted public URLs using Haunt API.
 * Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.
 * 
 * Setup: add to your MCP client config:
 * {
 *   "mcpServers": {
 *     "haunt": {
 *       "command": "npx",
 *       "args": ["-y", "@hauntapi/mcp-server"],
 *       "env": { "HAUNT_API_KEY": "your-api-key" }
 *     }
 *   }
 * }
 * 
 * Free tier: 1,000 credits/month at https://hauntapi.com/#signup
 * Plans: Starter £19/10k credits, Pro £49/30k credits, Scale £99/80k credits
 */

import { realpathSync } from "node:fs";
import { stdin, stdout } from "node:process";
import { pathToFileURL } from "node:url";

const API_BASE = "https://hauntapi.com/v1";
const API_KEY = process.env.HAUNT_API_KEY || "";
const ACTIVATION = {
  demo_url: "https://hauntapi.com/v1/demo/extract",
  docs_url: "https://hauntapi.com/docs",
  signup_url: "https://hauntapi.com/#signup",
  pricing_url: "https://hauntapi.com/#pricing",
  mcp_info_url: "https://hauntapi.com/mcp/",
  free_tier: "1,000 credits/month",
  credit_model: "simple=1, normal_structured=2, browser_or_auth=4, heavy_or_screenshot=8, failed=0",
};

// Haunt API call
async function hauntExtract(url, prompt) {
  if (!API_KEY) {
    throw new Error(
      `Missing HAUNT_API_KEY. Try the no-key try_demo_extract tool first, then get a free key at ${ACTIVATION.signup_url}. Free tier: ${ACTIVATION.free_tier}.`
    );
  }

  const headers = { "Content-Type": "application/json" };
  headers["X-API-Key"] = API_KEY;

  const resp = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url, prompt }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Haunt API error (${resp.status}): ${err}`);
  }

  return resp.json();
}

// Tool definitions, descriptions optimized for agent marketplaces
const TOOLS = [
  {
    name: "try_demo_extract",
    description:
      "Try Haunt's fixed demo extraction without an API key. " +
      "Use this first when the user wants to verify the MCP package or see the activation path before signup. " +
      "Returns demo, docs, signup, pricing, and free-tier links. No API key required. Free tier: 1,000 credits/month.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "extract_url",
    description:
      "Extract structured data from permitted public web pages by providing a URL and describing what you want. " +
      "Returns clean JSON with exactly the fields you asked for, no HTML parsing needed. " +
      "Uses supported fetch paths for JavaScript-heavy pages and returns explicit error signals when blocked. It does not promise Cloudflare/CAPTCHA/login-wall/paywall bypass or anti-bot circumvention. " +
      "This is the general-purpose extraction tool. Use extract_article for full article content or extract_metadata for page meta tags instead, they are optimised shortcuts. " +
      "Read-only, makes no changes to any external system. Requires HAUNT_API_KEY environment variable. " +
      "Free tier: 1,000 credits/month. Returns an error if rate limit, credit quota, or API key is invalid.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full URL of the page to extract data from. Must be a valid HTTP or HTTPS URL. " +
            "Supports permitted public pages, including some JavaScript-heavy SPAs. Human-verification, login-required, CAPTCHA-gated, paywalled, and blocked pages return explicit errors rather than fabricated data.",
        },
        prompt: {
          type: "string",
          description:
            "A plain-English description of what data to extract from the page. Be specific about which fields you want. " +
            "Examples: 'product name, price, and availability', 'all email addresses and phone numbers', " +
            "'the main heading, first paragraph, and all image URLs'. The more specific, the more accurate the extraction.",
        },
      },
      required: ["url", "prompt"],
    },
  },
  {
    name: "extract_article",
    description:
      "Extract the main article content from a news article, blog post, or editorial page. " +
      "Returns a JSON object with: title (string), body (string, full article text), author (string or null), and published_date (string or null). " +
      "Use this instead of extract_url when you specifically need article content, it is a focused shortcut with consistent article fields. " +
      "Read-only, makes no changes to any external system. Requires HAUNT_API_KEY environment variable. " +
      "Free tier: 1,000 credits/month. Returns an error if rate limit, credit quota, or API key is invalid.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The URL of the article or blog post to extract. Must be a valid HTTP or HTTPS URL. " +
            "Works best on news articles, blog posts, and editorial content. For non-article pages, use extract_url instead.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "extract_metadata",
    description:
      "Extract page metadata from a public or authorised URL: title, meta description, Open Graph tags (og:title, og:description, og:image, og:url), " +
      "Twitter Card tags, canonical URL, and any other meta information present. " +
      "Returns a JSON object with all discovered meta tags grouped by type. " +
      "Use this instead of extract_url when you only need metadata, it is faster and returns a consistent schema. " +
      "Read-only, makes no changes to any external system. Requires HAUNT_API_KEY environment variable. " +
      "Free tier: 1,000 credits/month. Returns an error if rate limit, credit quota, or API key is invalid.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The URL to extract metadata from. Must be a valid HTTP or HTTPS URL. " +
            "Permitted public pages are supported, returns whatever meta tags are present in the HTML head.",
        },
      },
      required: ["url"],
    },
  },
];

function textContent(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

function demoToolResult() {
  return textContent({
    ...ACTIVATION,
    message: "Haunt's MCP package is installed. Use extract_url, extract_article, or extract_metadata with HAUNT_API_KEY for live extraction.",
    example_prompt: "Use Haunt to extract product name, price, availability, and review count from a public product page.",
  });
}

async function extractUrlTool(args) {
  return textContent(await hauntExtract(args.url, args.prompt));
}

async function extractArticleTool(args) {
  return textContent(await hauntExtract(
    args.url,
    "Extract the full article content including title, body text, author name, and publication date"
  ));
}

async function extractMetadataTool(args) {
  return textContent(await hauntExtract(
    args.url,
    "Extract all metadata: page title, meta description, Open Graph tags (og:title, og:description, og:image, og:url), Twitter card tags, canonical URL, and any other meta information"
  ));
}

const TOOL_HANDLERS = {
  try_demo_extract: demoToolResult,
  extract_url: extractUrlTool,
  extract_article: extractArticleTool,
  extract_metadata: extractMetadataTool,
};

// Handle tool calls
async function handleToolCall(name, args) {
  const handler = TOOL_HANDLERS[name];
  if (!handler) throw new Error(`Unknown tool: ${name}`);
  return handler(args);
}

// MCP protocol handler (stdio transport)
let buffer = "";

export { TOOLS, handleToolCall };

function nextBufferedMessage() {
  const headerEnd = buffer.indexOf("\r\n\r\n");
  if (headerEnd === -1) return null;
  const header = buffer.slice(0, headerEnd);
  const match = header.match(/Content-Length: (\d+)/);
  if (!match) return null;
  const messageStart = headerEnd + 4;
  const messageEnd = messageStart + parseInt(match[1]);
  if (buffer.length < messageEnd) return null;
  const message = buffer.slice(messageStart, messageEnd);
  buffer = buffer.slice(messageEnd);
  return message;
}

function processBufferedMessages() {
  let message = nextBufferedMessage();
  while (message) {
    try {
      handleRequest(JSON.parse(message));
    } catch (e) {
      // ignore parse errors
    }
    message = nextBufferedMessage();
  }
}

function startServer() {
  stdin.on("data", (chunk) => {
    buffer += chunk.toString();
    processBufferedMessages();
  });
}

function isMainModule() {
  try {
    return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  startServer();
}

function initializeResult(id) {
  send({
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "haunt-api", version: "1.0.6" },
    },
  });
}

function listToolsResult(id) {
  send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
}

async function callToolResult({ id, params }) {
  try {
    const result = await handleToolCall(params.name, params.arguments || {});
    send({ jsonrpc: "2.0", id, result });
  } catch (e) {
    send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true } });
  }
}

const REQUEST_HANDLERS = {
  initialize: ({ id }) => initializeResult(id),
  "notifications/initialized": () => {},
  "tools/list": ({ id }) => listToolsResult(id),
  "tools/call": callToolResult,
};

async function handleRequest(request) {
  const handler = REQUEST_HANDLERS[request.method];
  if (handler) {
    await handler(request);
    return;
  }
  send({ jsonrpc: "2.0", id: request.id, error: { code: -32601, message: `Method not found: ${request.method}` } });
}

function send(msg) {
  const data = JSON.stringify(msg);
  stdout.write(`Content-Length: ${Buffer.byteLength(data)}\r\n\r\n${data}`);
}
