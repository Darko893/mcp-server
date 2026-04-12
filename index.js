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

// Tool definitions
const TOOLS = [
  {
    name: "extract_url",
    description:
      "Extract clean, structured data from any URL. Returns JSON with the data you asked for. " +
      "Handles JavaScript rendering and Cloudflare-protected sites automatically. " +
      "You must describe what data you want in the prompt parameter.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description: "The URL to extract data from",
        },
        prompt: {
          type: "string",
          description:
            'What data to extract, in plain English. E.g. "product price and title", ' +
            '"full article body and author", "all contact information", "meta description and OG tags"',
        },
      },
      required: ["url", "prompt"],
    },
  },
  {
    name: "extract_article",
    description:
      "Extract the main article content from a URL: title, body text, author, and publish date.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description: "The article URL to extract",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "extract_metadata",
    description:
      "Extract metadata from a URL: title, description, Open Graph tags, Twitter cards, canonical URL.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description: "The URL to extract metadata from",
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
          version: "1.0.0",
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
