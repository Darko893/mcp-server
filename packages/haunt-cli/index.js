#!/usr/bin/env node

import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

const VERSION = "1.0.0";
const MCP_PACKAGE = "@hauntapi/mcp-server";
const MCP_COMMAND = "npx";
const MCP_ARGS = ["-y", MCP_PACKAGE];
const API_BASE = "https://hauntapi.com";
const PLACEHOLDER_KEY = "PASTE_YOUR_KEY_HERE";
const SUPPORTED_CLIENTS = new Set(["generic", "claude", "cursor", "windsurf", "json"]);

function usage() {
  return `haunt-cli ${VERSION}

Usage:
  haunt-cli init [options]
  haunt-cli --help
  haunt-cli --version

Options:
  --key <key>         Put an API key into the printed MCP config.
  --client <name>     Target label: generic, claude, cursor, windsurf, json. Default: generic.
  --format <type>     Output format: text or json. Default: text.
  --base-url <url>    Haunt site base URL. Default: ${API_BASE}.
  -h, --help          Show help.
  -v, --version       Show version.

Examples:
  npx -y haunt-cli@latest init
  HAUNT_API_KEY=${PLACEHOLDER_KEY} npx -y haunt-cli@latest init
  npx -y haunt-cli@latest init --format json
`;
}

function parseArgs(argv) {
  const parsed = {
    command: null,
    key: process.env.HAUNT_API_KEY || "",
    client: "generic",
    format: "text",
    baseUrl: API_BASE,
    help: false,
    version: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "-h" || arg === "--help") {
      parsed.help = true;
    } else if (arg === "-v" || arg === "--version") {
      parsed.version = true;
    } else if (arg === "--key") {
      parsed.key = requireValue(argv, index, arg);
      index += 1;
    } else if (arg.startsWith("--key=")) {
      parsed.key = arg.slice("--key=".length);
    } else if (arg === "--client") {
      parsed.client = requireValue(argv, index, arg).toLowerCase();
      index += 1;
    } else if (arg.startsWith("--client=")) {
      parsed.client = arg.slice("--client=".length).toLowerCase();
    } else if (arg === "--format") {
      parsed.format = requireValue(argv, index, arg).toLowerCase();
      index += 1;
    } else if (arg.startsWith("--format=")) {
      parsed.format = arg.slice("--format=".length).toLowerCase();
    } else if (arg === "--base-url") {
      parsed.baseUrl = requireValue(argv, index, arg).replace(/\/$/, "");
      index += 1;
    } else if (arg.startsWith("--base-url=")) {
      parsed.baseUrl = arg.slice("--base-url=".length).replace(/\/$/, "");
    } else if (!parsed.command && !arg.startsWith("-")) {
      parsed.command = arg;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!parsed.command && !parsed.help && !parsed.version) {
    parsed.command = "init";
  }

  if (!SUPPORTED_CLIENTS.has(parsed.client)) {
    throw new Error(`Unsupported client: ${parsed.client}. Use generic, claude, cursor, windsurf, or json.`);
  }

  if (!["text", "json"].includes(parsed.format)) {
    throw new Error(`Unsupported format: ${parsed.format}. Use text or json.`);
  }

  return parsed;
}

function requireValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function buildMcpConfig(apiKey) {
  return {
    mcpServers: {
      haunt: {
        command: MCP_COMMAND,
        args: MCP_ARGS,
        env: {
          HAUNT_API_KEY: apiKey || PLACEHOLDER_KEY,
        },
      },
    },
  };
}

function buildInitPayload(options) {
  const apiKey = options.key || PLACEHOLDER_KEY;
  const mcpConfig = buildMcpConfig(apiKey);
  const baseUrl = options.baseUrl || API_BASE;
  return {
    name: "Haunt API",
    command: "haunt-cli init",
    client: options.client,
    mcp_package: MCP_PACKAGE,
    mcp_command: `${MCP_COMMAND} ${MCP_ARGS.join(" ")}`,
    mcp_config: mcpConfig,
    next_steps: [
      "Paste the MCP config into Claude, Cursor, Windsurf, or another MCP-compatible client.",
      "Use the try_demo_extract tool first. It works without spending credits.",
      "Use extract_url, extract_article, or extract_metadata for live extraction after adding HAUNT_API_KEY.",
    ],
    links: {
      signup: `${baseUrl}/#signup`,
      docs: `${baseUrl}/docs`,
      agents: `${baseUrl}/agents`,
      demo: `${baseUrl}/demo`,
      mcp_discovery: `${baseUrl}/mcp`,
      openapi: `${baseUrl}/openapi.json`,
    },
    rest_fallback: `curl -sS ${baseUrl}/v1/extract -H "Content-Type: application/json" -H "X-API-Key: ${apiKey}" -d '{"url":"https://example.com","prompt":"Extract the page title"}'`,
    boundaries: [
      "Use only for permitted public pages or content you are authorised to access.",
      "Haunt does not promise CAPTCHA solving, login-wall bypass, paywall access, or anti-bot circumvention.",
      "Blocked, login-required, CAPTCHA-gated, or thin pages should fail clearly instead of returning fabricated data.",
    ],
  };
}

function renderText(payload) {
  return `Haunt API agent setup

MCP command used by the generated config:
  ${payload.mcp_command}

MCP config:
${JSON.stringify(payload.mcp_config, null, 2)}

Try first:
  Ask your agent to call try_demo_extract.

Then ask:
  Use Haunt to extract product name, price, and availability from a public product page.

REST fallback:
  ${payload.rest_fallback}

Links:
  Signup: ${payload.links.signup}
  Docs:   ${payload.links.docs}
  Agents: ${payload.links.agents}

Boundary:
  ${payload.boundaries[0]}
  ${payload.boundaries[1]}
`;
}

function run(argv = process.argv.slice(2), stdout = process.stdout, stderr = process.stderr) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      stdout.write(usage());
      return 0;
    }
    if (options.version) {
      stdout.write(`${VERSION}\n`);
      return 0;
    }
    if (options.command !== "init") {
      throw new Error(`Unknown command: ${options.command}. Use haunt-cli init.`);
    }

    const payload = buildInitPayload(options);
    if (options.format === "json") {
      stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    } else {
      stdout.write(renderText(payload));
    }
    return 0;
  } catch (error) {
    stderr.write(`haunt-cli: ${error.message}\n\n${usage()}`);
    return 1;
  }
}

function isMainModule() {
  try {
    return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  process.exitCode = run();
}

export { buildInitPayload, buildMcpConfig, parseArgs, renderText, run };
