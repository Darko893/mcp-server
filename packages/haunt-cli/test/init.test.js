import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, "..", "index.js");

function run(args, options = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: "utf8",
    env: { ...process.env, HAUNT_API_KEY: "", ...(options.env || {}) },
  });
}

test("init prints one-command MCP setup with placeholder key", () => {
  const result = run(["init"]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Haunt API agent setup/);
  assert.match(result.stdout, /npx -y @hauntapi\/mcp-server/);
  assert.match(result.stdout, /PASTE_YOUR_KEY_HERE/);
  assert.match(result.stdout, /try_demo_extract/);
  assert.match(result.stdout, /https:\/\/hauntapi\.com\/agents/);
  assert.doesNotMatch(result.stdout, /undefined/);
});

test("init accepts HAUNT_API_KEY from environment", () => {
  const result = run(["init", "--format", "json"], { env: { HAUNT_API_KEY: "haunt_test_key" } });

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.mcp_config.mcpServers.haunt.env.HAUNT_API_KEY, "haunt_test_key");
  assert.match(payload.rest_fallback, /haunt_test_key/);
});

test("init accepts --key and prints JSON shape", () => {
  const result = run(["init", "--format=json", "--client", "cursor", "--key", "haunt_cli_test"]);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.client, "cursor");
  assert.equal(payload.command, "haunt-cli init");
  assert.equal(payload.mcp_package, "@hauntapi/mcp-server");
  assert.deepEqual(payload.mcp_config.mcpServers.haunt.args, ["-y", "@hauntapi/mcp-server"]);
  assert.equal(payload.mcp_config.mcpServers.haunt.env.HAUNT_API_KEY, "haunt_cli_test");
  assert.ok(payload.boundaries.some((line) => line.includes("CAPTCHA")));
});

test("help and version work", () => {
  const help = run(["--help"]);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /haunt-cli init/);

  const version = run(["--version"]);
  assert.equal(version.status, 0, version.stderr);
  assert.match(version.stdout, /^1\.0\.0\n$/);
});

test("unknown command fails clearly", () => {
  const result = run(["configure-everything"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown command: configure-everything/);
  assert.match(result.stderr, /Use haunt-cli init/);
});
