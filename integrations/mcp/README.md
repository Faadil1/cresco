# CRESCO MCP server: an AI agent as the operator

This server gives an AI agent (Claude, or any MCP client) the **operator** role of one CRESCO workspace, and nothing more:

- act alone inside the standing mandate (swaps under the per-action limit run immediately on Solana Devnet);
- above the limit, file **one exact exception request** for the principal, then wait for the decision;
- read the mandate and the history with Explorer receipts.

The agent has no tool to approve, raise its limits, pause or revoke. Those need the principal. In principal-wallet mode they also need the principal's own wallet signature. The limit itself is enforced by the CRESCO program on Solana, not by this server or by the model's instructions.

## Tools

| Tool | What it does |
| --- | --- |
| `cresco_get_mandate` | Standing limit, period cap, period used, status |
| `cresco_submit_intent` | `ALLOW` (executed), `PENDING_PRINCIPAL` (one exact request filed), `REFUSE` (hard boundary, no exception), `UNKNOWN` (do not resubmit) |
| `cresco_get_request` | Status of one exception request |
| `cresco_wait_for_decision` | Waits up to 120 s for the principal |
| `cresco_history` | Recent events with receipts |

## Run it

Create a workspace on the desk, then copy the **operator** token.

Claude Code:

```bash
claude mcp add cresco-operator \
  -e CRESCO_API_URL=https://<your-api-worker>.workers.dev \
  -e CRESCO_WORKSPACE_ID=ws-... \
  -e CRESCO_OPERATOR_TOKEN=wf_operator_... \
  -- node /path/to/cresco/integrations/mcp/cresco-mcp.mjs
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "cresco-operator": {
      "command": "node",
      "args": ["/path/to/cresco/integrations/mcp/cresco-mcp.mjs"],
      "env": {
        "CRESCO_API_URL": "https://<your-api-worker>.workers.dev",
        "CRESCO_WORKSPACE_ID": "ws-...",
        "CRESCO_OPERATOR_TOKEN": "wf_operator_..."
      }
    }
  }
}
```

Try: "Check my CRESCO mandate, swap 0.30, then swap 0.75." The first swap executes. The second becomes a request on the principal's desk. Approve it there and the agent sees `EXECUTED`, with the standing limit unchanged.

## Status

LOCAL. Covered by `test/worlds-fair-mcp.test.mjs` (real workflow and HTTP router, fake chain) and a stdio smoke run against a local API. It has not yet been run against the live Devnet API from this environment.
