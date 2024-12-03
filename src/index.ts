#!/usr/bin/env node
import { RequestManager, HTTPTransport, Client } from "@open-rpc/client-js";

/**
 * This is an OpenRPC server that provides JSON-RPC functionality.
 * It allows:
 * - Discovering JSON-RPC methods via rpc.discover
 * - Calling arbitrary JSON-RPC methods
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Create an MCP server with capabilities for tools and prompts
 * to interact with JSON-RPC servers
 */
const server = new Server(
  {
    name: "openrpc",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler that lists available tools.
 * Exposes two tools:
 * - rpc_call: For calling arbitrary JSON-RPC methods
 * - rpc_discover: For discovering available methods on a server
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "rpc_call",
        description: "Call any JSON-RPC method on a server with parameters. A user would prompt: Call method <method> on <server url> with params <params>",
        inputSchema: {
          type: "object",
          properties: {
            server: {
              type: "string", 
              description: "Server URL"
            },
            method: {
              type: "string",
              description: "JSON-RPC method name to call"
            },
            params: {
              oneOf: [
                { type: "array" },
                { type: "object" }
              ],
              description: "Parameters to pass to the method"
            }
          },
          required: ["server", "method"]
        }
      },
      {
        name: "rpc_discover",
        description: "This uses JSON-RPC to call `rpc.discover` which is part of the OpenRPC Specification for discovery for JSON-RPC servers. A user would prompt: What JSON-RPC methods does this server have? <server url>",
        inputSchema: {
          type: "object",
          properties: {
            server: {
              type: "string",
              description: "Server URL"
            },
          },
          required: ["server"]
        }
      }
    ]
  };
});

/**
 * Handler for JSON-RPC tools.
 * Handles both method discovery and arbitrary method calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {

  switch (request.params.name) {
    case "rpc_call": {
      const server = String(request.params.arguments?.server);
      const method = String(request.params.arguments?.method);
      const params = request.params.arguments?.params;
      let transport = new HTTPTransport(server);
      let client = new Client(new RequestManager([transport]));
      const results = await client.request({ method: method, params: params as any});
      return {
        toolResult: {
          content: [{
            type: "text",
            text: JSON.stringify(results, null, 2)
          }],
          isError: false
        }
      };
    }
    case "rpc_discover": {
      const server = String(request.params.arguments?.server);
      if (!server) {
        throw new Error("Server is required");
      }
      let transport = new HTTPTransport(server);
      let client = new Client(new RequestManager([transport]));
      const results = await client.request({ method: "rpc.discover" });

      return  {
        toolResult: {
          content: [{
            type: "text",
            text: JSON.stringify(results, null, 2)
          }],
          isError: false
        }
      };
    }

    default:
      throw new Error("Unknown tool");
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
