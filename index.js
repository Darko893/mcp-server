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

import { readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { stdin, stdout } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const API_BASE = "https://hauntapi.com/v1";
const API_KEY = process.env.HAUNT_API_KEY || "";
const PACKAGE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_VERSION = JSON.parse(readFileSync(join(PACKAGE_DIR, "package.json"), "utf8")).version;
const ACTIVATION = {
  demo_url: "https://hauntapi.com/v1/demo/extract",
  docs_url: "https://hauntapi.com/docs",
  signup_url: "https://hauntapi.com/#signup",
  pricing_url: "https://hauntapi.com/#pricing",
  mcp_info_url: "https://hauntapi.com/mcp/",
  free_tier: "1,000 credits/month",
  credit_model: "simple=1, normal_structured=2, browser_or_auth=4, heavy_or_screenshot=8, failed=0",
};

const DEMO_EXTRACT_SAMPLE = {
  demo_only: true,
  no_signup_required: true,
  no_remote_fetch_performed: true,
  success: true,
  message: "This is a fixed no-key Haunt demo response. Add HAUNT_API_KEY for live extraction from your own URLs.",
  data: {
    headline: "The easiest way to get data off the web.",
    promise: "Haunt reads permitted public web pages and returns structured JSON or clean Markdown for apps and AI agents.",
    free_allowance: "1,000 credits/month",
    primary_cta: "Get a free key",
  },
  trace: {
    fetch: { source: "demo_fixture", status_code: 200 },
    extraction: { mode: "fixed_demo", confidence: 1.0 },
    summary: "No remote page was fetched and no credits were used.",
  },
};

// Haunt API call
function normalizedResponseFormat(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const normalized = String(value).toLowerCase().trim().replace(/-/g, "_");
  const aliases = {
    json: "json",
    structured: "json",
    structured_json: "json",
    markdown: "markdown",
    md: "markdown",
    raw_html: "raw_html",
    html: "raw_html",
  };
  if (!aliases[normalized]) {
    throw new Error("response_format must be json, markdown, or raw_html");
  }
  return aliases[normalized];
}

async function hauntExtract(url, prompt, options = {}) {
  if (!API_KEY) {
    throw new Error(
      `Missing HAUNT_API_KEY. Try the no-key try_demo_extract tool first, then get a free key at ${ACTIVATION.signup_url}. Free tier: ${ACTIVATION.free_tier}.`
    );
  }

  const headers = { "Content-Type": "application/json" };
  headers["X-API-Key"] = API_KEY;
  const body = { url, prompt };
  const responseFormat = normalizedResponseFormat(options.response_format);
  if (responseFormat) body.response_format = responseFormat;
  if (options.device) body.device = options.device;
  if (options.js_scenario) body.js_scenario = options.js_scenario;

  const resp = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Haunt API error (${resp.status}): ${err}`);
  }

  return resp.json();
}

async function hauntUsage() {
  if (!API_KEY) {
    throw new Error(
      `Missing HAUNT_API_KEY. Try the no-key try_demo_extract tool first, then get a free key at ${ACTIVATION.signup_url}. Free tier: ${ACTIVATION.free_tier}.`
    );
  }

  const resp = await fetch(`${API_BASE}/extract/usage`, {
    headers: { "X-API-Key": API_KEY },
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
    name: "extract",
    description:
      "Extract structured data from permitted public web pages by providing a URL and describing what you want. " +
      "Returns clean JSON with exactly the fields you asked for by default. Can also return clean Markdown or raw HTML when response_format is set. " +
      "Uses supported fetch paths for JavaScript-heavy pages and returns explicit error signals when blocked. It does not solve CAPTCHA, access login/paywall-only pages, or circumvent anti-bot controls. " +
      "This is the general-purpose extraction tool and alias for extract_url. Use extract_markdown for LLM/RAG-ready Markdown, extract_article for full article content, or extract_metadata for page meta tags instead, they are optimised shortcuts. " +
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
        response_format: {
          type: "string",
          enum: ["json", "markdown", "md", "raw_html", "html"],
          description:
            "Optional output mode. Leave blank or use json for structured extraction. Use markdown/md when you want clean page text for an agent, RAG pipeline, or .md file. Use raw_html/html only when you need the fetched HTML.",
        },
        device: {
          type: "string",
          enum: ["mobile", "desktop"],
          description: "Optional. Render with a mobile or desktop browser profile (user agent and viewport). Forces browser rendering.",
        },
        js_scenario: {
          type: "array",
          items: { type: "object" },
          description: "Paid plans only. Up to 10 scripted browser steps run before extraction. Each step is an object {action: wait|wait_for|click|scroll|fill}: wait needs ms, wait_for/click/fill need selector, scroll needs pixels, fill needs text.",
        },
      },
      required: ["url", "prompt"],
    },
  },
  {
    name: "extract_url",
    description:
      "Extract structured data from permitted public web pages by providing a URL and describing what you want. " +
      "Returns clean JSON with exactly the fields you asked for by default. Can also return clean Markdown or raw HTML when response_format is set. " +
      "Uses supported fetch paths for JavaScript-heavy pages and returns explicit error signals when blocked. It does not solve CAPTCHA, access login/paywall-only pages, or circumvent anti-bot controls. " +
      "This is the general-purpose extraction tool. Use extract_markdown for LLM/RAG-ready Markdown, extract_article for full article content, or extract_metadata for page meta tags instead, they are optimised shortcuts. " +
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
        response_format: {
          type: "string",
          enum: ["json", "markdown", "md", "raw_html", "html"],
          description:
            "Optional output mode. Leave blank or use json for structured extraction. Use markdown/md when you want clean page text for an agent, RAG pipeline, or .md file. Use raw_html/html only when you need the fetched HTML.",
        },
        device: {
          type: "string",
          enum: ["mobile", "desktop"],
          description: "Optional. Render with a mobile or desktop browser profile (user agent and viewport). Forces browser rendering.",
        },
        js_scenario: {
          type: "array",
          items: { type: "object" },
          description: "Paid plans only. Up to 10 scripted browser steps run before extraction. Each step is an object {action: wait|wait_for|click|scroll|fill}: wait needs ms, wait_for/click/fill need selector, scroll needs pixels, fill needs text.",
        },
      },
      required: ["url", "prompt"],
    },
  },
  {
    name: "extract_markdown",
    description:
      "Return clean Markdown from a permitted public web page for agents, RAG ingestion, notes, or .md files. " +
      "This is a low-cost non-LLM output mode when the page can be fetched cleanly. " +
      "Blocked, login-required, CAPTCHA-gated, paywalled, and too-thin pages return explicit errors instead of fabricated Markdown. " +
      "Read-only, makes no changes to any external system. Requires HAUNT_API_KEY environment variable.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full URL of the permitted public page to convert into clean Markdown. Must be a valid HTTP or HTTPS URL.",
        },
      },
      required: ["url"],
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
  {
    name: "get_usage",
    description:
      "Check current Haunt plan, monthly credit limit, used credits, reserved credits, and remaining credits. " +
      "Read-only. Requires HAUNT_API_KEY environment variable.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

function textContent(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

function demoToolResult() {
  return textContent({
    ...ACTIVATION,
    ...DEMO_EXTRACT_SAMPLE,
    next_steps: [
      "Inspect this fixed sample JSON and trace.",
      "Add HAUNT_API_KEY to your MCP client config.",
      "Call extract or extract_url for structured JSON, or extract_markdown for page text.",
      "Call get_usage after your first live extraction to see used, reserved, and remaining credits.",
    ],
    example_prompt: "Use Haunt to extract product name, price, availability, and review count from a public product page.",
    markdown_example: "Use Haunt extract_markdown on a public docs page and save the result as Markdown.",
  });
}

async function extractUrlTool(args) {
  return textContent(await hauntExtract(args.url, args.prompt, { response_format: args.response_format }));
}

async function extractMarkdownTool(args) {
  return textContent(await hauntExtract(
    args.url,
    "Return clean Markdown for the main visible page content. Preserve headings, paragraphs, lists, links, and code blocks when visible.",
    { response_format: "markdown" }
  ));
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

async function getUsageTool() {
  return textContent(await hauntUsage());
}

const TOOL_HANDLERS = {
  try_demo_extract: demoToolResult,
  extract: extractUrlTool,
  extract_url: extractUrlTool,
  extract_markdown: extractMarkdownTool,
  extract_article: extractArticleTool,
  extract_metadata: extractMetadataTool,
  get_usage: getUsageTool,
};

// Handle tool calls
async function handleToolCall(name, args) {
  const handler = TOOL_HANDLERS[name];
  if (!handler) throw new Error(`Unknown tool: ${name}`);
  return handler(args);
}

// MCP protocol handler (stdio transport)
let buffer = "";

export { TOOLS, handleRequest, handleToolCall };

function findHeaderBoundary() {
  const crlf = buffer.indexOf("\r\n\r\n");
  const lf = buffer.indexOf("\n\n");
  if (crlf === -1 && lf === -1) return null;
  if (crlf !== -1 && (lf === -1 || crlf < lf)) return { index: crlf, length: 4 };
  return { index: lf, length: 2 };
}

function nextBufferedMessage() {
  const boundary = findHeaderBoundary();
  if (boundary) {
    const header = buffer.slice(0, boundary.index);
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (match) {
      const messageStart = boundary.index + boundary.length;
      const messageEnd = messageStart + parseInt(match[1], 10);
      if (buffer.length < messageEnd) return null;
      const message = buffer.slice(messageStart, messageEnd);
      buffer = buffer.slice(messageEnd);
      return { message, responseMode: "framed" };
    }
  }

  const firstNonWhitespace = buffer.search(/\S/);
  if (firstNonWhitespace > 0) buffer = buffer.slice(firstNonWhitespace);
  if (!buffer.startsWith("{")) return null;
  const lineEnd = buffer.indexOf("\n");
  if (lineEnd === -1) return null;
  const message = buffer.slice(0, lineEnd).replace(/\r$/, "");
  buffer = buffer.slice(lineEnd + 1);
  return { message, responseMode: "jsonl" };
}

function processBufferedMessages() {
  let entry = nextBufferedMessage();
  while (entry) {
    try {
      handleRequest(JSON.parse(entry.message), entry.responseMode);
    } catch (e) {
      // ignore parse errors
    }
    entry = nextBufferedMessage();
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

function initializeResult(id, responseMode) {
  send({
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "haunt-api", version: PACKAGE_VERSION },
    },
  }, responseMode);
}

function listToolsResult(id, responseMode) {
  send({ jsonrpc: "2.0", id, result: { tools: TOOLS } }, responseMode);
}

async function callToolResult({ id, params }, responseMode) {
  try {
    const result = await handleToolCall(params.name, params.arguments || {});
    send({ jsonrpc: "2.0", id, result }, responseMode);
  } catch (e) {
    send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true } }, responseMode);
  }
}

const REQUEST_HANDLERS = {
  initialize: ({ id }, responseMode) => initializeResult(id, responseMode),
  "notifications/initialized": () => {},
  "tools/list": ({ id }, responseMode) => listToolsResult(id, responseMode),
  "tools/call": callToolResult,
};

async function handleRequest(request, responseMode = "framed") {
  const handler = REQUEST_HANDLERS[request.method];
  if (handler) {
    await handler(request, responseMode);
    return;
  }
  send({ jsonrpc: "2.0", id: request.id, error: { code: -32601, message: `Method not found: ${request.method}` } }, responseMode);
}

function send(msg, responseMode = "framed") {
  const data = JSON.stringify(msg);
  if (responseMode === "jsonl") {
    stdout.write(`${data}\n`);
    return;
  }
  stdout.write(`Content-Length: ${Buffer.byteLength(data)}\r\n\r\n${data}`);
}
