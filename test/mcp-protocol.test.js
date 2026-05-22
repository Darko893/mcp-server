import assert from "node:assert/strict";
import test from "node:test";

import { TOOLS, handleToolCall } from "../index.js";

test("tools/list exposes a no-key activation demo before paid extraction tools", () => {
  const names = TOOLS.map((tool) => tool.name);

  assert.equal(names[0], "try_demo_extract");
  assert.ok(names.includes("extract_url"));
  assert.match(TOOLS[0].description, /no API key/i);
  assert.match(TOOLS[0].description, /100 successful requests/i);
});

test("try_demo_extract returns activation links without requiring HAUNT_API_KEY", async () => {
  const response = await handleToolCall("try_demo_extract", {});

  assert.equal(response.isError, undefined);
  const payload = JSON.parse(response.content[0].text);
  assert.equal(payload.demo_url, "https://hauntapi.com/v1/demo/extract");
  assert.equal(payload.signup_url, "https://hauntapi.com/#signup");
  assert.equal(payload.free_tier, "100 successful requests/month");
});

test("live extraction tools fail locally with a signup path when HAUNT_API_KEY is missing", async () => {
  await assert.rejects(
    () => handleToolCall("extract_url", { url: "https://example.com", prompt: "title" }),
    /Missing HAUNT_API_KEY.*try_demo_extract.*100 successful requests\/month/
  );
});
