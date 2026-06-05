# Haunt MCP Fallow health cleanup — 2026-06-05

## Scope

Local-only cleanup for `/root/haunt-mcp-server`, the canonical public MCP package repo.

Touched files:

- `index.js`

No npm publish, GitHub push, package release, deploy, or public directory submission was performed.

## Changes

- Replaced branch-heavy tool dispatch with a `TOOL_HANDLERS` map and small tool helpers.
- Replaced branch-heavy JSON-RPC request dispatch with a `REQUEST_HANDLERS` map and small response helpers.
- Split stdio buffer parsing into `nextBufferedMessage()` and `processBufferedMessages()`.
- Preserved tool names, descriptions, activation links, error messages, protocol responses, and exported `TOOLS` / `handleToolCall` contract.

## Verification

```text
npm test
3 passed

npx -y fallow@2.88.3 health --complexity --top 20 --format json --quiet --no-cache
functions_above_threshold: 0
severity_critical_count: 0
severity_high_count: 0
severity_moderate_count: 0
```

Fresh Haunt MCP-only audit:

- `/root/reference/code-audits/fallow-pattern-audit-20260605T085851Z/README.md`
- Fallow dead-code total issues: `0`
- Fallow health functions above threshold: `0`
- JSCPD duplicates: `0`
- Prioritized findings: none
