#!/usr/bin/env node
// CRESCO MCP server (stdio). Gives an AI agent the OPERATOR role of one CRESCO
// workspace: act inside the standing mandate, file one exact exception request,
// wait for the principal. It cannot approve or widen its own authority.
//
//   CRESCO_API_URL=https://keys-api-stocklana.<account>.workers.dev \
//   CRESCO_WORKSPACE_ID=ws-... CRESCO_OPERATOR_TOKEN=wf_operator_... \
//   node integrations/mcp/cresco-mcp.mjs
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { pathToFileURL } from 'node:url';

import { createCrescoOperatorTools } from '../../src/worlds-fair-mcp-tools.mjs';

export function createCrescoMcpServer(options) {
  const tools = createCrescoOperatorTools(options);
  const server = new Server({ name: 'cresco-operator', version: '0.4.0' }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }))
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((t) => t.name === request.params.name);
    if (!tool) return { isError: true, content: [{ type: 'text', text: `Unknown tool ${request.params.name}` }] };
    try {
      const result = await tool.run(request.params.arguments ?? {});
      return { isError: result.ok === false, content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return { isError: true, content: [{ type: 'text', text: `CRESCO API unreachable: ${String(error?.message ?? error)}. Nothing is claimed.` }] };
    }
  });
  return server;
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const server = createCrescoMcpServer({
    apiUrl: process.env.CRESCO_API_URL,
    workspaceId: process.env.CRESCO_WORKSPACE_ID,
    operatorToken: process.env.CRESCO_OPERATOR_TOKEN
  });
  await server.connect(new StdioServerTransport());
}
