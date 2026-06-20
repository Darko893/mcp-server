import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { TOOLS, handleRequest, handleToolCall } from "../index.js";

test("tools/list exposes a no-key activation demo before paid extraction tools", () => {
  const names = TOOLS.map((tool) => tool.name);

  assert.equal(names[0], "try_demo_extract");
  assert.ok(names.includes("extract"));
  assert.ok(names.includes("extract_url"));
  assert.ok(names.includes("extract_markdown"));
  assert.ok(names.includes("get_usage"));
  assert.match(TOOLS[0].description, /no API key/i);
  assert.match(TOOLS[0].description, /1,000 credits/i);
});

test("get_usage is discoverable as read-only account telemetry", () => {
  const usage = TOOLS.find((tool) => tool.name === "get_usage");
  assert.ok(usage);
  assert.deepEqual(usage.inputSchema.properties, {});
  assert.match(usage.description, /monthly credit/i);
  assert.match(usage.description, /reserved credits/i);
});

test("extract and extract_url expose markdown response format for agent workflows", () => {
  const extract = TOOLS.find((tool) => tool.name === "extract");
  assert.ok(extract);
  const extractUrl = TOOLS.find((tool) => tool.name === "extract_url");
  assert.ok(extractUrl);
  assert.deepEqual(
    extractUrl.inputSchema.properties.response_format.enum,
    ["json", "markdown", "md", "raw_html", "html"]
  );
  assert.match(extract.description, /Markdown/i);
  assert.match(extractUrl.description, /Markdown/i);
});

test("extract_markdown is discoverable as a dedicated MCP tool", () => {
  const extractMarkdown = TOOLS.find((tool) => tool.name === "extract_markdown");
  assert.ok(extractMarkdown);
  assert.deepEqual(Object.keys(extractMarkdown.inputSchema.properties), ["url"]);
  assert.match(extractMarkdown.description, /Markdown/i);
  assert.match(extractMarkdown.description, /RAG/i);
});

test("try_demo_extract returns activation links without requiring HAUNT_API_KEY", async () => {
  const response = await handleToolCall("try_demo_extract", {});

  assert.equal(response.isError, undefined);
  const payload = JSON.parse(response.content[0].text);
  assert.equal(payload.demo_url, "https://hauntapi.com/v1/demo/extract");
  assert.equal(payload.signup_url, "https://hauntapi.com/#signup");
  assert.equal(payload.free_tier, "1,000 credits/month");
});

test("live extraction tools fail locally with a signup path when HAUNT_API_KEY is missing", async () => {
  await assert.rejects(
    () => handleToolCall("extract", { url: "https://example.com", prompt: "title" }),
    /Missing HAUNT_API_KEY.*try_demo_extract.*1,000 credits\/month/
  );
  await assert.rejects(
    () => handleToolCall("extract_url", { url: "https://example.com", prompt: "title" }),
    /Missing HAUNT_API_KEY.*try_demo_extract.*1,000 credits\/month/
  );
});


test("initialize reports package version", async () => {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  let output = "";
  const previousWrite = process.stdout.write;
  process.stdout.write = (chunk) => { output += String(chunk); return true; };
  try {
    await handleRequest({ jsonrpc: "2.0", id: 42, method: "initialize" }, "jsonl");
  } finally {
    process.stdout.write = previousWrite;
  }
  const payload = JSON.parse(output.trim());
  assert.equal(payload.result.serverInfo.version, packageJson.version);
});
