import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

function readOneMcpResponse(stdout, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("timed out waiting for MCP response"));
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timeout);
      stdout.off("data", onData);
    }
    function onData(chunk) {
      buffer += chunk.toString();
      const crlf = buffer.indexOf("\r\n\r\n");
      const lf = buffer.indexOf("\n\n");
      const index = crlf !== -1 && (lf === -1 || crlf < lf) ? crlf : lf;
      const length = index === crlf ? 4 : 2;
      if (index === -1) return;
      const header = buffer.slice(0, index);
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) return;
      const start = index + length;
      const end = start + Number.parseInt(match[1], 10);
      if (buffer.length < end) return;
      cleanup();
      resolve(JSON.parse(buffer.slice(start, end)));
    }
    stdout.on("data", onData);
  });
}

function framed(payload, separator) {
  const body = JSON.stringify(payload);
  return `Content-Length: ${Buffer.byteLength(body)}${separator}${body}`;
}

test("stdio MCP handler accepts LF-only message header separator", async () => {
  const child = spawn(process.execPath, ["index.js"], {
    cwd: new URL("..", import.meta.url),
    stdio: ["pipe", "pipe", "pipe"],
  });
  try {
    const responsePromise = readOneMcpResponse(child.stdout);
    child.stdin.write(framed({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-proxy", version: "1.0.0" },
      },
    }, "\n\n"));
    const response = await responsePromise;
    assert.equal(response.id, 1);
    assert.equal(response.result.serverInfo.name, "haunt-api");
  } finally {
    child.kill();
  }
});

test("stdio MCP handler accepts JSONL transport used by mcp-proxy", async () => {
  const child = spawn(process.execPath, ["index.js"], {
    cwd: new URL("..", import.meta.url),
    stdio: ["pipe", "pipe", "pipe"],
  });
  try {
    const responsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("timed out waiting for JSONL MCP response")), 2000);
      child.stdout.once("data", (chunk) => {
        clearTimeout(timeout);
        resolve(JSON.parse(chunk.toString().trim()));
      });
    });
    child.stdin.write(JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "mcp-proxy", version: "6.4.3" },
      },
    }) + "\n");
    const response = await responsePromise;
    assert.equal(response.id, 1);
    assert.equal(response.result.serverInfo.name, "haunt-api");
  } finally {
    child.kill();
  }
});
