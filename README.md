# OpenRPC MCP Server

A Model Context Protocol (MCP) server that provides JSON-RPC functionality through [OpenRPC](https://open-rpc.org).

https://github.com/user-attachments/assets/3447175a-f921-4ded-8250-b611edb2fb67

## Features

### Tools

- `rpc_call` - Call arbitrary JSON-RPC methods
  - Specify server URL, method name, and parameters
  - Returns JSON-formatted results
- `rpc_discover` - Discover available JSON-RPC methods
  - Uses OpenRPC's `rpc.discover` specification
  - Lists all methods on a given server

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "openrpc": {
      "command": "npx",
      "args": ["-y", "openrpc-mcp-server"]
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
