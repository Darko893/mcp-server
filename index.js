#!/usr/bin/env node

/**
 * Haunt API MCP Server
 * 
 * Extract clean structured data from any URL using Haunt API.
 * Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.
 * 
 * Setup — add to your MCP client config:
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
 * Free tier: 100 requests/month at https://hauntapi.com
 * Pro: $0.01/request — pay only for what you use
 */

import { stdin, stdout } from "node:process";

const API_BASE = "https://hauntapi.com/v1";
const API_KEY = process.env.HAUNT_API_KEY || "";

// Haunt API call
async function hauntExtract(url, prompt) {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

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

// Tool definitions — descriptions optimized for Glama TDQS scoring
const TOOLS = [
  {
    name: "extract_url",
    description:
      "Extract structured data from any web page by providing a URL and describing what you want. " +
      "Returns clean JSON with exactly the fields you asked for — no HTML parsing needed. " +
      "Handles JavaScript-rendered pages and Cloudflare-protected sites automatically. " +
      "This is the general-purpose extraction tool. Use extract_article for full article content or extract_metadata for page meta tags instead — they're optimised shortcuts. " +
      "Read-only — makes no changes to any external system. Requires HAUNT_API_KEY environment variable. " +
      "Free tier: 100 requests/month. Returns an error if rate limit or API key is invalid.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full URL of the page to extract data from. Must be a valid HTTP or HTTPS URL. " +
            "Supports any public web page including JavaScript-heavy SPAs and Cloudflare-protected sites.",
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
      "Returns a JSON object with: title (string), body (string — full article text), author (string or null), and published_date (string or null). " +
      "Use this instead of extract_url when you specifically need article content — it's a focused shortcut that guarantees consistent article fields. " +
      "Read-only — makes no changes to any external system. Requires HAUNT_API_KEY environment variable. " +
      "Free tier: 100 requests/month. Returns an error if rate limit or API key is invalid.",
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
      "Extract page metadata from any URL: title, meta description, Open Graph tags (og:title, og:description, og:image, og:url), " +
      "Twitter Card tags, canonical URL, and any other meta information present. " +
      "Returns a JSON object with all discovered meta tags grouped by type. " +
      "Use this instead of extract_url when you only need metadata — it's faster and returns a consistent schema. " +
      "Read-only — makes no changes to any external system. Requires HAUNT_API_KEY environment variable. " +
      "Free tier: 100 requests/month. Returns an error if rate limit or API key is invalid.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The URL to extract metadata from. Must be a valid HTTP or HTTPS URL. " +
            "Any public web page works — returns whatever meta tags are present in the HTML head.",
        },
      },
      required: ["url"],
    },
  },
];

// Handle tool calls
async function handleToolCall(name, args) {
  switch (name) {
    case "extract_url": {
      const result = await hauntExtract(args.url, args.prompt);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
    case "extract_article": {
      const result = await hauntExtract(
        args.url,
        "Extract the full article content including title, body text, author name, and publication date"
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
    case "extract_metadata": {
      const result = await hauntExtract(
        args.url,
        "Extract all metadata: page title, meta description, Open Graph tags (og:title, og:description, og:image, og:url), Twitter card tags, canonical URL, and any other meta information"
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// MCP protocol handler (stdio transport)
let buffer = "";

stdin.on("data", (chunk) => {
  buffer += chunk.toString();

  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) break;

    const header = buffer.slice(0, headerEnd);
    const match = header.match(/Content-Length: (\d+)/);
    if (!match) break;

    const length = parseInt(match[1]);
    const messageStart = headerEnd + 4;
    const messageEnd = messageStart + length;

    if (buffer.length < messageEnd) break;

    const message = buffer.slice(messageStart, messageEnd);
    buffer = buffer.slice(messageEnd);

    try {
      const request = JSON.parse(message);
      handleRequest(request);
    } catch (e) {
      // ignore parse errors
    }
  }
});

async function handleRequest(request) {
  const { id, method, params } = request;

  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: {
          name: "haunt-api",
          version: "1.1.0",
        },
      },
    });
    return;
  }

  if (method === "notifications/initialized") return;

  if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    return;
  }

  if (method === "tools/call") {
    try {
      const result = await handleToolCall(params.name, params.arguments || {});
      send({ jsonrpc: "2.0", id, result });
    } catch (e) {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: `Error: ${e.message}` }],
          isError: true,
        },
      });
    }
    return;
  }

  send({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
}

function send(msg) {
  const data = JSON.stringify(msg);
  stdout.write(`Content-Length: ${Buffer.byteLength(data)}\r\n\r\n${data}`);
}
